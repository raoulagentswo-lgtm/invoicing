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

  useEffect(() => {
    if (id) {
      // Load client data for editing
      axios.get(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const client = res.data
        Object.keys(client).forEach(key => setValue(key, client[key]))
      }).catch(err => setError('Erreur lors du chargement du client'))
      .finally(() => setLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        // Update
        await axios.put(`/api/clients/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create
        await axios.post('/api/clients', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/clients')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>{id ? 'Éditer Client' : 'Nouveau Client'}</h1>
        <button onClick={() => navigate('/clients')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retour</button>
      </nav>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Chargement...</p>}

      {!loading && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nom</label>
            <input {...register('name', { required: 'Nom requis' })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
            {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input {...register('email', { required: 'Email requis' })} type="email" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
            {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Téléphone</label>
            <input {...register('phone')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Adresse</label>
            <input {...register('street')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Ville</label>
              <input {...register('city')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Code Postal</label>
              <input {...register('postal_code')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Pays</label>
            <input {...register('country')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer', borderRadius: '4px', border: 'none' }}>
            {loading ? 'Enregistrement...' : id ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      )}
    </div>
  )
}
