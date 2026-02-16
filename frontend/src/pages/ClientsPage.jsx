/**
 * Clients List Page Component (Modern Version)
 * 
 * Displays a list of all clients with modern table design
 * Uses design-tokens.css for styling with modern indigo theme
 */

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
  }, [token, navigate])

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
          👥 Clients
        </h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button
            onClick={() => navigate('/dashboard')}
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
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate('/clients/create')}
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
            ➕ Nouveau Client
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
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
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
            }}>
              ⏳ Chargement des clients...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && clients.length === 0 && (
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
              📭 Aucun client pour le moment
            </p>
            <button
              onClick={() => navigate('/clients/create')}
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
              ➕ Créer le premier client
            </button>
          </div>
        )}

        {/* Clients Table */}
        {!loading && clients.length > 0 && (
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
                    Nom
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: 'var(--spacing-md)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}>
                    Téléphone
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
                {clients.map((client, index) => (
                  <tr
                    key={client.id}
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
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}>
                      {client.name}
                    </td>
                    <td style={{
                      padding: 'var(--spacing-md)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {client.email}
                    </td>
                    <td style={{
                      padding: 'var(--spacing-md)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {client.phone || '—'}
                    </td>
                    <td style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-sm)',
                        justifyContent: 'center',
                      }}>
                        <button
                          onClick={() => navigate(`/clients/${client.id}/edit`)}
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
                        >
                          ✏️ Éditer
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
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
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
