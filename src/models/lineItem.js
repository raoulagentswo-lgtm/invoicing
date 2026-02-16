/**
 * LineItem Model
 * 
 * Handles all database operations for the LineItem entity
 * Story: EPIC-1-002/003 - Line Items & Tax Calculations
 */

import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'line_items';

class LineItem {
  /**
   * Calculate line item amounts
   * 
   * @param {number} quantity - Item quantity
   * @param {number} unitPrice - Price per unit
   * @param {number} taxRate - Tax rate percentage
   * @param {boolean} taxIncluded - Whether tax is included in unit price
   * @returns {Object} Calculated amounts {amount, taxAmount, total}
   */
  static calculateAmounts(quantity, unitPrice, taxRate, taxIncluded = false) {
    const amount = quantity * unitPrice;
    
    let taxAmount = 0;
    let total = amount;

    if (!taxIncluded) {
      taxAmount = (amount * taxRate) / 100;
      total = amount + taxAmount;
    }

    return {
      amount: Math.round(amount * 100) / 100, // Round to 2 decimals
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Create a new line item
   * 
   * @param {string} invoiceId - Invoice ID
   * @param {Object} lineItemData - Line item data
   * @returns {Promise<Object>} Created line item object
   */
  static async create(invoiceId, lineItemData) {
    const lineItemId = uuidv4();

    // Get the next line order
    const lastLineItem = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .where('deleted_at', null)
      .orderBy('line_order', 'desc')
      .first();

    const lineOrder = (lastLineItem?.line_order || -1) + 1;

    // Calculate amounts
    const { amount, taxAmount, total } = this.calculateAmounts(
      lineItemData.quantity,
      lineItemData.unitPrice,
      lineItemData.taxRate || 20,
      lineItemData.taxIncluded || false
    );

    const lineItem = {
      id: lineItemId,
      invoice_id: invoiceId,
      description: lineItemData.description,
      quantity: lineItemData.quantity,
      unit_price: lineItemData.unitPrice,
      tax_included: lineItemData.taxIncluded || false,
      amount: amount,
      tax_amount: taxAmount,
      total: total,
      tax_rate: lineItemData.taxRate || 20,
      line_order: lineOrder,
      metadata: lineItemData.metadata || {},
      created_at: new Date(),
      updated_at: new Date()
    };

    await db(TABLE_NAME).insert(lineItem);

    return this.formatLineItemResponse(lineItem);
  }

  /**
   * Find line item by ID
   * 
   * @param {string} lineItemId - Line item ID
   * @returns {Promise<Object|null>} Line item object or null
   */
  static async findById(lineItemId) {
    const lineItem = await db(TABLE_NAME)
      .where('id', lineItemId)
      .where('deleted_at', null)
      .first();

    return lineItem ? this.formatLineItemResponse(lineItem) : null;
  }

  /**
   * Find all line items for an invoice
   * 
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Array>} Array of line item objects
   */
  static async findByInvoiceId(invoiceId) {
    const lineItems = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .where('deleted_at', null)
      .orderBy('line_order', 'asc');

    return lineItems.map(item => this.formatLineItemResponse(item));
  }

  /**
   * Update line item
   * 
   * @param {string} lineItemId - Line item ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated line item object
   */
  static async update(lineItemId, updateData) {
    const cleanData = {};

    if (updateData.description !== undefined) cleanData.description = updateData.description;
    if (updateData.quantity !== undefined) cleanData.quantity = updateData.quantity;
    if (updateData.unitPrice !== undefined) cleanData.unit_price = updateData.unitPrice;
    if (updateData.taxIncluded !== undefined) cleanData.tax_included = updateData.taxIncluded;
    if (updateData.taxRate !== undefined) cleanData.tax_rate = updateData.taxRate;

    // Recalculate amounts if quantity, unit_price, tax_rate, or tax_included changed
    if (
      updateData.quantity !== undefined ||
      updateData.unitPrice !== undefined ||
      updateData.taxRate !== undefined ||
      updateData.taxIncluded !== undefined
    ) {
      const currentItem = await db(TABLE_NAME).where('id', lineItemId).first();
      
      const quantity = updateData.quantity !== undefined ? updateData.quantity : currentItem.quantity;
      const unitPrice = updateData.unitPrice !== undefined ? updateData.unitPrice : currentItem.unit_price;
      const taxRate = updateData.taxRate !== undefined ? updateData.taxRate : currentItem.tax_rate;
      const taxIncluded = updateData.taxIncluded !== undefined ? updateData.taxIncluded : currentItem.tax_included;

      const { amount, taxAmount, total } = this.calculateAmounts(quantity, unitPrice, taxRate, taxIncluded);

      cleanData.amount = amount;
      cleanData.tax_amount = taxAmount;
      cleanData.total = total;
    }

    cleanData.updated_at = new Date();

    await db(TABLE_NAME)
      .where('id', lineItemId)
      .update(cleanData);

    return this.findById(lineItemId);
  }

  /**
   * Delete line item (soft delete)
   * 
   * @param {string} lineItemId - Line item ID
   * @returns {Promise<void>}
   */
  static async delete(lineItemId) {
    await db(TABLE_NAME)
      .where('id', lineItemId)
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }

  /**
   * Calculate totals for all line items in an invoice
   * 
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Totals {subtotalAmount, totalTaxAmount, totalAmount}
   */
  static async calculateInvoiceTotals(invoiceId) {
    const lineItems = await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .where('deleted_at', null);

    let subtotalAmount = 0;
    let totalTaxAmount = 0;
    let totalAmount = 0;

    lineItems.forEach(item => {
      subtotalAmount += parseFloat(item.amount) || 0;
      totalTaxAmount += parseFloat(item.tax_amount) || 0;
      totalAmount += parseFloat(item.total) || 0;
    });

    return {
      subtotalAmount: Math.round(subtotalAmount * 100) / 100,
      totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }

  /**
   * Delete all line items for an invoice
   * 
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<void>}
   */
  static async deleteByInvoiceId(invoiceId) {
    await db(TABLE_NAME)
      .where('invoice_id', invoiceId)
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }

  /**
   * Format line item response
   * 
   * @param {Object} lineItem - Raw line item object from database
   * @returns {Object} Formatted line item object
   */
  static formatLineItemResponse(lineItem) {
    if (!lineItem) return null;

    return {
      id: lineItem.id,
      invoiceId: lineItem.invoice_id,
      description: lineItem.description,
      quantity: parseFloat(lineItem.quantity),
      unitPrice: parseFloat(lineItem.unit_price),
      taxIncluded: lineItem.tax_included,
      amount: parseFloat(lineItem.amount),
      taxAmount: parseFloat(lineItem.tax_amount),
      total: parseFloat(lineItem.total),
      taxRate: parseFloat(lineItem.tax_rate),
      lineOrder: lineItem.line_order,
      metadata: lineItem.metadata || {},
      createdAt: lineItem.created_at,
      updatedAt: lineItem.updated_at
    };
  }
}

export default LineItem;
