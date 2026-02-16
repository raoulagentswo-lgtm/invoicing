/**
 * Invoice Routes
 * 
 * API endpoints for invoice management
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import Invoice from '../models/invoice.js';
import Client from '../models/client.js';

const router = express.Router();

// ===== VALIDATION SCHEMAS =====

const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().max(1000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  currency: z.string().length(3).default('EUR'),
  taxRate: z.number().min(0).max(100).default(20),
  subtotalAmount: z.number().min(0).default(0),
  paymentTerms: z.string().max(255).optional().nullable(),
  paymentInstructions: z.string().max(1000).optional().nullable(),
  invoicePrefix: z.string().max(10).default('INV')
});

const updateInvoiceSchema = z.object({
  clientId: z.string().uuid().optional(),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().max(1000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  currency: z.string().length(3).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  subtotalAmount: z.number().min(0).optional(),
  paymentTerms: z.string().max(255).optional().nullable(),
  paymentInstructions: z.string().max(1000).optional().nullable(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'CANCELLED', 'REFUNDED']).optional()
});

// ===== MIDDLEWARE =====

// Require authentication for all invoice routes
router.use(authenticateToken);

// ===== ROUTES =====

/**
 * POST /api/invoices
 * Create a new invoice draft
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validatedData = createInvoiceSchema.parse(req.body);

    // Check if client exists and belongs to user
    const client = await Client.findById(validatedData.clientId);
    if (!client || client.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Validate dates
    const invoiceDate = validatedData.invoiceDate ? new Date(validatedData.invoiceDate) : new Date();
    const dueDate = validatedData.dueDate 
      ? new Date(validatedData.dueDate) 
      : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days by default

    if (dueDate < invoiceDate) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be after invoice date'
      });
    }

    // Create invoice
    const invoice = await Invoice.create(req.user.id, {
      clientId: validatedData.clientId,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      description: validatedData.description,
      notes: validatedData.notes,
      currency: validatedData.currency,
      taxRate: validatedData.taxRate,
      subtotalAmount: validatedData.subtotalAmount,
      paymentTerms: validatedData.paymentTerms,
      paymentInstructions: validatedData.paymentInstructions,
      invoicePrefix: validatedData.invoicePrefix
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: {
        invoice,
        client: {
          id: client.id,
          name: client.name,
          email: client.email
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
});

/**
 * GET /api/invoices
 * Get all invoices for authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const options = {
      status: status || null,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };

    const invoices = await Invoice.findByUserId(req.user.id, options);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        limit: options.limit,
        offset: options.offset
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});

/**
 * GET /api/invoices/:invoiceId
 * Get a specific invoice
 */
router.get('/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { includeLineItems = true } = req.query;

    const invoice = await Invoice.findById(invoiceId, includeLineItems === 'true' || includeLineItems === true);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if invoice belongs to authenticated user
    if (invoice.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Fetch client information
    const client = await Client.findById(invoice.clientId);

    res.json({
      success: true,
      data: {
        invoice,
        client
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
});

/**
 * PATCH /api/invoices/:invoiceId
 * Update an invoice
 */
router.patch('/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Validate request body
    const validatedData = updateInvoiceSchema.parse(req.body);

    // Check if invoice exists and belongs to user
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // If changing client, verify it belongs to user
    if (validatedData.clientId && validatedData.clientId !== invoice.clientId) {
      const newClient = await Client.findById(validatedData.clientId);
      if (!newClient || newClient.userId !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
    }

    // Validate dates if provided
    if (validatedData.invoiceDate || validatedData.dueDate) {
      const invoiceDate = validatedData.invoiceDate 
        ? new Date(validatedData.invoiceDate) 
        : invoice.invoiceDate;
      const dueDate = validatedData.dueDate 
        ? new Date(validatedData.dueDate) 
        : invoice.dueDate;

      if (dueDate < invoiceDate) {
        return res.status(400).json({
          success: false,
          message: 'Due date must be after invoice date'
        });
      }
    }

    // Update invoice
    const updatedInvoice = await Invoice.update(invoiceId, validatedData);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice'
    });
  }
});

/**
 * DELETE /api/invoices/:invoiceId
 * Delete an invoice
 */
router.delete('/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Check if invoice exists and belongs to user
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Delete invoice
    await Invoice.delete(invoiceId);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice'
    });
  }
});

export default router;
