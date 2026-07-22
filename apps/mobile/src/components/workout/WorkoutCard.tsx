// 🎨 COMPOSANT : WorkoutCard
// Carte d'exercice affichée dans le tracker de séance
// INJECTER le design du designer ici

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/design'

export interface WorkoutCardProps {
  exerciseName: string
  muscleGroup: string
  series: number
  reps: string          // ex: "8-12" ou "10"
  rpe?: number          // Rate of Perceived Exertion
  tempo?: string        // ex: "3-1-2-0"
  restSeconds: number
  videoUrl?: string | null
  coachTip?: string
  isActive?: boolean    // carte actuellement en cours
  isDone?: boolean      // toutes les séries terminées
  onPress?: () => void
}

// 🎨 TODO : Injecter le design WorkoutCard du designer
export function WorkoutCard({
  exerciseName,
  muscleGroup,
  series,
  reps,
  rpe,
  tempo,
  restSeconds,
  coachTip,
  isActive = false,
  isDone = false,
  onPress,
}: WorkoutCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        isActive && styles.cardActive,
        isDone && styles.cardDone,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.musclePill}>{muscleGroup}</Text>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
        </View>
        {isDone && (
          <View style={styles.doneBadge}>
            <Feather name="check" size={14} color={COLORS.green} />
          </View>
        )}
        {isActive && !isDone && (
          <View style={styles.activeDot} />
        )}
      </View>

      {/* Paramètres */}
      <View style={styles.params}>
        {[
          { icon: 'repeat', label: `${series} × ${reps}`, sublabel: 'Séries × Reps' },
          { icon: 'zap', label: rpe ? `RPE ${rpe}` : '—', sublabel: 'Intensité' },
          { icon: 'clock', label: `${restSeconds}s`, sublabel: 'Repos' },
        ].map((p) => (
          <View key={p.sublabel} style={styles.param}>
            <Feather name={p.icon as any} size={13} color={isActive ? COLORS.goldPrimary : COLORS.textMuted} />
            <Text style={[styles.paramValue, isActive && { color: COLORS.goldPrimary }]}>{p.label}</Text>
            <Text style={styles.paramLabel}>{p.sublabel}</Text>
          </View>
        ))}
        {tempo && (
          <View style={styles.param}>
            <Feather name="activity" size={13} color={COLORS.textMuted} />
            <Text style={styles.paramValue}>{tempo}</Text>
            <Text style={styles.paramLabel}>Tempo</Text>
          </View>
        )}
      </View>

      {/* Tip du coach */}
      {coachTip && (
        <View style={styles.tip}>
          <Feather name="zap" size={12} color={COLORS.goldPrimary} />
          <Text style={styles.tipText} numberOfLines={2}>{coachTip}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  cardActive: {
    borderColor: COLORS.borderGold,
    backgroundColor: 'rgba(245,158,11,0.04)',
  },
  cardDone: {
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: 'rgba(16,185,129,0.03)',
    opacity: 0.8,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { flex: 1, gap: 4 },
  musclePill: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  exerciseName: {
    fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3,
  },
  doneBadge: {
    width: 28, height: 28, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  activeDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.goldPrimary,
    marginTop: 6,
  },
  params: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  param: {
    flex: 1, minWidth: 60,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.sm,
    alignItems: 'center', gap: 3,
  },
  paramValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  paramLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tip: {
    flexDirection: 'row', gap: SPACING.xs, alignItems: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderRadius: RADIUS.md, padding: SPACING.sm,
    borderLeftWidth: 2, borderLeftColor: COLORS.goldPrimary,
  },
  tipText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
})
