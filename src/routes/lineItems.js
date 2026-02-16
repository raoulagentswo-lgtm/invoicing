/**
 * Line Items Routes
 * 
 * API endpoints for line item management
 * Story: EPIC-1-002/003 - Line Items & Tax Calculations
 */

import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import LineItem from '../models/lineItem.js';
import Invoice from '../models/invoice.js';

const router = express.Router();

// ===== VALIDATION SCHEMAS =====

const createLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  taxRate: z.number().min(0).max(100).optional().default(20),
  taxIncluded: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional()
});

const updateLineItemSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxIncluded: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

// ===== MIDDLEWARE =====

// Require authentication for all line item routes
router.use(authenticateToken);

/**
 * Middleware to verify invoice ownership
 */
const verifyInvoiceOwnership = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if invoice belongs to authenticated user
    if (invoice.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    req.invoice = invoice;
    next();
  } catch (error) {
    console.error('Error in verifyInvoiceOwnership:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== ROUTES =====

/**
 * POST /api/invoices/:invoiceId/line-items
 * Add a new line item to an invoice
 */
router.post('/:invoiceId/line-items', verifyInvoiceOwnership, async (req, res) => {
  try {
    // Validate request body
    const validatedData = createLineItemSchema.parse(req.body);

    // Create line item
    const lineItem = await LineItem.create(req.params.invoiceId, validatedData);

    // Recalculate invoice totals
    const totals = await LineItem.calculateInvoiceTotals(req.params.invoiceId);
    
    // Update invoice with new totals
    await Invoice.update(req.params.invoiceId, {
      subtotalAmount: totals.subtotalAmount,
      taxAmount: totals.totalTaxAmount,
      totalAmount: totals.totalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Line item added successfully',
      data: {
        lineItem,
        invoiceTotals: totals
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

    console.error('Error creating line item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create line item'
    });
  }
});

/**
 * GET /api/invoices/:invoiceId/line-items
 * Get all line items for an invoice
 */
router.get('/:invoiceId/line-items', verifyInvoiceOwnership, async (req, res) => {
  try {
    const lineItems = await LineItem.findByInvoiceId(req.params.invoiceId);
    const totals = await LineItem.calculateInvoiceTotals(req.params.invoiceId);

    res.json({
      success: true,
      data: {
        lineItems,
        totals
      }
    });
  } catch (error) {
    console.error('Error fetching line items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch line items'
    });
  }
});

/**
 * GET /api/invoices/:invoiceId/line-items/:lineItemId
 * Get a specific line item
 */
router.get('/:invoiceId/line-items/:lineItemId', verifyInvoiceOwnership, async (req, res) => {
  try {
    const { lineItemId } = req.params;

    const lineItem = await LineItem.findById(lineItemId);

    if (!lineItem || lineItem.invoiceId !== req.params.invoiceId) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    res.json({
      success: true,
      data: lineItem
    });
  } catch (error) {
    console.error('Error fetching line item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch line item'
    });
  }
});

/**
 * PUT /api/invoices/:invoiceId/line-items/:lineItemId
 * Update a line item
 */
router.put('/:invoiceId/line-items/:lineItemId', verifyInvoiceOwnership, async (req, res) => {
  try {
    const { invoiceId, lineItemId } = req.params;

    // Validate request body
    const validatedData = updateLineItemSchema.parse(req.body);

    // Check if line item exists and belongs to invoice
    const lineItem = await LineItem.findById(lineItemId);

    if (!lineItem || lineItem.invoiceId !== invoiceId) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    // Update line item
    const updatedLineItem = await LineItem.update(lineItemId, validatedData);

    // Recalculate invoice totals
    const totals = await LineItem.calculateInvoiceTotals(invoiceId);
    
    // Update invoice with new totals
    await Invoice.update(invoiceId, {
      subtotalAmount: totals.subtotalAmount,
      taxAmount: totals.totalTaxAmount,
      totalAmount: totals.totalAmount
    });

    res.json({
      success: true,
      message: 'Line item updated successfully',
      data: {
        lineItem: updatedLineItem,
        invoiceTotals: totals
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

    console.error('Error updating line item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update line item'
    });
  }
});

/**
 * DELETE /api/invoices/:invoiceId/line-items/:lineItemId
 * Delete a line item
 */
router.delete('/:invoiceId/line-items/:lineItemId', verifyInvoiceOwnership, async (req, res) => {
  try {
    const { invoiceId, lineItemId } = req.params;

    // Check if line item exists and belongs to invoice
    const lineItem = await LineItem.findById(lineItemId);

    if (!lineItem || lineItem.invoiceId !== invoiceId) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    // Delete line item
    await LineItem.delete(lineItemId);

    // Recalculate invoice totals
    const totals = await LineItem.calculateInvoiceTotals(invoiceId);
    
    // Update invoice with new totals
    await Invoice.update(invoiceId, {
      subtotalAmount: totals.subtotalAmount,
      taxAmount: totals.totalTaxAmount,
      totalAmount: totals.totalAmount
    });

    res.json({
      success: true,
      message: 'Line item deleted successfully',
      data: {
        invoiceTotals: totals
      }
    });
  } catch (error) {
    console.error('Error deleting line item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete line item'
    });
  }
});

export default router;
