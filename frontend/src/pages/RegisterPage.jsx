import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await axios.post('/api/auth/register', data)
      navigate('/login?registered=true')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h1>Inscription</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('email')} placeholder="Email" />
        <input {...register('firstName')} placeholder="Prénom" />
        <input {...register('lastName')} placeholder="Nom" />
        <input {...register('password')} type="password" placeholder="Mot de passe" />
        <button type="submit" disabled={loading}>{loading ? 'Inscription...' : 'S\'inscrire'}</button>
      </form>
      <p><a href="/login">Déjà inscrit ?</a></p>
    </div>
  )
}
