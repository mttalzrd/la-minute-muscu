// 🎨 COMPOSANT : DailyHub
// Bloc central du Dashboard — résumé de la journée de l'adhérent
// INJECTER le design du designer ici

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../../constants/design'

export interface DailyHubProps {
  // Séance du jour
  sessionName?: string | null    // null = jour de repos
  exerciseCount?: number
  onStartWorkout?: () => void

  // Stats journalières
  calories?: number
  caloriesTarget?: number
  steps?: number
  stepsTarget?: number
  weightToday?: number

  // État
  isWorkoutDone?: boolean
  onToggleWorkoutDone?: () => void
}

// 🎨 TODO : Injecter le design DailyHub du designer
export function DailyHub({
  sessionName,
  exerciseCount = 0,
  onStartWorkout,
  calories = 0,
  caloriesTarget = 2500,
  steps = 0,
  stepsTarget = 10000,
  weightToday,
  isWorkoutDone = false,
  onToggleWorkoutDone,
}: DailyHubProps) {
  const calRatio   = Math.min((calories / caloriesTarget) * 100, 100)
  const stepsRatio = Math.min((steps / stepsTarget) * 100, 100)

  return (
    <View style={styles.container}>
      {/* Séance du jour */}
      {sessionName ? (
        <TouchableOpacity onPress={onStartWorkout} activeOpacity={0.9}>
          <LinearGradient colors={['#1A1A24', '#111118']} style={styles.sessionCard}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.sessionIcon}>
              <Feather name="zap" size={22} color="#000" />
            </LinearGradient>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>SÉANCE DU JOUR</Text>
              <Text style={styles.sessionName}>{sessionName}</Text>
              <Text style={styles.sessionMeta}>{exerciseCount} exercices · Commencer →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.restDay}>
          <Text style={{ fontSize: 28 }}>☕</Text>
          <Text style={styles.restText}>Jour de repos — Récupère bien !</Text>
        </View>
      )}

      {/* Grille stats */}
      <View style={styles.statsGrid}>
        {/* Calories */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Feather name="flame" size={14} color={COLORS.red} />
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <Text style={[styles.statValue, { color: COLORS.red }]}>{calories}</Text>
          <Text style={styles.statTarget}>/ {caloriesTarget} kcal</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${calRatio}%`, backgroundColor: COLORS.red }]} />
          </View>
        </View>

        {/* Pas */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Feather name="map" size={14} color={COLORS.green} />
            <Text style={styles.statLabel}>Pas</Text>
          </View>
          <Text style={[styles.statValue, { color: COLORS.green }]}>
            {steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
          </Text>
          <Text style={styles.statTarget}>/ {(stepsTarget / 1000).toFixed(0)}k pas</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stepsRatio}%`, backgroundColor: COLORS.green }]} />
          </View>
        </View>

        {/* Poids */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Feather name="activity" size={14} color={COLORS.goldPrimary} />
            <Text style={styles.statLabel}>Poids</Text>
          </View>
          <Text style={[styles.statValue, { color: COLORS.goldPrimary }]}>
            {weightToday ? `${weightToday}` : '—'}
          </Text>
          <Text style={styles.statTarget}>kg aujourd'hui</Text>
        </View>
      </View>

      {/* Toggle séance faite */}
      <TouchableOpacity
        onPress={onToggleWorkoutDone}
        style={[styles.doneToggle, isWorkoutDone && styles.doneToggleActive]}
        activeOpacity={0.85}
      >
        <Feather
          name={isWorkoutDone ? 'check-circle' : 'circle'}
          size={18}
          color={isWorkoutDone ? COLORS.green : COLORS.textMuted}
        />
        <Text style={[styles.doneToggleText, isWorkoutDone && { color: COLORS.green }]}>
          {isWorkoutDone ? 'Séance effectuée ✓' : 'Marquer la séance comme terminée'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: SPACING.lg },

  sessionCard: {
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderGold,
    ...SHADOWS.gold,
  },
  sessionIcon: {
    width: 50, height: 50, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sessionInfo: { flex: 1 },
  sessionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3,
  },
  sessionName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  sessionMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },

  restDay: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.borderSubtle, padding: SPACING.xl,
  },
  restText: { fontSize: 15, color: COLORS.textSecondary },

  statsGrid: { flexDirection: 'row', gap: SPACING.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.md, gap: 3,
    ...SHADOWS.card,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  statTarget: { fontSize: 10, color: COLORS.textMuted },
  progressBar: { height: 3, backgroundColor: COLORS.bgOverlay, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  doneToggle: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.borderSubtle, padding: SPACING.lg,
  },
  doneToggleActive: { borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' },
  doneToggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
})
