import { createClient } from '@/lib/supabase/server'
import { Users, Dumbbell, CalendarDays, MessageSquare, TrendingUp, Activity } from 'lucide-react'

export const metadata = {
  title: 'Dashboard — La Minute Muscu Coach',
}

async function getStats() {
  try {
    const supabase = await createClient()
    const [adherentsRes, exercicesRes, programmesRes, messagesRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'adherent'),
      supabase.from('exercise_library').select('id', { count: 'exact' }),
      supabase.from('programs').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('messages').select('id', { count: 'exact' }).eq('is_read', false),
    ])
    return {
      adherents: adherentsRes.count ?? 0,
      exercices: exercicesRes.count ?? 0,
      programmes: programmesRes.count ?? 0,
      messages: messagesRes.count ?? 0,
    }
  } catch {
    return { adherents: 0, exercices: 0, programmes: 0, messages: 0 }
  }
}

const stats = [
  { key: 'adherents', label: 'Adhérents actifs', icon: Users, color: 'var(--gold-primary)', delta: '+2 ce mois' },
  { key: 'exercices', label: 'Exercices en bibliothèque', icon: Dumbbell, color: 'var(--accent-blue)', delta: 'Catalogue complet' },
  { key: 'programmes', label: 'Programmes actifs', icon: CalendarDays, color: 'var(--accent-green)', delta: 'En cours' },
  { key: 'messages', label: 'Messages non lus', icon: MessageSquare, color: 'var(--accent-red)', delta: 'À traiter' },
]

export default async function DashboardPage() {
  const data = await getStats()

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonjour, Coach 👋</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse-gold 2s infinite' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-green)' }}>Système actif</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat) => {
          const value = data[stat.key as keyof typeof data]
          return (
            <div key={stat.key} className="stat-card">
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
              </div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{stat.label}</div>
              <div style={{ marginTop: '8px' }}>
                <span className="badge badge-gray" style={{ fontSize: '11px' }}>{stat.delta}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Activité récente */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} color="var(--gold-primary)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Activité récente
              </h2>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { name: 'Thomas D.', action: 'a terminé sa séance Chest & Triceps', time: 'Il y a 1h', avatar: 'T', color: '#6366F1' },
                { name: 'Sophie M.', action: 'a envoyé un message', time: 'Il y a 2h', avatar: 'S', color: '#F59E0B' },
                { name: 'Kevin L.', action: 'a renseigné son poids du jour : 82.5 kg', time: 'Il y a 3h', avatar: 'K', color: '#10B981' },
                { name: 'Léa B.', action: 'a commencé le Programme Force 12 semaines', time: 'Il y a 5h', avatar: 'L', color: '#EF4444' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 0',
                  borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <div className="avatar-fallback" style={{ width: '36px', height: '36px', fontSize: '14px', background: `${item.color}20`, borderColor: `${item.color}30`, color: item.color }}>
                    {item.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name} </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.action}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Séances d'aujourd'hui */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={18} color="var(--gold-primary)" />
                <h2 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  Séances du jour
                </h2>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Thomas D.', session: 'Push Day A', done: true },
                  { name: 'Sophie M.', session: 'HIIT Cardio', done: false },
                  { name: 'Kevin L.', session: 'Pull Day B', done: false },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: item.done ? 'var(--accent-green)' : 'var(--text-muted)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.session}</div>
                    </div>
                    <span className={`badge ${item.done ? 'badge-green' : 'badge-gray'}`}>
                      {item.done ? '✓ Fait' : 'Prévu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-gold">
            <div className="card-header">
              <h2 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Actions rapides
              </h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Créer un programme', href: '/programmes/nouveau', icon: CalendarDays },
                { label: 'Ajouter un exercice', href: '/exercices', icon: Dumbbell },
                { label: 'Inviter un adhérent', href: '/adherents/inviter', icon: Users },
              ].map((action, i) => (
                <a key={i} href={action.href} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <action.icon size={16} />
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
