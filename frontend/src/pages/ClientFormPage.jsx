/**
 * Client Form Page Component (Modern Version)
 * 
 * Form to create or edit a client with contact and address information
 * Uses design-tokens.css for styling with modern indigo theme
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'

export default function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    console.log('ClientFormPage - Token from localStorage:', token?.substring(0, 20) + '...')
    if (!token) {
      navigate('/login')
    }
    
    if (id) {
      // Load client data for editing
      console.log('Loading client', id, 'with token')
      axios.get(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const client = res.data?.data || res.data
        Object.keys(client).forEach(key => setValue(key, client[key]))
      }).catch(err => {
        console.error('Error loading client:', err)
        setError('Erreur lors du chargement du client')
      })
      .finally(() => setLoading(false))
    }
  }, [id, token, navigate, setValue])

  const onSubmit = async (data) => {
    setSubmitLoading(true)
    try {
      if (id) {
        // Update
        console.log('Updating client with token:', token?.substring(0, 20) + '...')
        await axios.patch(`/api/clients/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create
        console.log('Creating client with token:', token?.substring(0, 20) + '...')
        await axios.post('/api/clients', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/clients')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitLoading(false)
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
          {id ? '✏️ Éditer Client' : '➕ Nouveau Client'}
        </h1>
        <button
          onClick={() => navigate('/clients')}
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
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '700px',
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
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--color-bg)',
            border: 'var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
            }}>
              ⏳ Chargement des données...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: 'var(--card-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Nom *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Nom du client"
                {...register('name', { required: 'Nom requis' })}
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: errors.name ? '1.5px solid #DC2626' : 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.name && (
                <p style={{
                  marginTop: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: '#DC2626',
                }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="client@exemple.com"
                {...register('email', { required: 'Email requis' })}
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: errors.email ? '1.5px solid #DC2626' : 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.email && (
                <p style={{
                  marginTop: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: '#DC2626',
                }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                {...register('phone')}
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-border-focus)'
                  e.target.style.boxShadow = 'var(--input-shadow-focus)'
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="street" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Adresse
              </label>
              <input
                id="street"
                type="text"
                placeholder="123 rue du client"
                {...register('street')}
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-border-focus)'
                  e.target.style.boxShadow = 'var(--input-shadow-focus)'
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* City and Postal Code */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-md)',
            }}>
              <div>
                <label htmlFor="city" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  Ville
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Paris"
                  {...register('city')}
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    border: 'var(--input-border)',
                    borderRadius: 'var(--input-border-radius)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="postal_code" style={{
                  display: 'block',
                  fontSize: 'var(--form-label-font-size)',
                  fontWeight: 'var(--form-label-font-weight)',
                  color: 'var(--form-label-color)',
                  marginBottom: 'var(--form-label-margin-bottom)',
                }}>
                  Code Postal
                </label>
                <input
                  id="postal_code"
                  type="text"
                  placeholder="75000"
                  {...register('postal_code')}
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    border: 'var(--input-border)',
                    borderRadius: 'var(--input-border-radius)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-color)',
                    fontSize: 'var(--font-size-base)',
                    transition: 'border-color var(--transition-fast)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Country Field */}
            <div>
              <label htmlFor="country" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Pays
              </label>
              <input
                id="country"
                type="text"
                placeholder="France"
                {...register('country')}
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-border-focus)'
                  e.target.style.boxShadow = 'var(--input-shadow-focus)'
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitLoading}
              style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
                backgroundColor: submitLoading ? '#9CA3AF' : 'var(--btn-primary-bg)',
                color: 'white',
                fontWeight: 'var(--font-weight-semibold)',
                borderRadius: 'var(--btn-border-radius)',
                border: 'none',
                cursor: submitLoading ? 'not-allowed' : 'pointer',
                fontSize: 'var(--font-size-base)',
                transition: `background-color var(--transition-base)`,
                opacity: submitLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitLoading) {
                  e.target.style.backgroundColor = 'var(--btn-primary-bg-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!submitLoading) {
                  e.target.style.backgroundColor = 'var(--btn-primary-bg)'
                }
              }}
            >
              {submitLoading ? 'Enregistrement en cours...' : id ? '💾 Mettre à jour' : '✅ Créer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
