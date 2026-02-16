/**
 * Invoice Model
 * 
 * Handles all database operations for the Invoice entity
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'invoices';

class Invoice {
  /**
   * Generate the next invoice number
   * 
   * @param {string} userId - User ID
   * @param {string} prefix - Invoice number prefix (default: INV)
   * @returns {Promise<string>} Generated invoice number
   */
  static async generateInvoiceNumber(userId, prefix = 'INV') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Get the highest sequence number for this month
    const lastInvoice = await db(TABLE_NAME)
      .where('user_id', userId)
      .orderBy('invoice_sequence', 'desc')
      .first();

    const sequence = (lastInvoice?.invoice_sequence || 0) + 1;
    const sequenceStr = String(sequence).padStart(5, '0');

    return `${prefix}-${year}${month}-${sequenceStr}`;
  }

  /**
   * Create a new invoice draft
   * 
   * @param {string} userId - User ID
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice object
   */
  static async create(userId, invoiceData) {
    const invoiceId = uuidv4();
    const invoiceNumber = await this.generateInvoiceNumber(userId, invoiceData.invoicePrefix || 'INV');

    // Calculate amounts
    const subtotalAmount = invoiceData.subtotalAmount || 0;
    const taxRate = invoiceData.taxRate || 20;
    const taxAmount = (subtotalAmount * taxRate) / 100;
    const totalAmount = subtotalAmount + taxAmount;

    const invoice = {
      id: invoiceId,
      user_id: userId,
      client_id: invoiceData.clientId,
      invoice_number: invoiceNumber,
      invoice_sequence: (await db(TABLE_NAME).where('user_id', userId).count('*').first()).count + 1,
      invoice_date: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : new Date(),
      due_date: invoiceData.dueDate ? new Date(invoiceData.dueDate) : this.getDefaultDueDate(),
      status: 'DRAFT',
      description: invoiceData.description || null,
      notes: invoiceData.notes || null,
      currency: invoiceData.currency || 'EUR',
      tax_rate: invoiceData.taxRate || 20,
      tax_amount: taxAmount,
      subtotal_amount: subtotalAmount,
      total_amount: totalAmount,
      paid_amount: 0,
      payment_terms: invoiceData.paymentTerms || null,
      payment_instructions: invoiceData.paymentInstructions || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db(TABLE_NAME).insert(invoice);

    return this.formatInvoiceResponse(invoice);
  }

  /**
   * Find invoice by ID
   * 
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object|null>} Invoice object or null
   */
  static async findById(invoiceId) {
    const invoice = await db(TABLE_NAME)
      .where('id', invoiceId)
      .where('deleted_at', null)
      .first();

    return invoice ? this.formatInvoiceResponse(invoice) : null;
  }

  /**
   * Find all invoices for a user
   * 
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of invoice objects
   */
  static async findByUserId(userId, options = {}) {
    const {
      status = null,
      limit = 100,
      offset = 0,
      orderBy = 'invoice_date',
      orderDir = 'desc'
    } = options;

    let query = db(TABLE_NAME)
      .where('user_id', userId)
      .where('deleted_at', null);

    if (status) {
      query = query.where('status', status);
    }

    const invoices = await query
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);

    return invoices.map(invoice => this.formatInvoiceResponse(invoice));
  }

  /**
   * Find invoice by invoice number and user ID
   * 
   * @param {string} userId - User ID
   * @param {string} invoiceNumber - Invoice number
   * @returns {Promise<Object|null>} Invoice object or null
   */
  static async findByInvoiceNumber(userId, invoiceNumber) {
    const invoice = await db(TABLE_NAME)
      .where('user_id', userId)
      .where('invoice_number', invoiceNumber)
      .where('deleted_at', null)
      .first();

    return invoice ? this.formatInvoiceResponse(invoice) : null;
  }

  /**
   * Update invoice
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated invoice object
   */
  static async update(invoiceId, updateData) {
    const cleanData = {};

    if (updateData.clientId !== undefined) cleanData.client_id = updateData.clientId;
    if (updateData.invoiceDate !== undefined) cleanData.invoice_date = new Date(updateData.invoiceDate);
    if (updateData.dueDate !== undefined) cleanData.due_date = new Date(updateData.dueDate);
    if (updateData.status !== undefined) cleanData.status = updateData.status;
    if (updateData.description !== undefined) cleanData.description = updateData.description;
    if (updateData.notes !== undefined) cleanData.notes = updateData.notes;
    if (updateData.currency !== undefined) cleanData.currency = updateData.currency;
    if (updateData.taxRate !== undefined) {
      cleanData.tax_rate = updateData.taxRate;
      // Recalculate tax if subtotal is present
      if (updateData.subtotalAmount !== undefined || await db(TABLE_NAME).where('id', invoiceId).first()) {
        const invoice = await db(TABLE_NAME).where('id', invoiceId).first();
        const subtotal = updateData.subtotalAmount !== undefined ? updateData.subtotalAmount : invoice.subtotal_amount;
        cleanData.tax_amount = (subtotal * updateData.taxRate) / 100;
        cleanData.total_amount = subtotal + cleanData.tax_amount;
      }
    }
    if (updateData.subtotalAmount !== undefined) {
      cleanData.subtotal_amount = updateData.subtotalAmount;
      // Recalculate amounts
      const invoice = await db(TABLE_NAME).where('id', invoiceId).first();
      const taxRate = updateData.taxRate !== undefined ? updateData.taxRate : invoice.tax_rate;
      cleanData.tax_amount = (updateData.subtotalAmount * taxRate) / 100;
      cleanData.total_amount = updateData.subtotalAmount + cleanData.tax_amount;
    }
    if (updateData.paidAmount !== undefined) cleanData.paid_amount = updateData.paidAmount;
    if (updateData.paymentTerms !== undefined) cleanData.payment_terms = updateData.paymentTerms;
    if (updateData.paymentInstructions !== undefined) cleanData.payment_instructions = updateData.paymentInstructions;
    if (updateData.paidDate !== undefined) cleanData.paid_date = updateData.paidDate ? new Date(updateData.paidDate) : null;

    cleanData.updated_at = new Date();

    await db(TABLE_NAME)
      .where('id', invoiceId)
      .update(cleanData);

    return this.findById(invoiceId);
  }

  /**
   * Delete invoice (soft delete)
   * 
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<void>}
   */
  static async delete(invoiceId) {
    await db(TABLE_NAME)
      .where('id', invoiceId)
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }

  /**
   * Change invoice status
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated invoice object
   */
  static async updateStatus(invoiceId, status) {
    await db(TABLE_NAME)
      .where('id', invoiceId)
      .update({
        status: status,
        updated_at: new Date()
      });

    return this.findById(invoiceId);
  }

  /**
   * Get default due date (30 days from now)
   * 
   * @returns {Date} Due date
   */
  static getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  /**
   * Format invoice response
   * 
   * @param {Object} invoice - Raw invoice object from database
   * @returns {Object} Formatted invoice object
   */
  static formatInvoiceResponse(invoice) {
    if (!invoice) return null;

    return {
      id: invoice.id,
      userId: invoice.user_id,
      clientId: invoice.client_id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      dueDate: invoice.due_date,
      paidDate: invoice.paid_date,
      status: invoice.status,
      description: invoice.description,
      notes: invoice.notes,
      currency: invoice.currency,
      taxRate: invoice.tax_rate,
      taxAmount: invoice.tax_amount,
      subtotalAmount: invoice.subtotal_amount,
      totalAmount: invoice.total_amount,
      paidAmount: invoice.paid_amount,
      paymentTerms: invoice.payment_terms,
      paymentInstructions: invoice.payment_instructions,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at
    };
  }
}

export default Invoice;
