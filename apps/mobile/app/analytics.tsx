/**
 * AnalyticsScreen — Onglet Progrès
 * Logique Supabase conservée + étendue avec heatmap 35 jours.
 * Rendu délégué au composant designer AnalyticsChart.
 */
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native'
import { AnalyticsChart, type DataPoint, type HeatmapDay } from '../src/components/analytics/AnalyticsChart'
import { supabase } from '../src/lib/supabase'
import { COLORS, SPACING, RADIUS } from '../src/constants/design'

// ─── Types locaux ─────────────────────────────────────────────
type Period = '7j' | '30j' | '90j'

type ExerciseSummary = {
  id:   string
  nom:  string
  data: DataPoint[]
  currentRM: number
}

// ─── Écran ────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const [userId,         setUserId]         = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30j')
  const [exercises,      setExercises]      = useState<ExerciseSummary[]>([])
  const [selectedExIdx,  setSelectedExIdx]  = useState(0)
  const [heatmapDays,    setHeatmapDays]    = useState<HeatmapDay[]>([])
  const [loading,        setLoading]        = useState(true)

  // ── Chargement Supabase ──────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await loadAll(user.id)
      setLoading(false)
    }
    init()
  }, [selectedPeriod])

  const loadAll = async (uid: string) => {
    const daysMap: Record<Period, number> = { '7j': 7, '30j': 30, '90j': 90 }
    const days    = daysMap[selectedPeriod]
    const since   = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().split('T')[0]

    await Promise.all([
      loadExerciseLogs(uid, sinceStr),
      loadHeatmap(uid),         // heatmap toujours sur 35 jours
    ])
  }

  // ── 1RM par exercice (formule Epley: charge × (1 + reps/30)) ─
  const loadExerciseLogs = async (uid: string, sinceStr: string) => {
    const { data: logs } = await supabase
      .from('workout_logs')
      .select(`
        date, charge, repetitions_realisees,
        session_exercises(
          exercise_library(id, nom)
        )
      `)
      .eq('user_id', uid)
      .gte('date', sinceStr)
      .order('date', { ascending: true })

    if (!logs) return

    const byExercise: Record<string, ExerciseSummary> = {}

    for (const log of logs) {
      const ex = (log.session_exercises as any)?.exercise_library
      if (!ex || !log.charge || !log.repetitions_realisees) continue

      if (!byExercise[ex.id]) {
        byExercise[ex.id] = { id: ex.id, nom: ex.nom, data: [], currentRM: 0 }
      }

      const orm = log.charge * (1 + log.repetitions_realisees / 30)
      byExercise[ex.id].data.push({ date: log.date, value: +orm.toFixed(1) })
    }

    // Calculer le 1RM actuel (dernier point)
    const summaries = Object.values(byExercise).map(ex => ({
      ...ex,
      currentRM: ex.data.length > 0 ? ex.data[ex.data.length - 1].value : 0,
    }))

    setExercises(summaries)
    setSelectedExIdx(0)
  }

  // ── Heatmap — 35 derniers jours de tracking_activity ─────
  const loadHeatmap = async (uid: string) => {
    const since35 = new Date()
    since35.setDate(since35.getDate() - 35)
    const since35Str = since35.toISOString().split('T')[0]

    const { data: trackDays } = await supabase
      .from('tracking_activity')
      .select('date, is_workout_done, pas_quotidiens')
      .eq('user_id', uid)
      .gte('date', since35Str)
      .order('date', { ascending: true })

    // Construire 35 jours (du plus ancien au plus récent)
    const heatmap: HeatmapDay[] = []
    const today = new Date()

    for (let i = 34; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]

      const record = trackDays?.find(t => t.date === dateStr)
      const done   = record?.is_workout_done ?? false
      const hasSteps = (record?.pas_quotidiens ?? 0) > 2000

      let intensity: 0 | 0.4 | 1 = 0
      if (done) intensity = 1
      else if (hasSteps) intensity = 0.4   // actif mais pas de séance formelle

      heatmap.push({ date: dateStr, done, intensity })
    }

    setHeatmapDays(heatmap)
  }

  const selectedEx = exercises[selectedExIdx] ?? null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header + sélecteur période ───────────────── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Mes Progrès</Text>
          <View style={styles.periodSelector}>
            {(['7j', '30j', '90j'] as Period[]).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPeriod(p)}
                style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}
              >
                <Text style={[styles.periodTabText, selectedPeriod === p && styles.periodTabTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Sélecteur exercice (tabs horizontaux) ─────── */}
        {exercises.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exTabs}>
            <View style={styles.exTabRow}>
              {exercises.map((ex, i) => (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => setSelectedExIdx(i)}
                  style={[styles.exTab, selectedExIdx === i && styles.exTabActive]}
                >
                  <Text style={[styles.exTabText, selectedExIdx === i && styles.exTabTextActive]}
                    numberOfLines={1}
                  >
                    {ex.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ── AnalyticsChart — Composant designer ─────── */}
        {/* screen 27b2554574f249c98fb666871aaa0e93         */}
        <AnalyticsChart
          rmData={selectedEx?.data ?? []}
          currentRM={selectedEx?.currentRM ?? 0}
          heatmapDays={heatmapDays}
          exerciseName={selectedEx?.nom ?? ''}
        />

        {/* ── État vide si aucun log ────────────────────── */}
        {!loading && exercises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>Aucun log pour cette période</Text>
            <Text style={styles.emptyText}>
              Enregistre tes séances dans l'onglet Workout pour voir apparaître ta courbe 1RM ici.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bgBase },
  scroll:    { flex: 1 },
  container: { padding: SPACING.xl, paddingBottom: 40, gap: SPACING.xl },

  // Header
  pageHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: SPACING.sm,
  },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },

  // Sélecteur période
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md, padding: 3, gap: 2,
  },
  periodTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.sm - 2 },
  periodTabActive: { backgroundColor: COLORS.bgOverlay },
  periodTabText:       { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  periodTabTextActive: { color: COLORS.textPrimary },

  // Tabs exercices
  exTabs:   { flexGrow: 0, marginBottom: SPACING.sm },
  exTabRow: { flexDirection: 'row', gap: SPACING.sm },
  exTab: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full, borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgOverlay,
    maxWidth: 180,
  },
  exTabActive:     { borderColor: '#CCFF00', backgroundColor: 'rgba(204,255,0,0.08)' },
  exTabText:       { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  exTabTextActive: { color: '#CCFF00', fontWeight: '700' },

  // État vide
  emptyState: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.xxxl,
    alignItems: 'center', gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  emptyIcon:  { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptyText:  { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
})
