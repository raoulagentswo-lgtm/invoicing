/**
 * Invoices List Page Component (Modern Version)
 * 
 * Displays a list of all invoices with modern table design and filtering
 * Uses design-tokens.css for styling with modern indigo theme
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import axios from 'axios'

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
    fetchInvoices()
  }, [statusFilter, token, navigate])

  const fetchInvoices = async () => {
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter

      const res = await axios.get('/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      console.log('Invoices API Response:', res.data)
      setInvoices(res.data?.data || [])
    } catch (err) {
      setError('Erreur lors de la récupération des factures')
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (invoiceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return
    try {
      await axios.delete(`/api/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInvoices(invoices.filter(i => i.id !== invoiceId))
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': { bg: 'var(--badge-warning-bg)', color: 'var(--badge-warning-color)', border: 'var(--badge-warning-border)' },
      'SENT': { bg: 'var(--badge-info-bg)', color: 'var(--badge-info-color)', border: 'var(--badge-info-border)' },
      'PAID': { bg: 'var(--badge-success-bg)', color: 'var(--badge-success-color)', border: 'var(--badge-success-border)' },
      'OVERDUE': { bg: 'var(--badge-danger-bg)', color: 'var(--badge-danger-color)', border: 'var(--badge-danger-border)' },
      'CANCELLED': { bg: '#E5E7EB', color: '#374151', border: '1px solid #D1D5DB' }
    }
    return colors[status] || { bg: '#E5E7EB', color: '#374151', border: '1px solid #D1D5DB' }
  }

  const getStatusBadge = (status) => {
    const labels = {
      'DRAFT': '📝 Brouillon',
      'SENT': '📨 Envoyée',
      'PAID': '✅ Payée',
      'OVERDUE': '⚠️ En retard',
      'CANCELLED': '❌ Annulée'
    }
    return labels[status] || status
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      paddingBottom: 'var(--spacing-lg)',
    }}>
      {/* Navigation Bar */}
      <Navigation />

      {/* Page Title & Actions */}
      <div style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: 'var(--nav-topbar-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-h2)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          margin: '0',
        }}>
          📄 Factures
        </h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button
            onClick={() => navigate('/invoices/create')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              backgroundColor: 'var(--btn-primary-bg)',
              color: 'white',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: `background-color var(--transition-fast)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--btn-primary-bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--btn-primary-bg)'
            }}
          >
            ➕ Nouvelle facture
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--spacing-lg)',
      }}>
        {/* Filters */}
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <label style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}>
            🔍 Filtrer par statut:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
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
            <option value="">Tous les statuts</option>
            <option value="DRAFT">📝 Brouillon</option>
            <option value="SENT">📨 Envoyée</option>
            <option value="PAID">✅ Payée</option>
            <option value="OVERDUE">⚠️ En retard</option>
            <option value="CANCELLED">❌ Annulée</option>
          </select>
        </div>

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
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
            }}>
              ⏳ Chargement des factures...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && invoices.length === 0 && (
          <div style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--color-bg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-md)',
            }}>
              📭 Aucune facture pour le moment
            </p>
            <button
              onClick={() => navigate('/invoices/create')}
              style={{
                padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'white',
                fontWeight: 'var(--font-weight-semibold)',
                borderRadius: 'var(--btn-border-radius)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                transition: `background-color var(--transition-base)`,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--btn-primary-bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--btn-primary-bg)'
              }}
            >
              ➕ Créer la première facture
            </button>
          </div>
        )}

        {/* Invoices Table */}
        {!loading && invoices.length > 0 && (
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--color-bg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
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
                  }}>
                    Numéro
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Client
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'right',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Montant
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Statut
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Date
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => {
                  const statusColor = getStatusColor(invoice.status)
                  return (
                    <tr
                      key={invoice.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-light)',
                        backgroundColor: index % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-secondary)',
                        transition: `background-color var(--transition-fast)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-50)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-secondary)'
                      }}
                    >
                      <td style={{
                        padding: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-primary)',
                        fontWeight: 'var(--font-weight-semibold)',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        {invoice.invoice_number}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-primary)',
                      }}>
                        {invoice.client_name || '—'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'right',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                      }}>
                        {invoice.total_amount ? `€${invoice.total_amount.toFixed(2)}` : '€0.00'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: 'var(--badge-padding)',
                          borderRadius: 'var(--badge-border-radius)',
                          fontSize: 'var(--badge-font-size)',
                          fontWeight: 'var(--badge-font-weight)',
                          backgroundColor: statusColor.bg,
                          color: statusColor.color,
                          border: statusColor.border,
                        }}>
                          {getStatusBadge(invoice.status)}
                        </span>
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: 'var(--spacing-xs)',
                          justifyContent: 'center',
                        }}>
                          <button
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                            style={{
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              borderRadius: 'var(--border-radius-md)',
                              border: 'none',
                              backgroundColor: 'var(--btn-secondary-bg)',
                              color: 'var(--btn-secondary-color)',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              cursor: 'pointer',
                              transition: `background-color var(--transition-fast)`,
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'var(--btn-secondary-bg-hover)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'var(--btn-secondary-bg)'
                            }}
                            title="Voir la facture"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                            style={{
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              borderRadius: 'var(--border-radius-md)',
                              border: 'none',
                              backgroundColor: 'var(--btn-secondary-bg)',
                              color: 'var(--btn-secondary-color)',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              cursor: 'pointer',
                              transition: `background-color var(--transition-fast)`,
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'var(--btn-secondary-bg-hover)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'var(--btn-secondary-bg)'
                            }}
                            title="Éditer la facture"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            style={{
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              borderRadius: 'var(--border-radius-md)',
                              border: 'none',
                              backgroundColor: '#FEE2E2',
                              color: '#7C2D12',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              cursor: 'pointer',
                              transition: `background-color var(--transition-fast)`,
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#FECACA'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#FEE2E2'
                            }}
                            title="Supprimer la facture"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
