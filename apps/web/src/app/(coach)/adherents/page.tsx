'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Filter, ChevronRight, TrendingUp, Activity, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { UserRow, ProfileAdherentRow, TrackingRow } from '@lmm/supabase'

type AdherentWithProfile = UserRow & {
  profiles_adherents: ProfileAdherentRow | null
  last_tracking?: TrackingRow | null
}

export default function AdherentsPage() {
  const [adherents, setAdherents] = useState<AdherentWithProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchAdherents = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select(`
        *,
        profiles_adherents(*)
      `)
      .eq('role', 'adherent')
      .order('created_at', { ascending: false })

    setAdherents((data as AdherentWithProfile[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAdherents()
  }, [fetchAdherents])

  const filtered = adherents.filter(a =>
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Adhérents</h1>
          <p className="page-subtitle">{adherents.length} membres dans votre programme</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm">
            <Filter size={15} />
            Filtrer
          </button>
          <Link href="/adherents/inviter" className="btn btn-primary btn-sm">
            <Plus size={15} />
            Inviter un adhérent
          </Link>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            style={{ maxWidth: '400px' }}
            placeholder="Rechercher un adhérent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card" style={{ height: '180px', opacity: 0.5 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--bg-overlay) 25%, var(--bg-elevated) 50%, var(--bg-overlay) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Filter size={48} /></div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px' }}>Aucun adhérent trouvé</h3>
            <p style={{ fontSize: '14px' }}>Invitez votre premier adhérent pour commencer.</p>
            <Link href="/adherents/inviter" className="btn btn-primary">
              <Plus size={16} />
              Inviter un adhérent
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((adherent) => (
            <AdherentCard key={adherent.id} adherent={adherent} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdherentCard({ adherent }: { adherent: AdherentWithProfile }) {
  const initials = adherent.email.slice(0, 2).toUpperCase()
  const poids = adherent.profiles_adherents?.poids
  const taille = adherent.profiles_adherents?.taille

  const colors = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4']
  const color = colors[adherent.email.charCodeAt(0) % colors.length]

  return (
    <Link href={`/adherents/${adherent.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-medium)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }}
      >
        {/* Header bande couleur */}
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${color}, transparent)` }} />

        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div className="avatar-fallback" style={{
              width: '48px', height: '48px', fontSize: '18px',
              background: `${color}20`, borderColor: `${color}30`, color
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {adherent.email.split('@')[0]}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adherent.email}
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Infos physiques */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Poids', value: poids ? `${poids} kg` : '—' },
              { label: 'Taille', value: taille ? `${taille} cm` : '—' },
              { label: 'Membre depuis', value: new Date(adherent.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) },
            ].map((info) => (
              <div key={info.label} style={{
                padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{info.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{info.value}</div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <Link href={`/adherents/${adherent.id}/analytics`}
              onClick={e => e.stopPropagation()}
              className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <TrendingUp size={13} />
              Stats
            </Link>
            <Link href={`/messages?to=${adherent.id}`}
              onClick={e => e.stopPropagation()}
              className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <MessageSquare size={13} />
              Message
            </Link>
            <Link href={`/programmes/nouveau?adherent=${adherent.id}`}
              onClick={e => e.stopPropagation()}
              className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <Activity size={13} />
              Programme
            </Link>
          </div>
        </div>
      </div>
    </Link>
  )
}
