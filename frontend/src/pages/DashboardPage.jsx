import { useEffect, useState } from 'react'
import axios from 'axios'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setUser(r.data))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Bienvenue {user?.first_name || 'User'}!</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h2>Factures</h2>
          <p style={{ fontSize: '2em', color: 'blue' }}>0</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h2>Clients</h2>
          <p style={{ fontSize: '2em', color: 'green' }}>0</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h2>Paiements</h2>
          <p style={{ fontSize: '2em', color: 'purple' }}>€0</p>
        </div>
      </div>
      <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
        Se déconnecter
      </button>
    </div>
  )
}
