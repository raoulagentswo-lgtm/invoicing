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
  const [error, setError] = useState('')
  const [clients, setClients] = useState([])
  const [lineItems, setLineItems] = useState([])
  const [selectedClient, setSelectedClient] = useState('')

  const subtotal = watch('subtotalAmount')
  const taxRate = watch('taxRate')
  const taxAmount = subtotal ? (subtotal * taxRate) / 100 : 0
  const totalAmount = subtotal ? subtotal + taxAmount : 0

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
  }, [id, token, navigate])

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
    setLoading(true)
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
      setError(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>{id ? 'Éditer Facture' : 'Nouvelle Facture'}</h1>
        <button onClick={() => navigate('/invoices')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retour</button>
      </nav>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Chargement...</p>}

      {!loading && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Client Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Client *</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Dates and Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Date facture</label>
              <input 
                {...register('invoiceDate')} 
                type="datetime-local" 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Date échéance</label>
              <input 
                {...register('dueDate')} 
                type="datetime-local" 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Statut</label>
              <select 
                {...register('status')} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="SENT">Envoyée</option>
                <option value="PAID">Payée</option>
              </select>
            </div>
          </div>

          {/* Description and Notes */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
            <textarea 
              {...register('description')} 
              rows="3"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'sans-serif' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Notes</label>
            <textarea 
              {...register('notes')} 
              rows="3"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'sans-serif' }} 
            />
          </div>

          {/* Line Items */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <h3>Lignes factures</h3>
            {lineItems.length === 0 ? (
              <p style={{ color: '#999' }}>Aucune ligne</p>
            ) : (
              <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', width: '80px' }}>Quantité</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', width: '100px' }}>Prix unit.</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', width: '100px' }}>Montant</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '60px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <input
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                        €{item.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          style={{ padding: '4px 8px', backgroundColor: '#f44336', color: 'white', cursor: 'pointer', borderRadius: '4px', border: 'none' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              type="button"
              onClick={addLineItem}
              style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', cursor: 'pointer', borderRadius: '4px', border: 'none' }}
            >
              + Ajouter ligne
            </button>
          </div>

          {/* Tax and Totals */}
          <div style={{ 
            borderTop: '1px solid #ddd', 
            paddingTop: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 200px',
            gap: '20px',
            alignItems: 'start'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Taux TVA (%)</label>
              <input 
                {...register('taxRate', { valueAsNumber: true })} 
                type="number" 
                step="0.01"
                style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} 
              />
            </div>
            <div style={{ 
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Sous-total HT:</span>
                <span>€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>TVA ({taxRate}%):</span>
                <span>€{taxAmount.toFixed(2)}</span>
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
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment and Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Devise</label>
              <select 
                {...register('currency')} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Conditions de paiement</label>
              <input 
                {...register('paymentTerms')} 
                placeholder="Ex: Net 30"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              padding: '12px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              cursor: 'pointer', 
              borderRadius: '4px', 
              border: 'none',
              fontSize: '1em',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Enregistrement...' : id ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      )}
    </div>
  )
}
