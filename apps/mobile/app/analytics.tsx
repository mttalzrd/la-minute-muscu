import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/design'

type DataPoint = { date: string; value: number }

function MiniLineChart({ data, color, height = 80 }: { data: DataPoint[]; color: string; height?: number }) {
  if (data.length < 2) return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>Données insuffisantes</Text>
    </View>
  )

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 300

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d.value - min) / range) * (height - 20) - 10,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <View style={{ height: height + 20 }}>
      {/* Simple visual avec View boxes */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 3, paddingHorizontal: 4 }}>
        {data.map((d, i) => {
          const barH = ((d.value - min) / range) * (height - 10) + 10
          const isLast = i === data.length - 1
          return (
            <View key={i} style={{ flex: 1, height: barH, borderRadius: 3, backgroundColor: isLast ? color : `${color}60` }} />
          )
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
          {data[0]?.date ? new Date(data[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color }}>
          {data[data.length - 1]?.value ?? 0}
        </Text>
        <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
          {data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
        </Text>
      </View>
    </View>
  )
}

export default function AnalyticsScreen() {
  const [userId, setUserId] = useState<string | null>(null)
  const [weightData, setWeightData] = useState<DataPoint[]>([])
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, DataPoint[]>>({})
  const [exercises, setExercises] = useState<Array<{ id: string; nom: string }>>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'7j' | '30j' | '90j'>('30j')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await loadData(user.id)
      setLoading(false)
    }
    init()
  }, [selectedPeriod])

  const loadData = async (uid: string) => {
    const daysMap = { '7j': 7, '30j': 30, '90j': 90 }
    const days = daysMap[selectedPeriod]
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().split('T')[0]

    // Poids corporel
    const { data: tracking } = await supabase
      .from('tracking_activity')
      .select('date, poids_du_jour')
      .eq('user_id', uid)
      .gte('date', sinceStr)
      .not('poids_du_jour', 'is', null)
      .order('date', { ascending: true })

    setWeightData(tracking?.map(t => ({ date: t.date, value: t.poids_du_jour! })) ?? [])

    // Logs d'exercices pour 1RM estimé (formule Epley: 1RM = charge × (1 + reps/30))
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('date, charge, repetitions_realisees, session_exercise_id, session_exercises(exercise_library(id, nom))')
      .eq('user_id', uid)
      .gte('date', sinceStr)
      .order('date', { ascending: true })

    if (logs) {
      const byExercise: Record<string, { id: string; nom: string; data: DataPoint[] }> = {}
      for (const log of logs) {
        const ex = (log.session_exercises as any)?.exercise_library
        if (!ex) continue
        if (!byExercise[ex.id]) byExercise[ex.id] = { id: ex.id, nom: ex.nom, data: [] }
        if (log.charge && log.repetitions_realisees) {
          const orm = log.charge * (1 + log.repetitions_realisees / 30)
          byExercise[ex.id].data.push({ date: log.date, value: +orm.toFixed(1) })
        }
      }
      setExercises(Object.values(byExercise).map(e => ({ id: e.id, nom: e.nom })))
      setExerciseLogs(Object.fromEntries(Object.entries(byExercise).map(([k, v]) => [k, v.data])))
    }
  }

  const stats = weightData.length >= 2 ? {
    delta: (weightData[weightData.length - 1].value - weightData[0].value).toFixed(1),
    current: weightData[weightData.length - 1].value,
    min: Math.min(...weightData.map(d => d.value)),
    max: Math.max(...weightData.map(d => d.value)),
  } : null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Mes Progrès</Text>
          <View style={styles.periodSelector}>
            {(['7j', '30j', '90j'] as const).map(p => (
              <TouchableOpacity key={p} onPress={() => setSelectedPeriod(p)}
                style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}>
                <Text style={[styles.periodTabText, selectedPeriod === p && styles.periodTabTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Poids corporel */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Feather name="activity" size={16} color={COLORS.goldPrimary} />
            <Text style={styles.chartTitle}>Courbe de poids</Text>
            {stats && (
              <View style={[styles.deltaBadge, { backgroundColor: +stats.delta < 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                <Feather name={+stats.delta < 0 ? 'trending-down' : 'trending-up'} size={12} color={+stats.delta < 0 ? COLORS.green : COLORS.red} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: +stats.delta < 0 ? COLORS.green : COLORS.red, marginLeft: 4 }}>
                  {+stats.delta > 0 ? '+' : ''}{stats.delta} kg
                </Text>
              </View>
            )}
          </View>

          {stats && (
            <View style={styles.statsRow}>
              {[
                { label: 'Actuel', value: `${stats.current} kg`, color: COLORS.goldPrimary },
                { label: 'Min', value: `${stats.min} kg`, color: COLORS.green },
                { label: 'Max', value: `${stats.max} kg`, color: COLORS.red },
              ].map(s => (
                <View key={s.label} style={styles.statChip}>
                  <Text style={styles.statChipLabel}>{s.label}</Text>
                  <Text style={[styles.statChipValue, { color: s.color }]}>{s.value}</Text>
                </View>
              ))}
            </View>
          )}

          <MiniLineChart data={weightData} color={COLORS.goldPrimary} height={100} />
        </View>

        {/* 1RM par exercice */}
        <Text style={styles.sectionTitle}>Force — 1RM Estimé</Text>
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="trending-up" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Enregistrez vos séances pour voir vos progrès de force</Text>
          </View>
        ) : (
          exercises.map(ex => (
            <View key={ex.id} style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Feather name="zap" size={16} color={COLORS.blue} />
                <Text style={styles.chartTitle}>{ex.nom}</Text>
                {exerciseLogs[ex.id]?.length > 0 && (
                  <View style={[styles.deltaBadge, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.blue }}>
                      {exerciseLogs[ex.id][exerciseLogs[ex.id].length - 1]?.value ?? 0} kg
                    </Text>
                  </View>
                )}
              </View>
              <MiniLineChart data={exerciseLogs[ex.id] ?? []} color={COLORS.blue} height={80} />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  scroll: { flex: 1 },
  container: { padding: SPACING.xl, paddingBottom: 40 },

  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },

  periodSelector: { flexDirection: 'row', backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, padding: 3, gap: 2 },
  periodTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.sm - 2 },
  periodTabActive: { backgroundColor: COLORS.bgOverlay },
  periodTabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  periodTabTextActive: { color: COLORS.textPrimary },

  chartCard: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.xl, marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  chartTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  deltaBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADIUS.full },

  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statChip: {
    flex: 1, backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  statChipLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statChipValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },

  emptyState: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.xxxl, alignItems: 'center', gap: SPACING.md,
  },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
})
