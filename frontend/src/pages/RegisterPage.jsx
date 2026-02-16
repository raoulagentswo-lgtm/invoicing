import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  confirmPassword: z.string().min(1, 'Requis'),
}).refine((data) => data.password.trim() === data.confirmPassword.trim(), {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    console.log('[REGISTER] Form data received:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: `[${data.password ? data.password.length : 0} chars]`,
      confirmPassword: `[${data.confirmPassword ? data.confirmPassword.length : 0} chars]`,
      passwordMatch: data.password === data.confirmPassword,
      passwordTrimMatch: data.password?.trim() === data.confirmPassword?.trim(),
    })

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/register', data)
      console.log('[REGISTER] Success:', response.status, response.data)
      navigate('/login?registered=true')
    } catch (err) {
      console.error('[REGISTER] Error:', {
        status: err.response?.status,
        code: err.response?.data?.code,
        message: err.response?.data?.message,
        details: err.response?.data?.details,
      })
      setError(err.response?.data?.message || 'Erreur')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  }

  const errorStyle = {
    color: 'red',
    fontSize: '12px',
    marginTop: '-8px',
    marginBottom: '8px',
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h1>Inscription</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label style={labelStyle}>Email</label>
          <input {...register('email')} type="email" placeholder="Email" style={inputStyle} />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Prénom</label>
          <input {...register('firstName')} placeholder="Prénom" style={inputStyle} />
          {errors.firstName && <p style={errorStyle}>{errors.firstName.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Nom</label>
          <input {...register('lastName')} placeholder="Nom" style={inputStyle} />
          {errors.lastName && <p style={errorStyle}>{errors.lastName.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Mot de passe</label>
          <input {...register('password')} type="password" placeholder="Mot de passe" style={inputStyle} />
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Confirmer mot de passe</label>
          <input {...register('confirmPassword')} type="password" placeholder="Confirmer mot de passe" style={inputStyle} />
          {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Inscription...' : 'S\'inscrire'}</button>
      </form>
      <p><a href="/login">Déjà inscrit ?</a></p>
    </div>
  )
}
