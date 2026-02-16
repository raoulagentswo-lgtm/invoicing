/**
 * Invoice Form Page Component (Modern Version)
 * 
 * Form to create or edit an invoice with line items and tax calculation
 * Uses design-tokens.css for styling with modern indigo theme
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'

export default function InvoiceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      taxRate: 20,
      currency: 'EUR'
    }
  })

  const [loading, setLoading] = useState(!!id)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState([])
  const [lineItems, setLineItems] = useState([])
  const [selectedClient, setSelectedClient] = useState('')

  const subtotal = watch('subtotalAmount')
  const taxRate = watch('taxRate')
  const taxAmount = subtotal ? (subtotal * taxRate) / 100 : 0
  const totalAmount = subtotal ? subtotal + taxAmount : 0

  // Sync line items subtotal to form state
  useEffect(() => {
    const calculatedSubtotal = calculateSubtotal()
    console.log('[INVOICE_FORM] Line items:', lineItems)
    console.log('[INVOICE_FORM] Calculations:', {
      subtotal: calculatedSubtotal,
      taxRate,
      taxAmount: calculatedSubtotal ? (calculatedSubtotal * taxRate) / 100 : 0,
      totalTTC: calculatedSubtotal ? calculatedSubtotal + ((calculatedSubtotal * taxRate) / 100) : 0
    })
    setValue('subtotalAmount', calculatedSubtotal)
  }, [lineItems, setValue, taxRate])

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
    fetchClients()
    
    if (id) {
      // Load invoice data for editing
      axios.get(`/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const invoice = res.data?.data?.invoice || res.data
        Object.keys(invoice).forEach(key => setValue(key, invoice[key]))
        setSelectedClient(invoice.client_id)
        if (invoice.lineItems && Array.isArray(invoice.lineItems)) {
          setLineItems(invoice.lineItems)
        }
      }).catch(err => {
        console.error('Error loading invoice:', err)
        setError('Erreur lors du chargement de la facture')
      })
      .finally(() => setLoading(false))
    }
  }, [id, token, navigate, setValue])

  const fetchClients = async () => {
    try {
      const res = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClients(res.data?.data || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
    }
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0 }
    ])
  }

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems]
    updated[index][field] = value
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].amount = (parseFloat(updated[index].quantity) || 0) * (parseFloat(updated[index].unitPrice) || 0)
    }
    setLineItems(updated)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const onSubmit = async (data) => {
    setSubmitLoading(true)
    try {
      const submitData = {
        clientId: selectedClient,
        ...data,
        subtotalAmount: calculateSubtotal(),
        lineItems
      }

      if (id) {
        // Update
        await axios.patch(`/api/invoices/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create
        await axios.post('/api/invoices', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/invoices')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      paddingBottom: 'var(--spacing-lg)',
    }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: 'var(--nav-topbar-border)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-h2)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          margin: '0',
        }}>
          {id ? '✏️ Éditer Facture' : '➕ Nouvelle Facture'}
        </h1>
        <button
          onClick={() => navigate('/invoices')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            transition: `background-color var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--nav-item-bg-active)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--color-bg-secondary)'
          }}
        >
          ← Retour
        </button>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'var(--spacing-lg)',
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: '#FEE2E2',
            padding: 'var(--spacing-md)',
            border: '1px solid #FECACA',
            marginBottom: 'var(--spacing-lg)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: '#7C2D12',
              margin: '0',
            }}>
              ❌ {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--color-bg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
            }}>
              ⏳ Chargement des données...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)',
            }}
          >
            {/* Client Selection */}
            <div style={{
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: 'var(--card-border)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <label htmlFor="client-select" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Client *
              </label>
              <select
                id="client-select"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  borderRadius: 'var(--input-border-radius)',
                  border: 'var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-border-focus)'
                  e.target.style.boxShadow = 'var(--input-shadow-focus)'
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
                required
              >
                <option value="">Sélectionner un client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Dates and Status */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: 'var(--card-border)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div>
                <label htmlFor="invoice-date" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  📅 Date facture
                </label>
                <input
                  id="invoice-date"
                  {...register('invoiceDate')}
                  type="datetime-local"
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="due-date" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  📅 Date échéance
                </label>
                <input
                  id="due-date"
                  {...register('dueDate')}
                  type="datetime-local"
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="status" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  📊 Statut
                </label>
                <select
                  id="status"
                  {...register('status')}
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="DRAFT">📝 Brouillon</option>
                  <option value="SENT">📨 Envoyée</option>
                  <option value="PAID">✅ Payée</option>
                </select>
              </div>
            </div>

            {/* Description and Notes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: 'var(--card-border)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div>
                <label htmlFor="description" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  📝 Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows="3"
                  placeholder="Description générale de la facture..."
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    fontFamily: 'var(--font-family-body)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="notes" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  📌 Notes
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows="3"
                  placeholder="Notes additionnelles, conditions spéciales..."
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    fontFamily: 'var(--font-family-body)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Line Items */}
            <div style={{
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: 'var(--card-border)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <h3 style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}>
                📋 Lignes de facture
              </h3>
              {lineItems.length === 0 ? (
                <p style={{
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  padding: 'var(--spacing-lg) 0',
                }}>
                  Aucune ligne actuellement
                </p>
              ) : (
                <div style={{
                  overflowX: 'auto',
                  marginBottom: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  border: 'var(--card-border)',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderBottom: 'var(--card-border)',
                      }}>
                        <th style={{
                          padding: 'var(--spacing-md)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
                        }}>Description</th>
                        <th style={{
                          padding: 'var(--spacing-md)',
                          textAlign: 'right',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
                          width: '100px',
                        }}>Qté</th>
                        <th style={{
                          padding: 'var(--spacing-md)',
                          textAlign: 'right',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
                          width: '120px',
                        }}>Prix unit.</th>
                        <th style={{
                          padding: 'var(--spacing-md)',
                          textAlign: 'right',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
                          width: '120px',
                        }}>Montant</th>
                        <th style={{
                          padding: 'var(--spacing-md)',
                          textAlign: 'center',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
                          width: '60px',
                        }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid var(--color-border-light)',
                            backgroundColor: idx % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-secondary)',
                          }}
                        >
                          <td style={{
                            padding: 'var(--spacing-md)',
                          }}>
                            <input
                              value={item.description}
                              onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                              placeholder="Description de l'article ou service"
                              style={{
                                width: '100%',
                                padding: 'var(--input-padding)',
                                borderRadius: 'var(--input-border-radius)',
                                border: 'var(--input-border)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-color)',
                                fontSize: 'var(--font-size-sm)',
                              }}
                            />
                          </td>
                          <td style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'right',
                          }}>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                              style={{
                                width: '100%',
                                padding: 'var(--input-padding)',
                                borderRadius: 'var(--input-border-radius)',
                                border: 'var(--input-border)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-color)',
                                fontSize: 'var(--font-size-sm)',
                                textAlign: 'right',
                              }}
                            />
                          </td>
                          <td style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'right',
                          }}>
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)}
                              style={{
                                width: '100%',
                                padding: 'var(--input-padding)',
                                borderRadius: 'var(--input-border-radius)',
                                border: 'var(--input-border)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-color)',
                                fontSize: 'var(--font-size-sm)',
                                textAlign: 'right',
                              }}
                            />
                          </td>
                          <td style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'right',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-primary)',
                          }}>
                            €{item.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                          }}>
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              style={{
                                padding: 'var(--spacing-sm)',
                                backgroundColor: '#FEE2E2',
                                color: '#7C2D12',
                                cursor: 'pointer',
                                borderRadius: 'var(--border-radius-md)',
                                border: 'none',
                                fontWeight: 'var(--font-weight-semibold)',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#FECACA'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#FEE2E2'
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button
                type="button"
                onClick={addLineItem}
                style={{
                  padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  color: 'var(--btn-secondary-color)',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderRadius: 'var(--btn-border-radius)',
                  border: 'var(--btn-secondary-border)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-base)',
                  transition: `background-color var(--transition-fast)`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--btn-secondary-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--btn-secondary-bg)'
                }}
              >
                ➕ Ajouter une ligne
              </button>
            </div>

            {/* Tax and Totals */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 'var(--spacing-lg)',
              alignItems: 'start',
            }}>
              {/* Tax Rate */}
              <div style={{
                backgroundColor: 'var(--color-bg)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--border-radius-lg)',
                border: 'var(--card-border)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <label htmlFor="tax-rate" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  💰 Taux TVA (%)
                </label>
                <input
                  id="tax-rate"
                  {...register('taxRate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  style={{
                    width: '150px',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Totals Summary */}
              <div style={{
                backgroundColor: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-200)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--border-radius-lg)',
                minWidth: '280px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  <span>Sous-total HT:</span>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>€{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  <span>TVA ({taxRate}%):</span>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>€{taxAmount.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--font-size-h3)',
                  color: 'var(--color-primary)',
                  borderTop: '2px solid var(--color-primary-200)',
                  paddingTop: 'var(--spacing-md)',
                }}>
                  <span>Total TTC:</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment and Currency */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: 'var(--card-border)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div>
                <label htmlFor="currency" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  💱 Devise
                </label>
                <select
                  id="currency"
                  {...register('currency')}
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar</option>
                  <option value="GBP">GBP - Livre</option>
                </select>
              </div>
              <div>
                <label htmlFor="payment-terms" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  📋 Conditions de paiement
                </label>
                <input
                  id="payment-terms"
                  {...register('paymentTerms')}
                  placeholder="Ex: Net 30"
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--input-border-radius)',
                    border: 'var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
            }}>
              <button
                type="submit"
                disabled={submitLoading}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
                  backgroundColor: submitLoading ? '#9CA3AF' : 'var(--btn-primary-bg)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderRadius: 'var(--btn-border-radius)',
                  border: 'none',
                  cursor: submitLoading ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--font-size-base)',
                  transition: `background-color var(--transition-base)`,
                  opacity: submitLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitLoading) {
                    e.target.style.backgroundColor = 'var(--btn-primary-bg-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitLoading) {
                    e.target.style.backgroundColor = 'var(--btn-primary-bg)'
                  }
                }}
              >
                {submitLoading ? 'Enregistrement en cours...' : id ? '💾 Mettre à jour' : '✅ Créer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
