import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    console.log('ClientsPage - Token from localStorage:', token?.substring(0, 20) + '...')
    if (!token) {
      navigate('/login')
    }
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Clients API Response:', res.data)
      setClients(res.data?.data || [])
    } catch (err) {
      setError('Erreur lors de la récupération des clients')
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteClient = async (clientId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
    try {
      await axios.delete(`/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClients(clients.filter(c => c.id !== clientId))
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>Clients</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Dashboard</button>
          <button onClick={() => navigate('/clients/create')} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white' }}>+ Nouveau Client</button>
        </div>
      </nav>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Chargement...</p>}

      {!loading && clients.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Aucun client</p>
          <button onClick={() => navigate('/clients/create')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white' }}>
            Créer le premier client
          </button>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Nom</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Téléphone</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{client.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{client.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{client.phone || '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => navigate(`/clients/${client.id}/edit`)} style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}>Éditer</button>
                  <button onClick={() => deleteClient(client.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white' }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
