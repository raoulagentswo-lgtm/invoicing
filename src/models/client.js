/**
 * Client Model
 * 
 * Handles all database operations for the Client entity
 * Story: EPIC-2-001 - Create Client
 * Note: Initially created as supporting component for EPIC-1-001 (Create Invoice Draft)
 * Now completed as primary functionality for Story 7 (EPIC-2-001)
 */

import db from '../database/db.js';

const TABLE_NAME = 'clients';

class Client {
  /**
   * Create a new client
   * 
   * @param {string} userId - User ID
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client object
   */
  static async create(userId, clientData) {
    const clientData_db = {
      user_id: userId,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || null,
      address: clientData.address || null,
      postal_code: clientData.postalCode || null,
      city: clientData.city || null,
      country: clientData.country || 'France',
      company_name: clientData.companyName || null,
      siret: clientData.siret || null,
      vat_number: clientData.vatNumber || null,
      contact_person: clientData.contactPerson || null,
      contact_phone: clientData.contactPhone || null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    // PostgreSQL will auto-generate the ID with SERIAL
    const result = await db(TABLE_NAME).insert(clientData_db).returning('*');

    return this.formatClientResponse(result[0]);
  }

  /**
   * Find client by ID
   * 
   * @param {string} clientId - Client ID
   * @returns {Promise<Object|null>} Client object or null
   */
  static async findById(clientId) {
    const client = await db(TABLE_NAME)
      .where('id', clientId)
      .where('status', '!=', 'archived')
      .first();

    return client ? this.formatClientResponse(client) : null;
  }

  /**
   * Find all clients for a user with advanced filtering, sorting, and pagination
   * 
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { clients: [], total: number }
   */
  static async findByUserId(userId, options = {}) {
    const {
      status = 'active',
      limit = 20,
      offset = 0,
      search = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    // Validate sortBy and sortOrder
    const validSortFields = ['name', 'created_at', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'asc';

    let query = db(TABLE_NAME)
      .where('user_id', userId);

    if (status) {
      query = query.where('status', status);
    }

    // Add search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.where(function() {
        this
          .whereRaw('name ILIKE ?', [searchTerm])
          .orWhereRaw('email ILIKE ?', [searchTerm])
          .orWhereRaw('phone ILIKE ?', [searchTerm]);
      });
    }

    // Get total count before pagination
    const countResult = await query.clone().count('* as total').first();
    const total = parseInt(countResult.total, 10);

    // Get paginated results with sorting
    const clients = await query
      .orderBy(finalSortBy, finalSortOrder)
      .limit(limit)
      .offset(offset);

    return {
      clients: clients.map(client => this.formatClientResponse(client)),
      total: total
    };
  }

  /**
   * Find client by name and user ID
   * 
   * @param {string} userId - User ID
   * @param {string} name - Client name
   * @returns {Promise<Object|null>} Client object or null
   */
  static async findByNameAndUserId(userId, name) {
    const client = await db(TABLE_NAME)
      .where('user_id', userId)
      .where('name', name)
      .where('status', '!=', 'archived')
      .first();

    return client ? this.formatClientResponse(client) : null;
  }

  /**
   * Find client by email and user ID
   * 
   * @param {string} userId - User ID
   * @param {string} email - Client email
   * @returns {Promise<Object|null>} Client object or null
   */
  static async findByEmailAndUserId(userId, email) {
    const client = await db(TABLE_NAME)
      .where('user_id', userId)
      .where('email', email.toLowerCase())
      .where('status', '!=', 'archived')
      .first();

    return client ? this.formatClientResponse(client) : null;
  }

  /**
   * Update client
   * 
   * @param {string} clientId - Client ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated client object
   */
  static async update(clientId, updateData) {
    const cleanData = {};

    if (updateData.name !== undefined) cleanData.name = updateData.name;
    if (updateData.email !== undefined) cleanData.email = updateData.email.toLowerCase();
    if (updateData.phone !== undefined) cleanData.phone = updateData.phone;
    if (updateData.address !== undefined) cleanData.address = updateData.address;
    if (updateData.postalCode !== undefined) cleanData.postal_code = updateData.postalCode;
    if (updateData.city !== undefined) cleanData.city = updateData.city;
    if (updateData.country !== undefined) cleanData.country = updateData.country;
    if (updateData.companyName !== undefined) cleanData.company_name = updateData.companyName;
    if (updateData.siret !== undefined) cleanData.siret = updateData.siret;
    if (updateData.vatNumber !== undefined) cleanData.vat_number = updateData.vatNumber;
    if (updateData.contactPerson !== undefined) cleanData.contact_person = updateData.contactPerson;
    if (updateData.contactPhone !== undefined) cleanData.contact_phone = updateData.contactPhone;
    if (updateData.status !== undefined) cleanData.status = updateData.status;

    cleanData.updated_at = new Date();

    await db(TABLE_NAME)
      .where('id', clientId)
      .update(cleanData);

    return this.findById(clientId);
  }

  /**
   * Delete client (soft delete)
   * 
   * @param {string} clientId - Client ID
   * @returns {Promise<void>}
   */
  static async delete(clientId) {
    await db(TABLE_NAME)
      .where('id', clientId)
      .update({
        status: 'archived',
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }

  /**
   * Check if email exists for user
   * 
   * @param {string} userId - User ID
   * @param {string} email - Email to check
   * @param {string} excludeClientId - Client ID to exclude (for updates)
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExistsForUser(userId, email, excludeClientId = null) {
    let query = db(TABLE_NAME)
      .where('user_id', userId)
      .where('email', email.toLowerCase())
      .where('status', '!=', 'archived');

    if (excludeClientId) {
      query = query.where('id', '!=', excludeClientId);
    }

    const client = await query.first();
    return !!client;
  }

  /**
   * Format client response
   * 
   * @param {Object} client - Raw client object from database
   * @returns {Object} Formatted client object
   */
  static formatClientResponse(client) {
    if (!client) return null;

    return {
      id: client.id,
      userId: client.user_id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      postalCode: client.postal_code,
      city: client.city,
      country: client.country,
      companyName: client.company_name,
      siret: client.siret,
      vatNumber: client.vat_number,
      contactPerson: client.contact_person,
      contactPhone: client.contact_phone,
      status: client.status,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    };
  }
}

export default Client;
