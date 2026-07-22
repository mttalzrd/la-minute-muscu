'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp, Search, Send, X } from 'lucide-react'
import type { ExerciseRow, UserRow } from '@lmm/supabase'

type SessionExercise = {
  id: string
  exercise: ExerciseRow
  series: number
  repetitions: string
  rpe: number
  tempo: string
  repos_secondes: number
}

type Session = {
  id: string
  nom: string
  jour_semaine: number
  exercices: SessionExercise[]
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function ProgrammesPage() {
  const [adherents, setAdherents] = useState<UserRow[]>([])
  const [exercices, setExercices] = useState<ExerciseRow[]>([])
  const [selectedAdherent, setSelectedAdherent] = useState<string>('')
  const [programName, setProgramName] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [adherentsRes, exercicesRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'adherent'),
      supabase.from('exercise_library').select('*').order('nom'),
    ])
    setAdherents(adherentsRes.data ?? [])
    setExercices(exercicesRes.data ?? [])
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const addSession = () => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      nom: `Séance ${sessions.length + 1}`,
      jour_semaine: (sessions.length % 7) + 1,
      exercices: [],
    }
    setSessions(s => [...s, newSession])
  }

  const removeSession = (sessionId: string) => {
    setSessions(s => s.filter(sess => sess.id !== sessionId))
  }

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, ...updates } : sess))
  }

  const addExerciseToSession = (sessionId: string, exercise: ExerciseRow) => {
    const newEx: SessionExercise = {
      id: `ex-${Date.now()}`,
      exercise,
      series: 3,
      repetitions: '8-12',
      rpe: 7,
      tempo: '2-0-2-0',
      repos_secondes: 90,
    }
    setSessions(s => s.map(sess =>
      sess.id === sessionId
        ? { ...sess, exercices: [...sess.exercices, newEx] }
        : sess
    ))
  }

  const removeExerciseFromSession = (sessionId: string, exId: string) => {
    setSessions(s => s.map(sess =>
      sess.id === sessionId
        ? { ...sess, exercices: sess.exercices.filter(e => e.id !== exId) }
        : sess
    ))
  }

  const updateExercise = (sessionId: string, exId: string, updates: Partial<SessionExercise>) => {
    setSessions(s => s.map(sess =>
      sess.id === sessionId
        ? { ...sess, exercices: sess.exercices.map(e => e.id === exId ? { ...e, ...updates } : e) }
        : sess
    ))
  }

  const handleSendProgram = async () => {
    if (!selectedAdherent || !programName) return
    setSaving(true)

    // 1. Créer le programme
    const { data: program } = await supabase
      .from('programs')
      .insert([{ nom: programName, adherent_id: selectedAdherent, is_active: true }])
      .select()
      .single()

    if (!program) { setSaving(false); return }

    // 2. Créer les sessions
    for (const [i, sess] of sessions.entries()) {
      const { data: session } = await supabase
        .from('sessions')
        .insert([{ program_id: program.id, nom: sess.nom, jour_semaine: sess.jour_semaine, ordre: i + 1 }])
        .select()
        .single()

      if (!session) continue

      // 3. Créer les exercices de la session
      await supabase.from('session_exercises').insert(
        sess.exercices.map((ex, j) => ({
          session_id: session.id,
          exercise_id: ex.exercise.id,
          series: ex.series,
          repetitions: ex.repetitions,
          rpe: ex.rpe,
          tempo: ex.tempo,
          repos_secondes: ex.repos_secondes,
          ordre: j + 1,
        }))
      )
    }

    setSaving(false)
    setSuccess(true)
    setSessions([])
    setProgramName('')
    setSelectedAdherent('')
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Créer un Programme</h1>
          <p className="page-subtitle">Composez des semaines d'entraînement et envoyez-les à vos adhérents</p>
        </div>
        {success && (
          <div style={{ padding: '10px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: 'var(--accent-green)', fontWeight: 600, fontSize: '14px' }}>
            ✓ Programme envoyé avec succès !
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Builder principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Config */}
          <div className="card-gold">
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nom du programme</label>
                <input className="form-input" placeholder="Ex: Force 12 semaines" value={programName} onChange={e => setProgramName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Adhérent destinataire</label>
                <select className="form-input form-select" value={selectedAdherent} onChange={e => setSelectedAdherent(e.target.value)}>
                  <option value="">Sélectionner un adhérent...</option>
                  {adherents.map(a => <option key={a.id} value={a.id}>{a.email}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Sessions */}
          {sessions.map((session, sIdx) => (
            <SessionBlock
              key={session.id}
              session={session}
              exercices={exercices}
              onUpdate={updates => updateSession(session.id, updates)}
              onRemove={() => removeSession(session.id)}
              onAddExercise={ex => addExerciseToSession(session.id, ex)}
              onRemoveExercise={exId => removeExerciseFromSession(session.id, exId)}
              onUpdateExercise={(exId, updates) => updateExercise(session.id, exId, updates)}
            />
          ))}

          <button className="btn btn-secondary" onClick={addSession} style={{ alignSelf: 'flex-start' }}>
            <Plus size={16} />
            Ajouter une séance
          </button>
        </div>

        {/* Sidebar d'envoi */}
        <div style={{ position: 'sticky', top: '32px' }}>
          <div className="card-gold">
            <div className="card-header">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px' }}>Résumé</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Adhérent', value: adherents.find(a => a.id === selectedAdherent)?.email?.split('@')[0] ?? '—' },
                  { label: 'Programme', value: programName || '—' },
                  { label: 'Séances', value: `${sessions.length}` },
                  { label: 'Exercices total', value: `${sessions.reduce((acc, s) => acc + s.exercices.length, 0)}` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!selectedAdherent || !programName || sessions.length === 0 || saving}
                onClick={handleSendProgram}
              >
                <Send size={16} />
                {saving ? 'Envoi en cours...' : 'Envoyer le programme'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionBlock({ session, exercices, onUpdate, onRemove, onAddExercise, onRemoveExercise, onUpdateExercise }: {
  session: Session
  exercices: ExerciseRow[]
  onUpdate: (u: Partial<Session>) => void
  onRemove: () => void
  onAddExercise: (ex: ExerciseRow) => void
  onRemoveExercise: (id: string) => void
  onUpdateExercise: (id: string, updates: Partial<SessionExercise>) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showExPicker, setShowExPicker] = useState(false)
  const [exSearch, setExSearch] = useState('')
  const sensors = useSensors(useSensor(PointerSensor))

  const filteredEx = exercices.filter(e => e.nom.toLowerCase().includes(exSearch.toLowerCase()))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = session.exercices.findIndex(e => e.id === active.id)
    const newIdx = session.exercices.findIndex(e => e.id === over.id)
    onUpdate({ exercices: arrayMove(session.exercices, oldIdx, newIdx) })
  }

  return (
    <div className="card">
      {/* Session header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: collapsed ? 'none' : '1px solid var(--border-subtle)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input className="form-input" style={{ width: '200px' }} value={session.nom} onChange={e => onUpdate({ nom: e.target.value })} />
          <select className="form-input form-select" style={{ width: '160px' }} value={session.jour_semaine} onChange={e => onUpdate({ jour_semaine: +e.target.value })}>
            {JOURS.map((j, i) => <option key={i} value={i + 1}>{j}</option>)}
          </select>
          <span className="badge badge-gray">{session.exercices.length} exercice{session.exercices.length > 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button className="btn btn-danger btn-icon" onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Exercices DnD list */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={session.exercices.map(e => e.id)} strategy={verticalListSortingStrategy}>
              {session.exercices.map((ex) => (
                <SortableExerciseItem
                  key={ex.id}
                  item={ex}
                  onRemove={() => onRemoveExercise(ex.id)}
                  onUpdate={(updates) => onUpdateExercise(ex.id, updates)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Picker exercice */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowExPicker(p => !p)}>
              <Plus size={14} />
              Ajouter un exercice
            </button>
            {showExPicker && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
                borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                zIndex: 50, width: '360px',
              }}>
                <div style={{ padding: '12px' }}>
                  <div className="search-wrapper">
                    <Search size={14} className="search-icon" />
                    <input className="form-input search-input" style={{ fontSize: '13px' }} placeholder="Rechercher..." value={exSearch} onChange={e => setExSearch(e.target.value)} />
                  </div>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '0 8px 8px' }}>
                  {filteredEx.map(ex => (
                    <button key={ex.id} onClick={() => { onAddExercise(ex); setShowExPicker(false); setExSearch('') }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: '14px' }}>{ex.nom}</span>
                      <span className="badge badge-gray" style={{ fontSize: '11px' }}>{ex.groupe_musculaire}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SortableExerciseItem({ item, onRemove, onUpdate }: {
  item: SessionExercise
  onRemove: () => void
  onUpdate: (u: Partial<SessionExercise>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="dnd-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)', flexShrink: 0 }}>
          <GripVertical size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>{item.exercise.nom}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {[
              { label: 'Séries', key: 'series', type: 'number', min: 1, max: 20 },
              { label: 'Reps', key: 'repetitions', type: 'text' },
              { label: 'RPE', key: 'rpe', type: 'number', min: 1, max: 10, step: 0.5 },
              { label: 'Tempo', key: 'tempo', type: 'text' },
              { label: 'Repos (s)', key: 'repos_secondes', type: 'number', min: 0 },
            ].map(field => (
              <div key={field.key}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</div>
                <input
                  type={field.type}
                  className="form-input"
                  style={{ fontSize: '13px', padding: '5px 8px', textAlign: 'center' }}
                  value={(item as any)[field.key]}
                  min={'min' in field ? field.min : undefined}
                  max={'max' in field ? field.max : undefined}
                  step={'step' in field ? field.step : undefined}
                  onChange={e => onUpdate({ [field.key]: field.type === 'number' ? +e.target.value : e.target.value } as any)}
                />
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-danger btn-icon" style={{ flexShrink: 0 }} onClick={onRemove}><X size={14} /></button>
      </div>
    </div>
  )
}
