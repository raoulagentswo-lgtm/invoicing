import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button } from '../components/Button'
import { Form, FormGroup, FormLabel, FormInput, FormError } from '../components/Form'
import '../styles/LoginPage.css'

export default function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { email: '', password: '' }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/auth/login', data)
      const token = res.data?.data?.accessToken || res.data?.accessToken || res.data?.token
      if (!token) {
        throw new Error('No token in response: ' + JSON.stringify(res.data))
      }
      localStorage.setItem('token', token)
      console.log('✅ Token saved to localStorage:', token?.substring(0, 20) + '...')
      setIsLoggedIn(true)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || err.message || 'Erreur de connexion')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Brand Section */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="currentColor" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" 
                    fill="white" fontSize="24" fontWeight="bold">
                F
              </text>
            </svg>
          </div>
          <h1 className="login-title">Facturation Pro</h1>
          <p className="login-subtitle">Gestion professionnelle de vos factures</p>
        </div>

        {/* Form Section */}
        <Form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {error && (
            <div className="login-error-alert" role="alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <FormGroup>
            <FormLabel htmlFor="email" required>
              Adresse email
            </FormLabel>
            <FormInput
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register('email', {
                required: 'Email requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide'
                }
              })}
              error={!!errors.email}
              disabled={loading}
            />
            {errors.email && (
              <FormError id="email-error" message={errors.email.message} />
            )}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="password" required>
              Mot de passe
            </FormLabel>
            <FormInput
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Mot de passe requis',
                minLength: {
                  value: 6,
                  message: 'Minimum 6 caractères'
                }
              })}
              error={!!errors.password}
              disabled={loading}
            />
            {errors.password && (
              <FormError id="password-error" message={errors.password.message} />
            )}
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </Form>

        {/* Footer Section */}
        <div className="login-footer">
          <p className="login-register-prompt">
            Pas de compte ?{' '}
            <a href="/register" className="login-register-link">
              S'inscrire
            </a>
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="login-background">
        <div className="login-shape login-shape-1"></div>
        <div className="login-shape login-shape-2"></div>
      </div>
    </div>
  )
}
