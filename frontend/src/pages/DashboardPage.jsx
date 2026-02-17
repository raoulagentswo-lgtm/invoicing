/**
 * Dashboard Page Component (Modern Version)
 * 
 * Main dashboard showing user overview with cards and statistics
 * Uses design-tokens.css for styling with modern indigo theme
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import axios from 'axios'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setUser(r.data))
  }, [token])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      paddingBottom: 'var(--spacing-lg)',
    }}>
      {/* Navigation Bar */}
      <Navigation />

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-lg)',
      }}>
        {/* Welcome Section */}
        <div style={{
          marginBottom: 'var(--spacing-xl)',
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            Bienvenue {user?.first_name || user?.firstName || 'utilisateur'}! 👋
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
          }}>
            Voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          {/* Invoices Card */}
          <div
            onClick={() => navigate('/invoices')}
            onMouseEnter={() => setHoveredCard('invoices')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              backgroundColor: 'var(--color-bg)',
              border: 'var(--card-border)',
              boxShadow: hoveredCard === 'invoices' ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
              cursor: 'pointer',
              transition: `box-shadow var(--transition-base), transform var(--transition-base)`,
              transform: hoveredCard === 'invoices' ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-md)',
            }}>
              <h2 style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                margin: '0',
              }}>
                Factures
              </h2>
              <div style={{
                fontSize: '32px',
              }}>
                📄
              </div>
            </div>
            <p style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
              margin: '0 0 var(--spacing-sm) 0',
            }}>
              0
            </p>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: '0',
            }}>
              Cliquez pour voir les factures
            </p>
          </div>

          {/* Clients Card */}
          <div
            onClick={() => navigate('/clients')}
            onMouseEnter={() => setHoveredCard('clients')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              backgroundColor: 'var(--color-bg)',
              border: 'var(--card-border)',
              boxShadow: hoveredCard === 'clients' ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
              cursor: 'pointer',
              transition: `box-shadow var(--transition-base), transform var(--transition-base)`,
              transform: hoveredCard === 'clients' ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-md)',
            }}>
              <h2 style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                margin: '0',
              }}>
                Clients
              </h2>
              <div style={{
                fontSize: '32px',
              }}>
                👥
              </div>
            </div>
            <p style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-secondary)',
              margin: '0 0 var(--spacing-sm) 0',
            }}>
              0
            </p>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: '0',
            }}>
              Cliquez pour gérer les clients
            </p>
          </div>

          {/* Payments Card */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              backgroundColor: 'var(--color-bg)',
              border: 'var(--card-border)',
              boxShadow: hoveredCard === 'payments' ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
              cursor: 'default',
              transition: `box-shadow var(--transition-base), transform var(--transition-base)`,
              transform: hoveredCard === 'payments' ? 'translateY(-4px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setHoveredCard('payments')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-md)',
            }}>
              <h2 style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                margin: '0',
              }}>
                Revenus
              </h2>
              <div style={{
                fontSize: '32px',
              }}>
                💰
              </div>
            </div>
            <p style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-success)',
              margin: '0 0 var(--spacing-sm) 0',
            }}>
              €0
            </p>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: '0',
            }}>
              Total reçu ce mois
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: 'var(--spacing-xl)',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--border-radius-lg)',
          backgroundColor: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-200)',
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-h3)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-md)',
            margin: '0 0 var(--spacing-md) 0',
          }}>
            🚀 Actions rapides
          </h3>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => navigate('/invoices/new')}
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
              ➕ Nouvelle facture
            </button>
            <button
              onClick={() => navigate('/clients/new')}
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
              ➕ Nouveau client
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
