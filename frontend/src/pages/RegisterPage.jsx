/**
 * User Registration Page Component (Modern Version)
 * 
 * Allows users to create a new account with email, name, and password
 * Uses design-tokens.css for styling with modern indigo theme
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'

const schema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  password: z.string()
    .min(8, 'Min 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre')
    .regex(/[!@#$%^&*]/, 'Au moins 1 caractère spécial'),
  passwordConfirmation: z.string().min(1, 'Requis'),
}).refine((data) => data.password.trim() === data.passwordConfirmation.trim(), {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirmation"],
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const onSubmit = async (data) => {
    console.log('[REGISTER] Form data received:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: `[${data.password ? data.password.length : 0} chars]`,
      passwordConfirmation: `[${data.passwordConfirmation ? data.passwordConfirmation.length : 0} chars]`,
      passwordMatch: data.password === data.passwordConfirmation,
      passwordTrimMatch: data.password?.trim() === data.passwordConfirmation?.trim(),
    })

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/register', data)
      console.log('[REGISTER] Success:', response.status, response.data)
      setRegistrationSuccess(true)
      reset()
      // Redirect after brief delay
      setTimeout(() => {
        navigate('/login?registered=true')
      }, 1500)
    } catch (err) {
      console.error('[REGISTER] Error:', {
        status: err.response?.status,
        code: err.response?.data?.code,
        message: err.response?.data?.message,
        details: err.response?.data?.details,
      })
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    }
    setLoading(false)
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
        maxWidth: '480px',
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
            Créer un compte
          </h1>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
          }}>
            Rejoignez Facturation dès maintenant
          </p>
        </div>

        {/* Success Message */}
        {registrationSuccess && (
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
              ✅ Inscription réussie! Redirection vers la connexion...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
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
              ❌ {error}
            </p>
          </div>
        )}

        {/* Registration Form */}
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
              {...register('email')}
              disabled={loading}
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

          {/* Name Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-md)',
          }}>
            {/* First Name */}
            <div>
              <label htmlFor="firstName" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Jean"
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: errors.firstName ? '1.5px solid #DC2626' : 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.firstName) {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
                {...register('firstName')}
                disabled={loading}
              />
              {errors.firstName && (
                <p style={{
                  marginTop: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: '#DC2626',
                }}>
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" style={{
                display: 'block',
                fontSize: 'var(--form-label-font-size)',
                fontWeight: 'var(--form-label-font-weight)',
                color: 'var(--form-label-color)',
                marginBottom: 'var(--form-label-margin-bottom)',
              }}>
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Dupont"
                style={{
                  width: '100%',
                  padding: 'var(--input-padding)',
                  border: errors.lastName ? '1.5px solid #DC2626' : 'var(--input-border)',
                  borderRadius: 'var(--input-border-radius)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-color)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.lastName) {
                    e.target.style.borderColor = 'var(--input-border-focus)'
                    e.target.style.boxShadow = 'var(--input-shadow-focus)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
                {...register('lastName')}
                disabled={loading}
              />
              {errors.lastName && (
                <p style={{
                  marginTop: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: '#DC2626',
                }}>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: 'var(--form-label-font-size)',
              fontWeight: 'var(--form-label-font-weight)',
              color: 'var(--form-label-color)',
              marginBottom: 'var(--form-label-margin-bottom)',
            }}>
              Mot de passe *
            </label>
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
              {...register('password')}
              disabled={loading}
              autoComplete="new-password"
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

          {/* Password Confirmation Field */}
          <div>
            <label htmlFor="passwordConfirmation" style={{
              display: 'block',
              fontSize: 'var(--form-label-font-size)',
              fontWeight: 'var(--form-label-font-weight)',
              color: 'var(--form-label-color)',
              marginBottom: 'var(--form-label-margin-bottom)',
            }}>
              Confirmer mot de passe *
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: 'var(--input-padding)',
                border: errors.passwordConfirmation ? '1.5px solid #DC2626' : 'var(--input-border)',
                borderRadius: 'var(--input-border-radius)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--input-color)',
                fontSize: 'var(--font-size-base)',
                transition: 'border-color var(--transition-fast)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (!errors.passwordConfirmation) {
                  e.target.style.borderColor = 'var(--input-border-focus)'
                  e.target.style.boxShadow = 'var(--input-shadow-focus)'
                }
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
              {...register('passwordConfirmation')}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.passwordConfirmation && (
              <p style={{
                marginTop: 'var(--spacing-xs)',
                fontSize: 'var(--font-size-sm)',
                color: '#DC2626',
              }}>
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>

          {/* Password Requirements Notice */}
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--badge-info-bg)',
            padding: 'var(--spacing-md)',
            border: 'var(--badge-info-border)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--badge-info-color)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-xs)',
            }}>
              🔐 Exigences du mot de passe:
            </p>
            <ul style={{
              listStyle: 'none',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--badge-info-color)',
              paddingLeft: '0',
            }}>
              <li>✓ Minimum 8 caractères</li>
              <li>✓ Au moins 1 majuscule</li>
              <li>✓ Au moins 1 chiffre</li>
              <li>✓ Au moins 1 caractère spécial (!@#$%^&*)</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 'var(--spacing-button-vertical) var(--spacing-button-horizontal)',
              backgroundColor: loading ? '#9CA3AF' : 'var(--btn-primary-bg)',
              color: 'white',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--btn-border-radius)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: `background-color var(--transition-base), box-shadow var(--transition-base)`,
              boxShadow: loading ? 'none' : 'var(--shadow-button)',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'var(--btn-primary-bg-hover)'
                e.target.style.boxShadow = 'var(--shadow-button-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'var(--btn-primary-bg)'
                e.target.style.boxShadow = 'var(--shadow-button)'
              }
            }}
          >
            {loading ? 'Inscription en cours...' : 'Créer un compte'}
          </button>

          {/* Login Link */}
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            Vous avez déjà un compte?{' '}
            <Link to="/login" style={{
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              textDecoration: 'none',
            }}>
              Se connecter
            </Link>
          </p>
        </form>

        {/* Terms Notice */}
        <div style={{
          borderRadius: 'var(--border-radius-lg)',
          backgroundColor: '#FEF3C7',
          padding: 'var(--spacing-md)',
          border: '1px solid #FCD34D',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'var(--font-size-xs)',
            color: '#78350F',
          }}>
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  )
}
