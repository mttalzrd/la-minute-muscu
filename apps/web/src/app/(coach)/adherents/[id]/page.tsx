// 🎨 PAGE : Profil complet d'un adhérent
// Affiche : photo, données physiques, programme actif, historique, messages

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function AdherentProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: adherent } = await supabase
    .from('users')
    .select(`
      *,
      profiles_adherents(*),
      programs(id, nom, is_active)
    `)
    .eq('id', params.id)
    .single()

  if (!adherent) notFound()

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{adherent.email.split('@')[0]}</h1>
        <p className="page-subtitle">Profil adhérent</p>
      </div>

      {/* TODO 🎨 : Injecter les composants designer ici */}
      <div className="card" style={{ padding: '32px' }}>
        <pre style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          {JSON.stringify({ adherent }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
