/**
 * Client Routes
 * 
 * API endpoints for client management
 * Story: EPIC-2-001 - Create Client
 * Note: Initially created as supporting component for EPIC-1-001 (Create Invoice Draft)
 * Now completed as primary functionality for Story 7 (EPIC-2-001)
 */

import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import Client from '../models/client.js';

const router = express.Router();

// ===== VALIDATION SCHEMAS =====

const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  postalCode: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().default('France'),
  companyName: z.string().max(255).optional().nullable(),
  siret: z.string().length(14).optional().nullable(),
  vatNumber: z.string().max(20).optional().nullable(),
  contactPerson: z.string().max(255).optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable()
});

const updateClientSchema = createClientSchema.partial();

// ===== MIDDLEWARE =====

// Require authentication for all client routes
router.use(authenticateToken);

// ===== ROUTES =====

/**
 * POST /api/clients
 * Create a new client
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validatedData = createClientSchema.parse(req.body);

    // Debug: log the user from token
    console.log('POST /api/clients - User from token:', req.user);

    // Check if email already exists for this user
    const existingClient = await Client.findByEmailAndUserId(req.user.userId, validatedData.email);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    // Create client
    const client = await Client.create(req.user.userId, validatedData);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
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

    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client'
    });
  }
});

/**
 * GET /api/clients
 * Get all clients for authenticated user with pagination, search, and sorting
 * 
 * Query parameters:
 * - limit: Number of clients per page (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - search: Search term (searches in name, email, phone)
 * - sortBy: Field to sort by (name, created_at, updated_at; default: name)
 * - sortOrder: Sort order (asc, desc; default: asc)
 * - status: Filter by status (active, inactive, archived; default: active)
 */
router.get('/', async (req, res) => {
  try {
    const {
      status = 'active',
      limit = '20',
      offset = '0',
      search = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Parse and validate numeric values
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const options = {
      status,
      limit: parsedLimit,
      offset: parsedOffset,
      search: String(search).trim(),
      sortBy,
      sortOrder
    };

    const result = await Client.findByUserId(req.user.userId, options);

    res.json({
      success: true,
      data: result.clients,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        total: result.total,
        pages: Math.ceil(result.total / parsedLimit)
      },
      filters: {
        search: options.search,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        status: options.status
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    });
  }
});

/**
 * GET /api/clients/:clientId
 * Get a specific client
 */
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client belongs to authenticated user
    if (client.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client'
    });
  }
});

/**
 * PATCH /api/clients/:clientId
 * Update a client
 */
router.patch('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate request body
    const validatedData = updateClientSchema.parse(req.body);

    // Check if client exists and belongs to user
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // If changing email, check if it's already used
    if (validatedData.email && validatedData.email !== client.email) {
      const existingClient = await Client.findByEmailAndUserId(req.user.userId, validatedData.email);
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Client with this email already exists'
        });
      }
    }

    // Update client
    const updatedClient = await Client.update(clientId, validatedData);

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
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

    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client'
    });
  }
});

/**
 * DELETE /api/clients/:clientId
 * Delete a client
 */
router.delete('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    // Check if client exists and belongs to user
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Delete client
    await Client.delete(clientId);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client'
    });
  }
});

export default router;
