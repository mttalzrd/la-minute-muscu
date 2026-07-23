/**
 * useProfile — Hook Supabase
 * Charge et met à jour le profil utilisateur + données biomécaniques
 * Source : users + profiles_adherents (poids, taille, mensurations JSONB)
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types exportés (utilisés par ProfileSettings.tsx) ───────
export type SubscriptionStatus = 'premium' | 'basic' | 'trial' | 'inactive'

export interface UserProfile {
  id:                 string
  email:              string
  prenom:             string | null
  avatarUrl:          string | null
  subscriptionStatus: SubscriptionStatus
  memberSince:        string
}

export interface BiomechanicsData {
  poids:       number | null   // kg — colonne directe
  taille:      number | null   // cm — colonne directe
  envergure:   number | null   // cm — mensurations JSONB
  femur:       number | null   // cm — mensurations JSONB
  tibia:       number | null   // cm — mensurations JSONB
  tour_taille: number | null   // cm — mensurations JSONB
  tour_bras:   number | null   // cm — mensurations JSONB
}

// ─── Hook ────────────────────────────────────────────────────
export function useProfile() {
  const [profile,      setProfile]      = useState<UserProfile | null>(null)
  const [biomechanics, setBiomechanics] = useState<BiomechanicsData | null>(null)
  const [isLoading,    setIsLoading]    = useState(true)
  const [isSaving,     setIsSaving]     = useState(false)

  // ── Chargement initial ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // users (rôle, email, date d'inscription)
      const { data: pub } = await supabase
        .from('users')
        .select('id, email, created_at, role')
        .eq('id', user.id)
        .single()

      // profiles_adherents (poids, taille, mensurations JSONB, avatar)
      const { data: phys } = await supabase
        .from('profiles_adherents')
        .select('poids, taille, mensurations, avatar_url')
        .eq('user_id', user.id)
        .single()

      const mens = (phys?.mensurations ?? {}) as Record<string, number | null>

      setProfile({
        id:                 user.id,
        email:              user.email ?? '',
        prenom:             (mens.prenom as string | null) ?? null,
        avatarUrl:          phys?.avatar_url ?? null,
        subscriptionStatus: 'premium',   // TODO : table subscriptions en V2
        memberSince:        pub?.created_at ?? new Date().toISOString(),
      })

      setBiomechanics({
        poids:       phys?.poids        ?? null,
        taille:      phys?.taille       ?? null,
        envergure:   mens.envergure     ?? null,
        femur:       mens.femur         ?? null,
        tibia:       mens.tibia         ?? null,
        tour_taille: mens.tour_taille   ?? null,
        tour_bras:   mens.tour_bras     ?? null,
      })

      setIsLoading(false)
    }
    load()
  }, [])

  // ── Mise à jour métriques (upsert profiles_adherents) ────
  const updateMetrics = useCallback(async (patch: Partial<BiomechanicsData>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setIsSaving(true)

    // Colonnes directes vs champs JSONB
    const { poids, taille, ...jsonbFields } = patch

    // Récupérer le JSONB existant pour merge propre
    const { data: current } = await supabase
      .from('profiles_adherents')
      .select('mensurations')
      .eq('user_id', user.id)
      .single()

    const mensActuelles = (current?.mensurations ?? {}) as Record<string, unknown>

    await supabase
      .from('profiles_adherents')
      .upsert({
        user_id:      user.id,
        ...(poids  !== undefined && poids  !== null && { poids }),
        ...(taille !== undefined && taille !== null && { taille }),
        mensurations: { ...mensActuelles, ...jsonbFields },
        updated_at:   new Date().toISOString(),
      })

    // Mise à jour état local immédiate (optimistic update)
    setBiomechanics(prev => prev ? { ...prev, ...patch } : null)
    setIsSaving(false)
  }, [])

  // ── Déconnexion ──────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    profile,
    biomechanics,
    isLoading,
    isSaving,
    updateMetrics,
    signOut,
  }
}
