import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Animated, Alert, Vibration,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../src/lib/supabase'
import { saveWorkoutLogOffline } from '../../src/lib/offline/db'
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../../src/constants/design'

type SerieLog = {
  charge: string
  reps: string
  done: boolean
}

type ExerciseState = {
  id: string
  exercise_nom: string
  exercise_groupe: string
  exercise_tips: string
  exercise_video_url: string | null
  series_count: number
  repetitions: string
  rpe: number
  tempo: string
  repos_secondes: number
  logs: SerieLog[]
}

export default function WorkoutScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const [session, setSession] = useState<any>(null)
  const [exercises, setExercises] = useState<ExerciseState[]>([])
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressAnim = useRef(new Animated.Value(0)).current

  const fetchSession = useCallback(async () => {
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
      const exStates: ExerciseState[] = ((data.session_exercises ?? []) as any[]).map(se => ({
        id: se.id,
        exercise_nom: (se.exercise_library as any)?.nom ?? 'Exercice',
        exercise_groupe: (se.exercise_library as any)?.groupe_musculaire ?? '',
        exercise_tips: (se.exercise_library as any)?.tips_coach ?? '',
        exercise_video_url: (se.exercise_library as any)?.video_url ?? null,
        series_count: se.series ?? 3,
        repetitions: se.repetitions ?? '10',
        rpe: se.rpe ?? 7,
        tempo: se.tempo ?? '2-0-2-0',
        repos_secondes: se.repos_secondes ?? 90,
        logs: Array.from({ length: se.series ?? 3 }, () => ({ charge: '', reps: '', done: false })),
      }))
      setExercises(exStates)
    }
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    fetchSession()
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current) }
  }, [fetchSession])

  const startRest = (seconds: number) => {
    setRestSeconds(seconds)
    setRestActive(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const totalSeconds = seconds
    progressAnim.setValue(0)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start()

    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    restIntervalRef.current = setInterval(() => {
      setRestSeconds(s => {
        if (s <= 1) {
          clearInterval(restIntervalRef.current!)
          setRestActive(false)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          Vibration.vibrate([0, 300, 200, 300])
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const logSerie = async (exIdx: number, serieIdx: number) => {
    const ex = exercises[exIdx]
    const serie = ex.logs[serieIdx]
    if (!serie.charge || !serie.reps) {
      Alert.alert('Données manquantes', 'Entrez la charge et les répétitions avant de valider.')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Marquer la série comme faite
    setExercises(prev => {
      const updated = [...prev]
      updated[exIdx] = {
        ...updated[exIdx],
        logs: updated[exIdx].logs.map((l, i) =>
          i === serieIdx ? { ...l, done: true } : l
        ),
      }
      return updated
    })

    // Sauvegarder le log (offline first)
    const log = {
      id: `log-${ex.id}-${serieIdx}-${Date.now()}`,
      user_id: userId ?? '',
      session_exercise_id: ex.id,
      date: new Date().toISOString().split('T')[0],
      charge: +serie.charge,
      repetitions_realisees: +serie.reps,
      serie_numero: serieIdx + 1,
    }
    await saveWorkoutLogOffline(log)

    // Démarrer le chronomètre de repos
    startRest(ex.repos_secondes)
  }

  const currentEx = exercises[currentExIdx]
  const allDone = exercises.every(ex => ex.logs.every(l => l.done))

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>Chargement de la séance...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.sessionName}>{session?.nom}</Text>
          <Text style={styles.sessionProgress}>
            {currentExIdx + 1} / {exercises.length} exercices
          </Text>
        </View>
        {allDone && (
          <TouchableOpacity style={styles.finishBtn} onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            router.back()
          }}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.finishBtnGrad}>
              <Text style={styles.finishBtnText}>Terminer</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, {
          width: `${((currentExIdx) / exercises.length) * 100}%`,
        }]} />
      </View>

      {/* Rest timer overlay */}
      {restActive && (
        <View style={styles.restOverlay}>
          <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']} style={styles.restContent}>
            <Feather name="clock" size={32} color={COLORS.goldPrimary} />
            <Text style={styles.restTitle}>Récupération</Text>
            <Text style={styles.restSeconds}>{restSeconds}s</Text>
            <TouchableOpacity onPress={() => {
              if (restIntervalRef.current) clearInterval(restIntervalRef.current)
              setRestActive(false)
            }} style={styles.skipRestBtn}>
              <Text style={styles.skipRestText}>Passer →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Exercise list tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exTabs} contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm }}>
          {exercises.map((ex, i) => {
            const done = ex.logs.every(l => l.done)
            return (
              <TouchableOpacity key={ex.id} onPress={() => setCurrentExIdx(i)}
                style={[styles.exTab, i === currentExIdx && styles.exTabActive, done && styles.exTabDone]}>
                {done && <Feather name="check" size={12} color={COLORS.green} style={{ marginRight: 4 }} />}
                <Text style={[styles.exTabText, i === currentExIdx && styles.exTabTextActive]}>
                  {ex.exercise_nom.length > 14 ? ex.exercise_nom.slice(0, 14) + '…' : ex.exercise_nom}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {currentEx && (
          <View style={styles.content}>
            {/* Video */}
            {currentEx.exercise_video_url ? (
              <Video
                source={{ uri: currentEx.exercise_video_url }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Feather name="play-circle" size={40} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>Aucune vidéo disponible</Text>
              </View>
            )}

            {/* Exercise info */}
            <View style={styles.exInfo}>
              <View>
                <Text style={styles.exName}>{currentEx.exercise_nom}</Text>
                <Text style={styles.exGroupe}>{currentEx.exercise_groupe}</Text>
              </View>
              <View style={styles.exParams}>
                {[
                  { label: 'RPE', value: `${currentEx.rpe}/10` },
                  { label: 'Tempo', value: currentEx.tempo },
                  { label: 'Repos', value: `${currentEx.repos_secondes}s` },
                ].map(p => (
                  <View key={p.label} style={styles.exParam}>
                    <Text style={styles.exParamLabel}>{p.label}</Text>
                    <Text style={styles.exParamValue}>{p.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips du coach */}
            {currentEx.exercise_tips ? (
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Feather name="zap" size={14} color={COLORS.goldPrimary} />
                  <Text style={styles.tipsLabel}>TIP DU COACH</Text>
                </View>
                <Text style={styles.tipsText}>{currentEx.exercise_tips}</Text>
              </View>
            ) : null}

            {/* Series */}
            <View style={styles.seriesSection}>
              <Text style={styles.seriesTitle}>
                Séries — Cible : {currentEx.repetitions} reps
              </Text>
              <View style={styles.seriesHeader}>
                <Text style={[styles.seriesColLabel, { flex: 0.4 }]}>#</Text>
                <Text style={[styles.seriesColLabel, { flex: 1 }]}>Charge (kg)</Text>
                <Text style={[styles.seriesColLabel, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.seriesColLabel, { flex: 0.5 }]}>✓</Text>
              </View>
              {currentEx.logs.map((log, serieIdx) => (
                <View key={serieIdx} style={[styles.serieRow, log.done && styles.serieRowDone]}>
                  <Text style={[styles.serieNum, { flex: 0.4 }]}>{serieIdx + 1}</Text>
                  <TextInput
                    style={[styles.serieInput, { flex: 1 }, log.done && styles.serieInputDone]}
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="decimal-pad"
                    value={log.charge}
                    editable={!log.done}
                    onChangeText={(v) => setExercises(prev => {
                      const u = [...prev]
                      u[currentExIdx].logs[serieIdx] = { ...u[currentExIdx].logs[serieIdx], charge: v }
                      return u
                    })}
                  />
                  <TextInput
                    style={[styles.serieInput, { flex: 1 }, log.done && styles.serieInputDone]}
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    value={log.reps}
                    editable={!log.done}
                    onChangeText={(v) => setExercises(prev => {
                      const u = [...prev]
                      u[currentExIdx].logs[serieIdx] = { ...u[currentExIdx].logs[serieIdx], reps: v }
                      return u
                    })}
                  />
                  <TouchableOpacity
                    style={[styles.checkBtn, { flex: 0.5 }, log.done && styles.checkBtnDone]}
                    onPress={() => !log.done && logSerie(currentExIdx, serieIdx)}
                    disabled={log.done}
                  >
                    <Feather name={log.done ? 'check-circle' : 'circle'} size={22} color={log.done ? COLORS.green : COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Next exercise */}
            {currentExIdx < exercises.length - 1 && (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setCurrentExIdx(i => i + 1)}
              >
                <Text style={styles.nextBtnText}>Exercice suivant</Text>
                <Feather name="arrow-right" size={18} color={COLORS.goldPrimary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  scroll: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: 60 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.xl, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  sessionName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  sessionProgress: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  finishBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  finishBtnGrad: { paddingVertical: 8, paddingHorizontal: 16 },
  finishBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },

  progressBar: { height: 3, backgroundColor: COLORS.bgOverlay },
  progressFill: { height: '100%', backgroundColor: COLORS.goldPrimary, borderRadius: 2 },

  restOverlay: {
    position: 'absolute', inset: 0, zIndex: 100,
    alignItems: 'center', justifyContent: 'center',
  },
  restContent: {
    padding: SPACING.xxxl, borderRadius: RADIUS.xl,
    alignItems: 'center', gap: SPACING.md,
    minWidth: 220,
    borderWidth: 1, borderColor: COLORS.borderGold,
  },
  restTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  restSeconds: { fontSize: 64, fontWeight: '700', color: COLORS.goldPrimary, letterSpacing: -2 },
  skipRestBtn: { padding: SPACING.md },
  skipRestText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },

  exTabs: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  exTab: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgElevated,
  },
  exTabActive: { borderColor: COLORS.borderGold, backgroundColor: 'rgba(245,158,11,0.08)' },
  exTabDone: { borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.06)' },
  exTabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  exTabTextActive: { color: COLORS.goldPrimary },

  video: { width: '100%', aspectRatio: 16 / 9, borderRadius: RADIUS.xl, marginBottom: SPACING.lg, backgroundColor: COLORS.bgSurface },
  videoPlaceholder: {
    aspectRatio: 16 / 9, borderRadius: RADIUS.xl, marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgSurface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },

  exInfo: { marginBottom: SPACING.lg, gap: SPACING.md },
  exName: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.4 },
  exGroupe: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  exParams: { flexDirection: 'row', gap: SPACING.sm },
  exParam: {
    flex: 1, backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  exParamLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  exParamValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },

  tipsCard: {
    backgroundColor: 'rgba(245,158,11,0.05)', borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)',
    borderLeftWidth: 3, borderLeftColor: COLORS.goldPrimary,
    padding: SPACING.lg, marginBottom: SPACING.lg,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
  tipsLabel: { fontSize: 10, fontWeight: '700', color: COLORS.goldPrimary, textTransform: 'uppercase', letterSpacing: 0.8 },
  tipsText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  seriesSection: { marginBottom: SPACING.xl },
  seriesTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  seriesHeader: { flexDirection: 'row', paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle, marginBottom: SPACING.sm },
  seriesColLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  serieRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md, marginBottom: SPACING.xs,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  serieRowDone: { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' },
  serieNum: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },
  serieInput: {
    backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.sm,
    padding: SPACING.sm, fontSize: 16, fontWeight: '700',
    color: COLORS.textPrimary, textAlign: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  serieInputDone: { color: COLORS.textMuted, backgroundColor: COLORS.bgBase },
  checkBtn: { alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: {},

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderGold, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.goldPrimary },
})
