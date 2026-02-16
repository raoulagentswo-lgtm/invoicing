import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  }, [id, token])

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
      'DRAFT': '#FFA500',
      'SENT': '#2196F3',
      'PAID': '#4CAF50',
      'OVERDUE': '#f44336',
      'CANCELLED': '#999'
    }
    return colors[status] || '#999'
  }

  if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>
  if (!invoice) return <div style={{ padding: '20px' }}>Facture non trouvée</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>Détail Facture</h1>
        <button onClick={() => navigate('/invoices')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retour</button>
      </nav>

      {/* Invoice Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}>
        <div>
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{invoice.invoice_number || 'N/A'}</h2>
            <p style={{ margin: '0', color: '#666' }}>Date: {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</p>
            <p style={{ margin: '0', color: '#666' }}>Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}</p>
          </div>
          <div style={{ marginTop: '15px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>Client</h3>
            <p style={{ margin: '0' }}>{client?.name || 'N/A'}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>{client?.email || ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            backgroundColor: getStatusColor(invoice.status),
            color: 'white',
            fontSize: '1.1em',
            fontWeight: 'bold'
          }}>
            {invoice.status}
          </span>
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>Montant total</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '1.8em', fontWeight: 'bold', color: '#333' }}>
              €{invoice.total_amount?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Détails de la facture</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>Description</p>
            <p style={{ margin: '0' }}>{invoice.description || '-'}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>Notes</p>
            <p style={{ margin: '0' }}>{invoice.notes || '-'}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>Conditions de paiement</p>
            <p style={{ margin: '0' }}>{invoice.payment_terms || '-'}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>Devise</p>
            <p style={{ margin: '0' }}>{invoice.currency || 'EUR'}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoice.lineItems && invoice.lineItems.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Lignes</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Description</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Quantité</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Prix unit.</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.description}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>€{item.unit_price?.toFixed(2) || '0.00'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>€{item.amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 250px',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div></div>
        <div style={{ 
          border: '1px solid #ddd',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Sous-total HT:</span>
            <span>€{invoice.subtotal_amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>TVA ({invoice.tax_rate}%):</span>
            <span>€{invoice.tax_amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '1.1em',
            borderTop: '1px solid #ddd',
            paddingTop: '10px'
          }}>
            <span>Total TTC:</span>
            <span>€{invoice.total_amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Status Change */}
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '15px', 
        borderRadius: '4px',
        marginBottom: '30px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Changer le statut</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end' }}>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="DRAFT">Brouillon</option>
            <option value="SENT">Envoyée</option>
            <option value="PAID">Payée</option>
            <option value="OVERDUE">En retard</option>
            <option value="CANCELLED">Annulée</option>
          </select>
          <button
            onClick={handleStatusChange}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              border: 'none'
            }}
          >
            Changer
          </button>
        </div>
        {statusChangeError && <p style={{ color: 'red', marginTop: '10px' }}>{statusChangeError}</p>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate(`/invoices/${id}/edit`)}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '4px',
            border: 'none'
          }}
        >
          Éditer
        </button>
        <button
          onClick={downloadPDF}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '4px',
            border: 'none'
          }}
        >
          Télécharger PDF
        </button>
        <button
          onClick={deleteInvoice}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '4px',
            border: 'none'
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
