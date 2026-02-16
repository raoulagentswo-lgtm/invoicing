/**
 * Create Client Page Component
 * 
 * Allows users to create a new client/customer
 * Story: EPIC-1-001 - Create Invoice Draft (supporting component)
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateClient.css';

export default function CreateClient() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'France',
      companyName: '',
      siret: '',
      vatNumber: '',
      contactPerson: '',
      contactPhone: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const token = localStorage.getItem('token');

      const clientData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        postalCode: data.postalCode || null,
        city: data.city || null,
        country: data.country || 'France',
        companyName: data.companyName || null,
        siret: data.siret || null,
        vatNumber: data.vatNumber || null,
        contactPerson: data.contactPerson || null,
        contactPhone: data.contactPhone || null
      };

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 400 && responseData.errors) {
          setServerError(responseData.errors.map(e => `${e.field}: ${e.message}`).join('\n'));
        } else {
          setServerError(responseData.message || 'Failed to create client');
        }
        return;
      }

      setCreateSuccess(true);
      reset();

      // Redirect to invoices creation page
      setTimeout(() => {
        navigate('/invoices/new', { state: { clientId: responseData.data.id } });
      }, 1500);
    } catch (error) {
      console.error('Error creating client:', error);
      setServerError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-client-container">
      <div className="create-client-card">
        <div className="card-header">
          <h1>Create New Client</h1>
          <p>Add a new client to your system</p>
        </div>

        {createSuccess && (
          <div className="alert alert-success">
            ✓ Client created successfully! Redirecting...
          </div>
        )}

        {serverError && (
          <div className="alert alert-error">
            {serverError.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="client-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Client Name *</label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g., John Doe or Company Name"
                  {...register('name', {
                    required: 'Client name is required',
                    maxLength: { value: 255, message: 'Name must be less than 255 characters' }
                  })}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && (
                  <span className="error-message">{errors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  placeholder="contact@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="01234567890"
                  {...register('phone', {
                    maxLength: { value: 20, message: 'Phone number must be less than 20 characters' }
                  })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone</label>
                <input
                  type="tel"
                  id="contactPhone"
                  placeholder="Secondary contact phone"
                  {...register('contactPhone', {
                    maxLength: { value: 20, message: 'Phone number must be less than 20 characters' }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h2>Address Information</h2>

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                placeholder="123 Main Street"
                {...register('address', {
                  maxLength: { value: 500, message: 'Address must be less than 500 characters' }
                })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  placeholder="75001"
                  {...register('postalCode', {
                    maxLength: { value: 10, message: 'Postal code must be less than 10 characters' }
                  })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  placeholder="Paris"
                  {...register('city', {
                    maxLength: { value: 100, message: 'City must be less than 100 characters' }
                  })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  placeholder="France"
                  defaultValue="France"
                  {...register('country', {
                    maxLength: { value: 100, message: 'Country must be less than 100 characters' }
                  })}
                />
                <p className="help-text">Default: France</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="form-section">
            <h2>Company Information</h2>

            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                placeholder="Official company name"
                {...register('companyName', {
                  maxLength: { value: 255, message: 'Company name must be less than 255 characters' }
                })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="siret">SIRET</label>
                <input
                  type="text"
                  id="siret"
                  placeholder="12345678901234"
                  {...register('siret', {
                    pattern: {
                      value: /^\d{14}$/,
                      message: 'SIRET must be exactly 14 digits'
                    }
                  })}
                  className={errors.siret ? 'input-error' : ''}
                  maxLength="14"
                />
                {errors.siret && (
                  <span className="error-message">{errors.siret.message}</span>
                )}
                <p className="help-text">French business registration number (14 digits)</p>
              </div>

              <div className="form-group">
                <label htmlFor="vatNumber">VAT Number</label>
                <input
                  type="text"
                  id="vatNumber"
                  placeholder="FR12345678901"
                  {...register('vatNumber', {
                    maxLength: { value: 20, message: 'VAT number must be less than 20 characters' }
                  })}
                />
                <p className="help-text">EU VAT identification number</p>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="form-section">
            <h2>Contact Person</h2>

            <div className="form-group">
              <label htmlFor="contactPerson">Name</label>
              <input
                type="text"
                id="contactPerson"
                placeholder="Jane Smith"
                {...register('contactPerson', {
                  maxLength: { value: 255, message: 'Name must be less than 255 characters' }
                })}
              />
              <p className="help-text">Primary contact person at the company</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg"
            >
              {isLoading ? 'Creating...' : 'Create Client'}
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
