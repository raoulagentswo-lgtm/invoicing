/**
 * Profile Page Component
 * 
 * Displays user profile information
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import axios from 'axios'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [token, navigate])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data?.data || {})
    } catch (err) {
      setError('Erreur lors du chargement du profil')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
    }}>
      {/* Navigation Bar */}
      <Navigation />

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-lg)',
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-h2)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          👤 Mon Profil
        </h2>

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
              ⏳ Chargement du profil...
            </p>
          </div>
        )}

        {/* Profile Card */}
        {!loading && profile && (
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--color-bg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--spacing-lg)',
          }}>
            <div style={{
              display: 'grid',
              gap: 'var(--spacing-md)',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Email
                </label>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  margin: '0',
                }}>
                  {profile.email || '—'}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Rôle
                </label>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  margin: '0',
                }}>
                  {profile.role || 'User'}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Date de création
                </label>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  margin: '0',
                }}>
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
