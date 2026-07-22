/**
 * WorkoutCard — React Native
 * Design by Stitch Designer (screen d6a5a2c187c044b9b970b346b8fe316a)
 * Transpiled from React Web (Tailwind) → React Native (StyleSheet)
 *
 * Props:
 * - exerciseName  : string
 * - muscleGroup   : string
 * - series        : number
 * - reps          : string | number
 * - rpe           : number
 * - tempo         : string        (e.g., "3-0-1-0")
 * - restSeconds   : number
 * - coachTip      : string
 * - isActive      : boolean       (highlights the card with neon glow)
 * - isDone        : boolean       (marks as completed / greyed out)
 * - videoUrl      : string | null (optional, hérité du stub)
 * - onPress       : () => void    (optional)
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

// ─── Token primaire du designer ──────────────────────────────
// Le designer utilise une couleur lime/neon (#CCFF00) comme accent principal.
// On l'intègre ici en restant compatible avec le design system global.
const PRIMARY       = '#CCFF00'             // lime neon — couleur primaire designer
const PRIMARY_10    = 'rgba(204,255,0,0.10)'
const PRIMARY_20    = 'rgba(204,255,0,0.20)'
const PRIMARY_40    = 'rgba(204,255,0,0.40)'
const PRIMARY_5     = 'rgba(204,255,0,0.05)'

const SURFACE       = '#1A1A24'             // surface-container   (bgElevated)
const SURFACE_LOW   = '#111118'             // surface-container-low (bgSurface)
const SURFACE_LOWER = '#0A0A0F'             // surface-container-lowest (bgBase)
const ON_SURFACE    = COLORS.textPrimary    // #F1F1F3
const ON_SURFACE_V  = COLORS.textSecondary  // #9898A8
const WHITE_5       = 'rgba(255,255,255,0.05)'
const WHITE_10      = 'rgba(255,255,255,0.10)'

// ─── Interface ───────────────────────────────────────────────
export interface WorkoutCardProps {
  exerciseName: string
  muscleGroup:  string
  series:       number
  reps:         string | number
  rpe:          number
  tempo:        string
  restSeconds:  number
  coachTip?:    string
  isActive?:    boolean
  isDone?:      boolean
  videoUrl?:    string | null
  onPress?:     () => void
}

// ─── Composant ───────────────────────────────────────────────
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
  isDone   = false,
  onPress,
}: WorkoutCardProps) {

  const metrics = [
    { label: 'SETS', value: String(series)        },
    { label: 'REPS', value: String(reps)           },
    { label: 'RPE',  value: String(rpe)            },
    { label: 'REST', value: `${restSeconds}s`      },
  ]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[
        styles.card,
        isDone   && styles.cardDone,
        isActive && !isDone && styles.cardActive,
      ]}
    >
      {/* Active glow overlay (blur-3xl approximé) */}
      {isActive && !isDone && (
        <View style={styles.activeGlow} pointerEvents="none" />
      )}

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Groupe musculaire — texte primary neon */}
          <Text style={[styles.muscleGroup, isDone && styles.dimText]}>
            {muscleGroup.toUpperCase()}
          </Text>
          {/* Nom exercice */}
          <Text style={[styles.exerciseName, isDone && styles.dimText]}>
            {exerciseName}
          </Text>
        </View>

        {/* Badge check si terminé */}
        {isDone && (
          <View style={styles.doneBadge}>
            <MaterialIcons name="check-circle" size={18} color={PRIMARY} />
          </View>
        )}
      </View>

      {/* ── Grille métriques — Bevel Style ─────────────── */}
      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View key={m.label} style={[styles.metricBox, isDone && styles.metricBoxDone]}>
            <Text style={[styles.metricLabel, isDone && styles.dimText]}>{m.label}</Text>
            <Text style={[styles.metricValue, isDone && styles.dimText]}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* ── Tempo ──────────────────────────────────────── */}
      <View style={styles.tempoRow}>
        <MaterialIcons name="timer" size={15} color={ON_SURFACE_V} />
        <Text style={styles.tempoText}>
          Tempo :{' '}
          <Text style={[styles.tempoValue, isDone && styles.dimText]}>{tempo}</Text>
        </Text>
      </View>

      {/* ── Coach Tip — Premium Bevel Frame ────────────── */}
      {!!coachTip && (
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={18} color={PRIMARY} style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>COACH TIP</Text>
            <Text style={styles.tipText}>"{coachTip}"</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Carte de base
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: WHITE_10,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    // shadow-xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },

  // État : terminé (opacity + grayscale approximé)
  cardDone: {
    backgroundColor: SURFACE_LOW,
    borderColor: WHITE_5,
    opacity: 0.65,
  },

  // État : actif (ring neon + shadow glow)
  cardActive: {
    borderWidth: 1.5,
    borderColor: PRIMARY_40,
    // Glow neon — shadow lime
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 18,
  },

  // Glow overlay coin supérieur droit
  activeGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY_10,
    // blur approximé via grande ombre
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 0,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerLeft: { flex: 1, gap: 4 },

  muscleGroup: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: PRIMARY,          // neon lime — accent designer
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: ON_SURFACE,
    letterSpacing: -0.5,
    lineHeight: 24,
  },

  doneBadge: {
    backgroundColor: PRIMARY_20,
    padding: 6,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Grille métriques — Bevel inset style
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metricBox: {
    flex: 1,
    backgroundColor: SURFACE_LOW,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: WHITE_5,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    // Bevel inset : bord haut/gauche clair, bas/droite sombre
    shadowColor: '#000',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  metricBoxDone: {
    opacity: 0.7,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: ON_SURFACE_V,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ON_SURFACE,
    letterSpacing: -0.3,
  },

  // ── Tempo row
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${SURFACE_LOWER}80`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: WHITE_5,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  tempoText: {
    fontSize: 12,
    color: ON_SURFACE_V,
    flex: 1,
  },
  tempoValue: {
    fontFamily: 'monospace' as any,  // font-mono
    fontWeight: '700',
    color: ON_SURFACE,
    letterSpacing: 0.5,
  },

  // ── Coach Tip — bevel frame premium
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: PRIMARY_5,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    borderTopWidth: 1,
    borderTopColor: WHITE_5,
    borderRightWidth: 1,
    borderRightColor: WHITE_5,
    borderBottomWidth: 1,
    borderBottomColor: WHITE_5,
    padding: SPACING.lg,
    // Inner shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: `${ON_SURFACE}E8`,  // /90 opacity
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // État dim (isDone)
  dimText: {
    opacity: 0.55,
  },
})
