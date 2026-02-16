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

    // Check if email already exists for this user
    const existingClient = await Client.findByEmailAndUserId(req.user.id, validatedData.email);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    // Create client
    const client = await Client.create(req.user.id, validatedData);

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
 * Get all clients for authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'active', limit = 100, offset = 0 } = req.query;

    const options = {
      status,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };

    const clients = await Client.findByUserId(req.user.id, options);

    res.json({
      success: true,
      data: clients,
      pagination: {
        limit: options.limit,
        offset: options.offset
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
    if (client.userId !== req.user.id) {
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

    if (client.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // If changing email, check if it's already used
    if (validatedData.email && validatedData.email !== client.email) {
      const existingClient = await Client.findByEmailAndUserId(req.user.id, validatedData.email);
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

    if (client.userId !== req.user.id) {
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
