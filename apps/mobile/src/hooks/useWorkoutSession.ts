// Hook : useWorkoutSession
// Gère l'état complet d'une séance d'entraînement
// Fetch depuis Supabase + state local + save offline

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { saveWorkoutLogOffline } from '../lib/offline/db'
import { Alert } from 'react-native'
import * as Haptics from 'expo-haptics'

export interface SerieLog {
  charge: string
  reps: string
  done: boolean
}

export interface ExerciseState {
  id: string
  name: string
  muscleGroup: string
  coachTip: string
  videoUrl: string | null
  seriesCount: number
  targetReps: string
  rpe: number
  tempo: string
  restSeconds: number
  logs: SerieLog[]
}

export function useWorkoutSession(sessionId: string) {
  const [session, setSession] = useState<any>(null)
  const [exercises, setExercises] = useState<ExerciseState[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [restTotal, setRestTotal] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const restIntervalRef = { current: null as ReturnType<typeof setInterval> | null }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data } = await supabase
        .from('sessions')
        .select(`
          id, nom,
          session_exercises(
            id, series, repetitions, rpe, tempo, repos_secondes,
            exercise_library(nom, groupe_musculaire, tips_coach, video_url)
          )
        `)
        .eq('id', sessionId)
        .single()

      if (data) {
        setSession(data)
        setExercises(
          ((data.session_exercises ?? []) as any[]).map(se => ({
            id: se.id,
            name: (se.exercise_library as any)?.nom ?? 'Exercice',
            muscleGroup: (se.exercise_library as any)?.groupe_musculaire ?? '',
            coachTip: (se.exercise_library as any)?.tips_coach ?? '',
            videoUrl: (se.exercise_library as any)?.video_url ?? null,
            seriesCount: se.series ?? 3,
            targetReps: se.repetitions ?? '10',
            rpe: se.rpe ?? 7,
            tempo: se.tempo ?? '2-0-2-0',
            restSeconds: se.repos_secondes ?? 90,
            logs: Array.from({ length: se.series ?? 3 }, () => ({ charge: '', reps: '', done: false })),
          }))
        )
      }
      setLoading(false)
    }
    init()
  }, [sessionId])

  const startRest = useCallback((seconds: number) => {
    setRestTotal(seconds)
    setRestSeconds(seconds)
    setRestActive(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    restIntervalRef.current = setInterval(() => {
      setRestSeconds(s => {
        if (s <= 1) {
          clearInterval(restIntervalRef.current!)
          setRestActive(false)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const skipRest = useCallback(() => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setRestActive(false)
    setRestSeconds(0)
  }, [])

  const validateSerie = useCallback(async (exIdx: number, serieIdx: number) => {
    const ex = exercises[exIdx]
    const serie = ex.logs[serieIdx]

    if (!serie.charge || !serie.reps) {
      Alert.alert('Données manquantes', 'Entrez la charge et les répétitions.')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Marquer done
    setExercises(prev => {
      const u = [...prev]
      u[exIdx] = { ...u[exIdx], logs: u[exIdx].logs.map((l, i) => i === serieIdx ? { ...l, done: true } : l) }
      return u
    })

    // Save offline
    await saveWorkoutLogOffline({
      id: `log-${ex.id}-${serieIdx}-${Date.now()}`,
      user_id: userId ?? '',
      session_exercise_id: ex.id,
      date: new Date().toISOString().split('T')[0],
      charge: +serie.charge,
      repetitions_realisees: +serie.reps,
      serie_numero: serieIdx + 1,
    })

    // Démarrer repos
    startRest(ex.restSeconds)
  }, [exercises, userId, startRest])

  const updateLog = useCallback((exIdx: number, serieIdx: number, field: 'charge' | 'reps', value: string) => {
    setExercises(prev => {
      const u = [...prev]
      u[exIdx] = {
        ...u[exIdx],
        logs: u[exIdx].logs.map((l, i) => i === serieIdx ? { ...l, [field]: value } : l)
      }
      return u
    })
  }, [])

  const allDone = exercises.every(ex => ex.logs.every(l => l.done))

  return {
    session, exercises, loading,
    currentIdx, setCurrentIdx,
    restSeconds, restTotal, restActive,
    startRest, skipRest,
    validateSerie, updateLog,
    allDone,
  }
}
