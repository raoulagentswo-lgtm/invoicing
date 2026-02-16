import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'

export default function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', data)
      localStorage.setItem('token', res.data.token)
      setIsLoggedIn(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h1>Connexion</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('email')} placeholder="Email" />
        <input {...register('password')} type="password" placeholder="Mot de passe" />
        <button type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
      <p><a href="/register">Pas de compte ?</a></p>
    </div>
  )
}
