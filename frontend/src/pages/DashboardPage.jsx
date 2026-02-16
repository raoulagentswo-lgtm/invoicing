import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setUser(r.data))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>Invoicing App</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/clients')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Clients</button>
          <button onClick={() => navigate('/invoices')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Factures</button>
          <button onClick={() => navigate('/profile')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Profil</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f0f0f0' }}>Déconnexion</button>
        </div>
      </nav>

      {/* Welcome Section */}
      <h1>Bienvenue {user?.first_name || 'User'}!</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => navigate('/invoices')}>
          <h2>Factures</h2>
          <p style={{ fontSize: '2em', color: 'blue' }}>0</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Voir les factures</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => navigate('/clients')}>
          <h2>Clients</h2>
          <p style={{ fontSize: '2em', color: 'green' }}>0</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Gérer les clients</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
          <h2>Paiements</h2>
          <p style={{ fontSize: '2em', color: 'purple' }}>€0</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Total reçu</p>
        </div>
      </div>
    </div>
  )
}
