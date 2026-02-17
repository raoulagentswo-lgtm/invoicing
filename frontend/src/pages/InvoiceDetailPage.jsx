/**
 * Invoice Detail Page Component (Modern Version)
 * 
 * Displays invoice details with status management and PDF download
 * Uses design-tokens.css for styling with modern indigo theme
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../components/Navigation'
import axios from 'axios'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  
  const [invoice, setInvoice] = useState(null)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusChangeError, setStatusChangeError] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
    fetchInvoice()
  }, [id, token, navigate])

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data?.data || res.data
      setInvoice(data.invoice || data)
      setClient(data.client)
      setNewStatus(data.invoice?.status || data.status)
    } catch (err) {
      setError('Erreur lors du chargement de la facture')
      console.error('Error fetching invoice:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === invoice.status) {
      setStatusChangeError('Veuillez sélectionner un nouveau statut')
      return
    }

    try {
      await axios.patch(`/api/invoices/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStatusChangeError('')
      await fetchInvoice()
    } catch (err) {
      setStatusChangeError(err.response?.data?.message || 'Erreur lors du changement de statut')
    }
  }

  const downloadPDF = async () => {
    try {
      const res = await axios.post(`/api/invoices/${id}/pdf`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${invoice.invoice_number || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      setError('Erreur lors du téléchargement du PDF')
    }
  }

  const deleteInvoice = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return
    try {
      await axios.delete(`/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/invoices')
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-secondary)',
        }}>
          ⏳ Chargement de la facture...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--spacing-lg)',
      }}>
        <div style={{
          borderRadius: 'var(--border-radius-lg)',
          backgroundColor: '#FEE2E2',
          padding: 'var(--spacing-lg)',
          border: '1px solid #FECACA',
        }}>
          <p style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: '#7C2D12',
            margin: '0',
          }}>
            ❌ {error}
          </p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--spacing-lg)',
      }}>
        <p style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-secondary)',
        }}>
          📭 Facture non trouvée
        </p>
      </div>
    )
  }

  const statusColor = getStatusColor(invoice.status)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      paddingBottom: 'var(--spacing-lg)',
    }}>
      {/* Navigation Bar */}
      <Navigation />

      {/* Page Title */}
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
          📄 Facture {invoice?.invoice_number || id}
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
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'var(--spacing-lg)',
      }}>
        {/* Invoice Header Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-bg)',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--border-radius-lg)',
          border: 'var(--card-border)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <h2 style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
                margin: '0 0 var(--spacing-sm) 0',
              }}>
                {invoice.invoice_number || 'N/A'}
              </h2>
              <p style={{
                margin: '0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                📅 Émise le: {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
              </p>
              <p style={{
                margin: 'var(--spacing-xs) 0 0 0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                📅 Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <h3 style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                margin: '0 0 var(--spacing-xs) 0',
              }}>
                👥 Client
              </h3>
              <p style={{
                margin: '0',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
              }}>
                {client?.name || 'N/A'}
              </p>
              <p style={{
                margin: 'var(--spacing-xs) 0 0 0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {client?.email || ''}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            <div style={{
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
            </div>
            <div style={{ textAlign: 'right', marginTop: 'var(--spacing-md)' }}>
              <p style={{
                margin: '0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                Montant total
              </p>
              <p style={{
                margin: 'var(--spacing-xs) 0 0 0',
                fontSize: 'var(--font-size-h2)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
              }}>
                €{invoice.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius-lg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
            }}>
              📝 Description
            </p>
            <p style={{
              margin: '0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {invoice.description || '—'}
            </p>
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius-lg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
            }}>
              📌 Notes
            </p>
            <p style={{
              margin: '0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {invoice.notes || '—'}
            </p>
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius-lg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
            }}>
              📋 Conditions de paiement
            </p>
            <p style={{
              margin: '0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {invoice.payment_terms || '—'}
            </p>
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius-lg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
            }}>
              💱 Devise
            </p>
            <p style={{
              margin: '0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {invoice.currency || 'EUR'}
            </p>
          </div>
        </div>

        {/* Line Items */}
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-lg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            <h3 style={{
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-md)',
              margin: '0 0 var(--spacing-md) 0',
            }}>
              📋 Lignes de facture
            </h3>
            <div style={{
              overflowX: 'auto',
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
                    }}>
                      Description
                    </th>
                    <th style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'right',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      width: '100px',
                    }}>
                      Qté
                    </th>
                    <th style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'right',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      width: '120px',
                    }}>
                      Prix unit.
                    </th>
                    <th style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'right',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      width: '120px',
                    }}>
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--color-border-light)',
                        backgroundColor: idx % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-secondary)',
                      }}
                    >
                      <td style={{
                        padding: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-primary)',
                      }}>
                        {item.description}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'right',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {item.quantity}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'right',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                      }}>
                        €{item.unit_price?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'right',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-primary)',
                      }}>
                        €{item.amount?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <div></div>
          <div style={{
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-lg)',
            minWidth: '300px',
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
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>€{invoice.subtotal_amount?.toFixed(2) || '0.00'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-md)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              <span>TVA ({invoice.tax_rate}%):</span>
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>€{invoice.tax_amount?.toFixed(2) || '0.00'}</span>
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
              <span>€{invoice.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Status Change */}
        <div style={{
          backgroundColor: 'var(--color-bg)',
          border: 'var(--card-border)',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-h3)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--spacing-md) 0',
          }}>
            📊 Changer le statut
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--spacing-md)',
            alignItems: 'end',
          }}>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
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
              <option value="DRAFT">📝 Brouillon</option>
              <option value="SENT">📨 Envoyée</option>
              <option value="PAID">✅ Payée</option>
              <option value="OVERDUE">⚠️ En retard</option>
              <option value="CANCELLED">❌ Annulée</option>
            </select>
            <button
              onClick={handleStatusChange}
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
              ✓ Changer
            </button>
          </div>
          {statusChangeError && (
            <div style={{
              marginTop: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: '#FEE2E2',
              padding: 'var(--spacing-md)',
              border: '1px solid #FECACA',
            }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: '#7C2D12',
                margin: '0',
              }}>
                ❌ {statusChangeError}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => navigate(`/invoices/${id}/edit`)}
            style={{
              padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
              backgroundColor: 'var(--btn-secondary-bg)',
              color: 'var(--btn-secondary-color)',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--btn-border-radius)',
              border: 'var(--btn-secondary-border)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: `background-color var(--transition-base)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--btn-secondary-bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--btn-secondary-bg)'
            }}
          >
            ✏️ Éditer
          </button>
          <button
            onClick={downloadPDF}
            style={{
              padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
              backgroundColor: '#F59E0B',
              color: 'white',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--btn-border-radius)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: `background-color var(--transition-base)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#DABA3D'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#F59E0B'
            }}
          >
            📥 Télécharger PDF
          </button>
          <button
            onClick={deleteInvoice}
            style={{
              padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
              backgroundColor: '#FEE2E2',
              color: '#7C2D12',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--btn-border-radius)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: `background-color var(--transition-base)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FECACA'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FEE2E2'
            }}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
