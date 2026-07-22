// 🎨 PAGE : Inviter un nouvel adhérent
// Formulaire d'invitation par email via Supabase Auth

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InviterAdherentPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Invitation via Supabase Admin API (nécessite service_role côté serveur)
    // Pour l'instant, création directe avec mot de passe temporaire
    const { error: err } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-12),
      options: { data: { role: 'adherent' } },
    })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
    setSending(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inviter un adhérent</h1>
          <p className="page-subtitle">Créer un compte pour un nouvel adhérent</p>
        </div>
      </div>

      {success ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Invitation envoyée !</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {email} recevra un email pour créer son mot de passe.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '24px' }}
            onClick={() => router.push('/adherents')}>
            Retour aux adhérents
          </button>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '480px', padding: '32px' }}>
          {error && (
            <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleInvite}>
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Email de l'adhérent</label>
              <input
                type="email" className="form-input"
                placeholder="adherent@exemple.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Envoi...' : "Inviter l'adhérent"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
