/**
 * Line Items Editor Component
 * 
 * Allows users to add, edit, and delete line items from an invoice
 * Provides real-time calculation of totals
 * Story: EPIC-1-002/003 - Line Items & Tax Calculations
 */

import React, { useState, useEffect } from 'react';
import '../styles/LineItemsEditor.css';

export default function LineItemsEditor({ invoiceId }) {
  const [lineItems, setLineItems] = useState([]);
  const [totals, setTotals] = useState({
    subtotalAmount: 0,
    totalTaxAmount: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state for new/edit line item
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 20,
    taxIncluded: false
  });

  // Fetch line items on mount
  useEffect(() => {
    fetchLineItems();
  }, [invoiceId]);

  const fetchLineItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/invoices/${invoiceId}/line-items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch line items');
      }

      const data = await response.json();
      setLineItems(data.data.lineItems || []);
      setTotals(data.data.totals || {
        subtotalAmount: 0,
        totalTaxAmount: 0,
        totalAmount: 0
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching line items:', err);
      setError('Failed to load line items');
    } finally {
      setLoading(false);
    }
  };

  const calculateLineItemAmount = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const taxRate = parseFloat(formData.taxRate) || 20;

    const amount = quantity * unitPrice;
    const taxAmount = formData.taxIncluded ? 0 : (amount * taxRate) / 100;
    const total = amount + taxAmount;

    return {
      amount: Math.round(amount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const handleAddLineItem = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      setError('Quantity must be positive');
      return;
    }

    if (parseFloat(formData.unitPrice) <= 0) {
      setError('Unit price must be positive');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/invoices/${invoiceId}/line-items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: formData.description,
          quantity: parseFloat(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          taxRate: parseFloat(formData.taxRate),
          taxIncluded: formData.taxIncluded
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add line item');
      }

      const data = await response.json();
      
      // Update line items and totals
      setLineItems([...lineItems, data.data.lineItem]);
      setTotals(data.data.invoiceTotals);
      
      // Reset form
      setFormData({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 20,
        taxIncluded: false
      });
      
      setIsAdding(false);
      setError(null);
      setSuccessMessage('Line item added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding line item:', err);
      setError(err.message || 'Failed to add line item');
    }
  };

  const handleUpdateLineItem = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      setError('Quantity must be positive');
      return;
    }

    if (parseFloat(formData.unitPrice) <= 0) {
      setError('Unit price must be positive');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/invoices/${invoiceId}/line-items/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: formData.description,
          quantity: parseFloat(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          taxRate: parseFloat(formData.taxRate),
          taxIncluded: formData.taxIncluded
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update line item');
      }

      const data = await response.json();
      
      // Update line items and totals
      setLineItems(lineItems.map(item => 
        item.id === editingId ? data.data.lineItem : item
      ));
      setTotals(data.data.invoiceTotals);
      
      // Reset form
      setFormData({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 20,
        taxIncluded: false
      });
      
      setEditingId(null);
      setError(null);
      setSuccessMessage('Line item updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating line item:', err);
      setError(err.message || 'Failed to update line item');
    }
  };

  const handleDeleteLineItem = async (lineItemId) => {
    if (!window.confirm('Are you sure you want to delete this line item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/invoices/${invoiceId}/line-items/${lineItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete line item');
      }

      const data = await response.json();
      
      // Update line items and totals
      setLineItems(lineItems.filter(item => item.id !== lineItemId));
      setTotals(data.data.invoiceTotals);
      
      setError(null);
      setSuccessMessage('Line item deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting line item:', err);
      setError(err.message || 'Failed to delete line item');
    }
  };

  const handleEditLineItem = (item) => {
    setFormData({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      taxIncluded: item.taxIncluded
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 20,
      taxIncluded: false
    });
    setEditingId(null);
    setIsAdding(false);
    setError(null);
  };

  const calculateAmount = calculateLineItemAmount();

  if (loading) {
    return (
      <div className="line-items-editor">
        <div className="loading">Loading line items...</div>
      </div>
    );
  }

  return (
    <div className="line-items-editor">
      <h2>Line Items</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Line Items Table */}
      {lineItems.length > 0 ? (
        <div className="table-container">
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
                <th>Tax Rate</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(item => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{item.unitPrice.toFixed(2)} €</td>
                  <td className="text-right">{item.amount.toFixed(2)} €</td>
                  <td className="text-center">{item.taxRate}%</td>
                  <td className="text-right">{item.taxAmount.toFixed(2)} €</td>
                  <td className="text-right"><strong>{item.total.toFixed(2)} €</strong></td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditLineItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteLineItem(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-items">No line items yet. Add one to get started.</div>
      )}

      {/* Add/Edit Form */}
      {isAdding ? (
        <form className="line-item-form" onSubmit={editingId ? handleUpdateLineItem : handleAddLineItem}>
          <h3>{editingId ? 'Edit Line Item' : 'Add New Line Item'}</h3>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              id="description"
              type="text"
              placeholder="e.g., Development Services"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unitPrice">Unit Price (€) *</label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxRate">Tax Rate (%)</label>
              <input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group checkbox">
            <label htmlFor="taxIncluded">
              <input
                id="taxIncluded"
                type="checkbox"
                checked={formData.taxIncluded}
                onChange={(e) => setFormData({ ...formData, taxIncluded: e.target.checked })}
              />
              Tax included in unit price
            </label>
          </div>

          {/* Calculation Preview */}
          <div className="calculation-preview">
            <div className="calculation-row">
              <span>Amount:</span>
              <strong>{calculateAmount.amount.toFixed(2)} €</strong>
            </div>
            <div className="calculation-row">
              <span>Tax ({formData.taxRate}%):</span>
              <strong>{calculateAmount.taxAmount.toFixed(2)} €</strong>
            </div>
            <div className="calculation-row total">
              <span>Total:</span>
              <strong>{calculateAmount.total.toFixed(2)} €</strong>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'} Line Item
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-primary btn-block" onClick={() => setIsAdding(true)}>
          + Add Line Item
        </button>
      )}

      {/* Invoice Totals */}
      <div className="invoice-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <strong>{totals.subtotalAmount.toFixed(2)} €</strong>
        </div>
        <div className="total-row">
          <span>Total Tax:</span>
          <strong>{totals.totalTaxAmount.toFixed(2)} €</strong>
        </div>
        <div className="total-row total">
          <span>Total Amount:</span>
          <strong>{totals.totalAmount.toFixed(2)} €</strong>
        </div>
      </div>
    </div>
  );
}
