/**
 * User Login Page Component (Modern Version)
 * 
 * Allows users to log in with email/password and optional "Remember me" checkbox
 * Uses design-tokens.css for styling
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'

export default function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      email: localStorage.getItem('rememberEmail') || '',
      password: '',
      rememberMe: !!localStorage.getItem('rememberEmail')
    }
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data) => {
    setIsLoading(true)
    setServerError(null)
    setErrorType(null)

    try {
      const response = await axios.post('/api/auth/login', data)
      const token = response.data?.data?.accessToken || response.data?.accessToken || response.data?.token
      
      if (!token) {
        throw new Error('No token in response: ' + JSON.stringify(response.data))
      }

      localStorage.setItem('token', token)
      console.log('✅ Token saved to localStorage:', token?.substring(0, 20) + '...')

      // Handle "Remember me" functionality
      if (data.rememberMe) {
        localStorage.setItem('rememberEmail', data.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }

      setLoginSuccess(true)
      reset()

      // Redirect after brief delay
      setTimeout(() => {
        setIsLoggedIn(true)
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      console.error('Login error:', err)
      setServerError(err.response?.data?.message || err.message || 'Erreur de connexion')
      if (err.response?.data?.code === 'ACCOUNT_LOCKED') {
        setErrorType('account_locked')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, var(--color-primary-50), var(--color-primary-100))',
      padding: 'var(--spacing-lg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            Facturation
          </h1>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
          }}>
            Se connecter à votre compte
          </p>
        </div>

        {/* Success Message */}
        {loginSuccess && (
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: '#CCFBF1',
            padding: 'var(--spacing-md)',
            border: '1px solid #99F6E4',
          }}>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: '#0F766E',
            }}>
              ✅ Connexion réussie! Redirection en cours...
            </p>
          </div>
        )}

        {/* Error Message */}
        {serverError && (
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: '#FEE2E2',
            padding: 'var(--spacing-md)',
            border: '1px solid #FECACA',
          }}>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: '#7C2D12',
            }}>
              ❌ {serverError}
            </p>
            {errorType === 'account_locked' && (
              <p style={{
                marginTop: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-xs)',
                color: '#DC2626',
              }}>
                Le compte sera déverrouillé dans 15 minutes.
              </p>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg)',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: 'var(--form-label-font-size)',
              fontWeight: 'var(--form-label-font-weight)',
              color: 'var(--form-label-color)',
              marginBottom: 'var(--form-label-margin-bottom)',
            }}>
              Adresse Email *
            </label>
            <input
              type="email"
              id="email"
              placeholder="vous@exemple.com"
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
              {...register('email', {
                required: 'Email requis',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Format email invalide'
                }
              })}
              disabled={isLoading}
              autoComplete="email"
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

          {/* Password Field */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--form-label-margin-bottom)',
            }}>
              <label htmlFor="password" style={{
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
              }}>
                Mot de passe *
              </label>
              <Link to="/reset-password" style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-medium)',
              }}>
                Mot de passe oublié?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: 'var(--input-padding)',
                border: errors.password ? '1.5px solid #DC2626' : 'var(--input-border)',
                borderRadius: 'var(--input-border-radius)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--input-color)',
                fontSize: 'var(--font-size-base)',
                transition: 'border-color var(--transition-fast)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = 'var(--input-border-focus)'
                  e.target.style.boxShadow = 'var(--input-shadow-focus)'
                }
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
              {...register('password', {
                required: 'Mot de passe requis'
              })}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p style={{
                marginTop: 'var(--spacing-xs)',
                fontSize: 'var(--font-size-sm)',
                color: '#DC2626',
              }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <input
              type="checkbox"
              id="rememberMe"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                borderColor: 'var(--color-border)',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)',
              }}
              {...register('rememberMe')}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" style={{
              marginLeft: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}>
              Se souvenir de moi (90 jours)
            </label>
          </div>

          {/* Security Notice */}
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--badge-info-bg)',
            padding: 'var(--spacing-md)',
            border: 'var(--badge-info-border)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--badge-info-color)',
            }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>🔒 Sécurité:</span> Ne partagez jamais votre mot de passe.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
              backgroundColor: isLoading ? '#9CA3AF' : 'var(--btn-primary-bg)',
              color: 'white',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--btn-border-radius)',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: `background-color var(--transition-base), box-shadow var(--transition-base)`,
              boxShadow: isLoading ? 'none' : 'var(--shadow-button)',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'var(--btn-primary-bg-hover)'
                e.target.style.boxShadow = 'var(--shadow-button-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'var(--btn-primary-bg)'
                e.target.style.boxShadow = 'var(--shadow-button)'
              }
            }}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          {/* Sign Up Link */}
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            Pas de compte?{' '}
            <Link to="/register" style={{
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              textDecoration: 'none',
            }}>
              En créer un
            </Link>
          </p>
        </form>

        {/* Rate Limit Info */}
        <div style={{
          borderRadius: 'var(--border-radius-lg)',
          backgroundColor: '#FEF3C7',
          padding: 'var(--spacing-md)',
          border: '1px solid #FCD34D',
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: '#78350F',
          }}>
            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>⏱️ Limitation:</span> Maximum 10 tentatives par 15 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
