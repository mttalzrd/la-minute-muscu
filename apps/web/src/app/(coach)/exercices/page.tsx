'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Edit2, Trash2, Play, Filter, ChevronDown, Upload } from 'lucide-react'
import type { ExerciseRow } from '@lmm/supabase'

const GROUPES = ['Tous', 'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers', 'Cardio']

export default function ExercicesPage() {
  const [exercices, setExercices] = useState<ExerciseRow[]>([])
  const [search, setSearch] = useState('')
  const [groupe, setGroupe] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ExerciseRow | null>(null)

  const supabase = createClient()

  const fetchExercices = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('exercise_library').select('*').order('created_at', { ascending: false })
    if (groupe !== 'Tous') query = query.eq('groupe_musculaire', groupe)
    const { data } = await query
    setExercices(data ?? [])
    setLoading(false)
  }, [supabase, groupe])

  useEffect(() => { fetchExercices() }, [fetchExercices])

  const filtered = exercices.filter(e =>
    e.nom.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet exercice ?')) return
    await supabase.from('exercise_library').delete().eq('id', id)
    fetchExercices()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bibliothèque d'exercices</h1>
          <p className="page-subtitle">{exercices.length} exercices dans votre catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingExercise(null); setShowModal(true) }}>
          <Plus size={16} />
          Ajouter un exercice
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrapper" style={{ flex: 1, maxWidth: '360px' }}>
          <Search size={16} className="search-icon" />
          <input className="form-input search-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {GROUPES.map(g => (
            <button key={g} onClick={() => setGroupe(g)}
              className={`badge ${groupe === g ? 'badge-gold' : 'badge-gray'}`}
              style={{ cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: '13px' }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className="stat-card" style={{ height: '200px', opacity: 0.4 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon"><Search size={48} /></div>
          <h3>Aucun exercice trouvé</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Créer le premier</button>
        </div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onEdit={() => { setEditingExercise(ex); setShowModal(true) }}
              onDelete={() => handleDelete(ex.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ExerciseModal
          exercise={editingExercise}
          onClose={() => setShowModal(false)}
          onSave={fetchExercices}
        />
      )}
    </div>
  )
}

function ExerciseCard({ exercise, onEdit, onDelete }: { exercise: ExerciseRow; onEdit: () => void; onDelete: () => void }) {
  const groupColors: Record<string, string> = {
    'Pectoraux': '#6366F1', 'Dos': '#10B981', 'Épaules': '#F59E0B',
    'Biceps': '#8B5CF6', 'Triceps': '#06B6D4', 'Jambes': '#EF4444',
    'Abdominaux': '#EC4899', 'Fessiers': '#F97316', 'Cardio': '#14B8A6',
  }
  const color = groupColors[exercise.groupe_musculaire] ?? 'var(--text-muted)'

  return (
    <div className="card" style={{ overflow: 'visible' }}>
      {/* Video thumbnail */}
      <div style={{
        height: '140px', background: 'var(--bg-surface)',
        borderRadius: '14px 14px 0 0', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {exercise.video_url ? (
          <video src={exercise.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Play size={32} opacity={0.4} />
            <span style={{ fontSize: '12px' }}>Aucune vidéo</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span className="badge" style={{ background: `${color}25`, color, border: `1px solid ${color}40`, fontSize: '11px' }}>
            {exercise.groupe_musculaire}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', flex: 1 }}>
            {exercise.nom}
          </h3>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button className="btn btn-ghost btn-icon" onClick={onEdit}><Edit2 size={14} /></button>
            <button className="btn btn-danger btn-icon" onClick={onDelete}><Trash2 size={14} /></button>
          </div>
        </div>
        {exercise.description && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {exercise.description}
          </p>
        )}
        {exercise.tips_coach && (
          <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: '8px', borderLeft: '3px solid var(--gold-primary)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '2px' }}>💡 TIP COACH</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {exercise.tips_coach}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExerciseModal({ exercise, onClose, onSave }: { exercise: ExerciseRow | null; onClose: () => void; onSave: () => void }) {
  const supabase = createClient()
  const [form, setForm] = useState({
    nom: exercise?.nom ?? '',
    groupe_musculaire: exercise?.groupe_musculaire ?? '',
    description: exercise?.description ?? '',
    tips_coach: exercise?.tips_coach ?? '',
    video_url: exercise?.video_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleVideoUpload = async (file: File) => {
    const ext = file.name.split('.').pop()
    const path = `exercises/${Date.now()}.${ext}`
    setUploadProgress(10)
    const { data, error } = await supabase.storage.from('exercise-videos').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('exercise-videos').getPublicUrl(data.path)
      setForm(f => ({ ...f, video_url: urlData.publicUrl }))
    }
    setUploadProgress(100)
    setTimeout(() => setUploadProgress(0), 1000)
  }

  const handleSave = async () => {
    setSaving(true)
    if (exercise) {
      await supabase.from('exercise_library').update(form).eq('id', exercise.id)
    } else {
      await supabase.from('exercise_library').insert([form])
    }
    setSaving(false)
    onSave()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '20px' }}>
            {exercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nom de l'exercice *</label>
              <input className="form-input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Développé couché" />
            </div>
            <div className="form-group">
              <label className="form-label">Groupe musculaire *</label>
              <select className="form-input form-select" value={form.groupe_musculaire} onChange={e => setForm(f => ({ ...f, groupe_musculaire: e.target.value }))}>
                <option value="">Choisir...</option>
                {GROUPES.filter(g => g !== 'Tous').map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description de l'exécution..." />
          </div>

          <div className="form-group">
            <label className="form-label">💡 Tips Coach</label>
            <textarea className="form-input form-textarea" value={form.tips_coach} onChange={e => setForm(f => ({ ...f, tips_coach: e.target.value }))} placeholder="Vos conseils personnalisés pour cet exercice..." />
          </div>

          <div className="form-group">
            <label className="form-label">Vidéo d'exécution</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={15} />
                Uploader une vidéo
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleVideoUpload(e.target.files[0])} />
              </label>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ou</span>
              <input className="form-input" style={{ flex: 1 }} placeholder="URL de la vidéo" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
            </div>
            {uploadProgress > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.nom || !form.groupe_musculaire}>
            {saving ? 'Enregistrement...' : exercise ? 'Mettre à jour' : 'Créer l\'exercice'}
          </button>
        </div>
      </div>
    </div>
  )
}
