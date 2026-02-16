/**
 * InvoiceStatusHistory Model
 * 
 * Tracks all invoice status transitions for audit and analytics
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'invoice_status_history';

class InvoiceStatusHistory {
  /**
   * Record a status transition
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {string} userId - User ID
   * @param {string} toStatus - New status
   * @param {string} fromStatus - Previous status (optional)
   * @param {string} reason - Reason for transition (optional)
   * @param {Object} metadata - Additional metadata (optional)
   * @returns {Promise<Object>} Created history record
   */
  static async recordTransition(invoiceId, userId, toStatus, fromStatus = null, reason = null, metadata = {}) {
    const record = {
      id: uuidv4(),
      invoice_id: invoiceId,
      user_id: userId,
      from_status: fromStatus,
      to_status: toStatus,
      reason: reason,
      metadata: metadata,
      created_at: new Date()
    };

    await db(TABLE_NAME).insert(record);

    return this.formatHistoryResponse(record);
  }

  /**
   * Get status history for an invoice
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of history records
   */
  static async getInvoiceHistory(invoiceId, options = {}) {
    const {
      limit = 100,
      offset = 0,
      orderDir = 'desc'
    } = options;

    const records = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .orderBy('created_at', orderDir)
      .limit(limit)
      .offset(offset);

    return records.map(record => this.formatHistoryResponse(record));
  }

  /**
   * Get user's status transitions
   * 
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of history records
   */
  static async getUserHistory(userId, options = {}) {
    const {
      limit = 100,
      offset = 0,
      orderDir = 'desc'
    } = options;

    const records = await db(TABLE_NAME)
      .where('user_id', userId)
      .orderBy('created_at', orderDir)
      .limit(limit)
      .offset(offset);

    return records.map(record => this.formatHistoryResponse(record));
  }

  /**
   * Get recent transitions for an invoice
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Array of recent history records
   */
  static async getRecentTransitions(invoiceId, limit = 5) {
    const records = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .orderBy('created_at', 'desc')
      .limit(limit);

    return records.map(record => this.formatHistoryResponse(record));
  }

  /**
   * Check if invoice has transitioned to a status
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - Status to check
   * @returns {Promise<boolean>} True if invoice has been in this status
   */
  static async hasBeenInStatus(invoiceId, status) {
    const record = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .where('to_status', status)
      .first();

    return !!record;
  }

  /**
   * Get last transition to a specific status
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - Status to check
   * @returns {Promise<Object|null>} Last transition or null
   */
  static async getLastTransitionToStatus(invoiceId, status) {
    const record = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .where('to_status', status)
      .orderBy('created_at', 'desc')
      .first();

    return record ? this.formatHistoryResponse(record) : null;
  }

  /**
   * Format history response
   * 
   * @param {Object} record - Raw history record
   * @returns {Object} Formatted record
   */
  static formatHistoryResponse(record) {
    if (!record) return null;

    return {
      id: record.id,
      invoiceId: record.invoice_id,
      userId: record.user_id,
      fromStatus: record.from_status,
      toStatus: record.to_status,
      reason: record.reason,
      metadata: record.metadata,
      createdAt: record.created_at
    };
  }
}

export default InvoiceStatusHistory;
