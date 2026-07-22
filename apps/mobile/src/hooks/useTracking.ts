// Hook : useTracking
// Gère le tracking quotidien (poids, pas, calories, séance done)
// Offline-first : sauvegarde SQLite + synchro Supabase

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { saveTrackingOffline } from '../lib/offline/db'

const today = new Date().toISOString().split('T')[0]

export function useTracking() {
  const [userId, setUserId] = useState<string | null>(null)
  const [calories, setCalories] = useState('')
  const [steps, setSteps] = useState('')
  const [weight, setWeight] = useState('')
  const [isWorkoutDone, setIsWorkoutDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('tracking_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        if (data.calories_consommees) setCalories(String(data.calories_consommees))
        if (data.pas_quotidiens)     setSteps(String(data.pas_quotidiens))
        if (data.poids_du_jour)      setWeight(String(data.poids_du_jour))
        setIsWorkoutDone(data.is_workout_done ?? false)
      }
      setLoading(false)
    }
    init()
  }, [])

  const save = useCallback(async (patch: {
    calories_consommees?: number
    pas_quotidiens?: number
    poids_du_jour?: number
    is_workout_done?: boolean
  }) => {
    if (!userId) return
    const id = `track-${userId}-${today}`
    const data = { id, user_id: userId, date: today, ...patch }
    await saveTrackingOffline(data)
    await supabase.from('tracking_activity').upsert(data)
  }, [userId])

  const saveCalories  = useCallback(() => save({ calories_consommees: +calories }), [calories, save])
  const saveSteps     = useCallback(() => save({ pas_quotidiens: +steps }),         [steps, save])
  const saveWeight    = useCallback(() => save({ poids_du_jour: +weight }),          [weight, save])
  const toggleWorkout = useCallback(() => {
    const next = !isWorkoutDone
    setIsWorkoutDone(next)
    save({ is_workout_done: next })
  }, [isWorkoutDone, save])

  return {
    calories, setCalories, saveCalories,
    steps,    setSteps,    saveSteps,
    weight,   setWeight,   saveWeight,
    isWorkoutDone, toggleWorkout,
    loading,
  }
}
