import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  }, [statusFilter])

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
      'DRAFT': '#FFA500',
      'SENT': '#2196F3',
      'PAID': '#4CAF50',
      'OVERDUE': '#f44336',
      'CANCELLED': '#999'
    }
    return colors[status] || '#999'
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>Factures</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Dashboard</button>
          <button onClick={() => navigate('/invoices/create')} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white' }}>+ Nouvelle facture</button>
        </div>
      </nav>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold' }}>Filtrer par statut:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">Tous</option>
          <option value="DRAFT">Brouillon</option>
          <option value="SENT">Envoyée</option>
          <option value="PAID">Payée</option>
          <option value="OVERDUE">En retard</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Chargement...</p>}

      {!loading && invoices.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Aucune facture</p>
          <button onClick={() => navigate('/invoices/create')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white' }}>
            Créer la première facture
          </button>
        </div>
      )}

      {!loading && invoices.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Numéro</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Client</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Montant</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Statut</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Date</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <a href="#" onClick={(e) => {
                    e.preventDefault()
                    navigate(`/invoices/${invoice.id}`)
                  }} style={{ color: '#2196F3', cursor: 'pointer' }}>
                    {invoice.invoice_number}
                  </a>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{invoice.client_name || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>
                  {invoice.total_amount ? `€${invoice.total_amount.toFixed(2)}` : '€0.00'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: getStatusColor(invoice.status),
                    color: 'white',
                    fontSize: '0.9em'
                  }}>
                    {invoice.status}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                  <button 
                    onClick={() => navigate(`/invoices/${invoice.id}`)} 
                    style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Voir
                  </button>
                  <button 
                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)} 
                    style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Éditer
                  </button>
                  <button 
                    onClick={() => deleteInvoice(invoice.id)} 
                    style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
