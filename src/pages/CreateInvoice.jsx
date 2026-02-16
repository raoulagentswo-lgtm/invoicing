/**
 * Create Invoice Draft Page Component
 * 
 * Allows users to create a new invoice draft with client selection
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateInvoice.css';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [createSuccess, setCreateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      clientId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      notes: '',
      currency: 'EUR',
      taxRate: 20,
      subtotalAmount: 0,
      paymentTerms: 'Net 30',
      paymentInstructions: ''
    }
  });

  const subtotalAmount = watch('subtotalAmount');
  const taxRate = watch('taxRate');
  const taxAmount = (subtotalAmount * taxRate) / 100;
  const totalAmount = subtotalAmount + taxAmount;

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clients?status=active&limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }

        const data = await response.json();
        setClients(data.data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setServerError('Failed to load clients');
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const token = localStorage.getItem('token');

      const invoiceData = {
        clientId: data.clientId,
        invoiceDate: new Date(data.invoiceDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
        description: data.description || null,
        notes: data.notes || null,
        currency: data.currency || 'EUR',
        taxRate: parseFloat(data.taxRate) || 20,
        subtotalAmount: parseFloat(data.subtotalAmount) || 0,
        paymentTerms: data.paymentTerms || null,
        paymentInstructions: data.paymentInstructions || null
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 400 && responseData.errors) {
          setServerError(responseData.errors.map(e => `${e.field}: ${e.message}`).join('\n'));
        } else {
          setServerError(responseData.message || 'Failed to create invoice');
        }
        return;
      }

      setCreateSuccess(true);
      reset();

      // Redirect to invoice detail page
      if (responseData.data?.invoice?.id) {
        setTimeout(() => {
          navigate(`/invoices/${responseData.data.invoice.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setServerError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingClients) {
    return (
      <div className="create-invoice-container">
        <div className="loading">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="create-invoice-container">
      <div className="create-invoice-card">
        <div className="card-header">
          <h1>Create Invoice Draft</h1>
          <p>Create a new invoice draft that you can save and send later</p>
        </div>

        {createSuccess && (
          <div className="alert alert-success">
            ✓ Invoice created successfully! Redirecting...
          </div>
        )}

        {serverError && (
          <div className="alert alert-error">
            {serverError.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="invoice-form">
          {/* Client Selection */}
          <div className="form-section">
            <h2>Client Information</h2>

            <div className="form-group">
              <label htmlFor="clientId">Select Client *</label>
              <select
                id="clientId"
                {...register('clientId', {
                  required: 'Client is required'
                })}
                className={errors.clientId ? 'input-error' : ''}
              >
                <option value="">-- Choose a client --</option>
                {clients.length > 0 ? (
                  clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))
                ) : (
                  <option disabled>No clients available. Create one first.</option>
                )}
              </select>
              {errors.clientId && (
                <span className="error-message">{errors.clientId.message}</span>
              )}
              {clients.length === 0 && (
                <p className="help-text">
                  <a href="/clients/new">Create a new client first</a>
                </p>
              )}
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="form-section">
            <h2>Invoice Dates</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="invoiceDate">Invoice Date *</label>
                <input
                  type="date"
                  id="invoiceDate"
                  {...register('invoiceDate', {
                    required: 'Invoice date is required'
                  })}
                  className={errors.invoiceDate ? 'input-error' : ''}
                />
                {errors.invoiceDate && (
                  <span className="error-message">{errors.invoiceDate.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  {...register('dueDate', {
                    required: 'Due date is required'
                  })}
                  className={errors.dueDate ? 'input-error' : ''}
                />
                {errors.dueDate && (
                  <span className="error-message">{errors.dueDate.message}</span>
                )}
                <p className="help-text">Default: 30 days from today</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="form-section">
            <h2>Invoice Details</h2>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Brief description of what this invoice is for..."
                rows="3"
                {...register('description')}
                maxLength="1000"
              />
              <p className="help-text">Max 1000 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                placeholder="Additional notes, terms, or instructions..."
                rows="4"
                {...register('notes')}
                maxLength="5000"
              />
              <p className="help-text">Max 5000 characters</p>
            </div>
          </div>

          {/* Financial Information */}
          <div className="form-section">
            <h2>Financial Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency">Currency *</label>
                <select
                  id="currency"
                  {...register('currency', {
                    required: 'Currency is required'
                  })}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (Fr)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="taxRate">Tax Rate (%) *</label>
                <input
                  type="number"
                  id="taxRate"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('taxRate', {
                    required: 'Tax rate is required',
                    min: { value: 0, message: 'Tax rate must be >= 0' },
                    max: { value: 100, message: 'Tax rate must be <= 100' }
                  })}
                  className={errors.taxRate ? 'input-error' : ''}
                />
                {errors.taxRate && (
                  <span className="error-message">{errors.taxRate.message}</span>
                )}
                <p className="help-text">Default: 20%</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subtotalAmount">Subtotal Amount (before tax) *</label>
              <input
                type="number"
                id="subtotalAmount"
                step="0.01"
                min="0"
                {...register('subtotalAmount', {
                  required: 'Subtotal is required',
                  min: { value: 0, message: 'Amount must be >= 0' }
                })}
                className={errors.subtotalAmount ? 'input-error' : ''}
              />
              {errors.subtotalAmount && (
                <span className="error-message">{errors.subtotalAmount.message}</span>
              )}
            </div>

            {/* Calculation Summary */}
            <div className="calculation-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span className="amount">{parseFloat(subtotalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax ({taxRate}%):</span>
                <span className="amount">{taxAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span className="amount">{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="form-section">
            <h2>Payment Information</h2>

            <div className="form-group">
              <label htmlFor="paymentTerms">Payment Terms</label>
              <input
                type="text"
                id="paymentTerms"
                placeholder="e.g., Net 30, Net 15, Due on receipt"
                {...register('paymentTerms')}
                maxLength="100"
              />
              <p className="help-text">Default: Net 30</p>
            </div>

            <div className="form-group">
              <label htmlFor="paymentInstructions">Payment Instructions</label>
              <textarea
                id="paymentInstructions"
                placeholder="Bank details, payment methods, or other instructions..."
                rows="4"
                {...register('paymentInstructions')}
                maxLength="1000"
              />
              <p className="help-text">Max 1000 characters</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading || clients.length === 0}
              className="btn btn-primary btn-lg"
            >
              {isLoading ? 'Creating...' : 'Create Draft Invoice'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
