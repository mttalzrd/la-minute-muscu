/**
 * NutritionDashboard — React Native
 * Design by Stitch Designer (screen f56748548b174c9487e94036c4281e09)
 * Transpiled from React Web (Tailwind) → React Native (StyleSheet + SVG)
 *
 * Props (mappées depuis tracking_activity + profil) :
 * - consumedCalories  : number   — calories saisies aujourd'hui
 * - totalCalories     : number   — objectif calorique
 * - proteinCurrent    : number   — protéines estimées (g)
 * - proteinTarget     : number
 * - carbCurrent       : number   — glucides estimés (g)
 * - carbTarget        : number
 * - fatCurrent        : number   — lipides estimés (g)
 * - fatTarget         : number
 * - nbrRepas          : number   — nombre de repas (3 | 4 | 5 | 6)
 */

import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

// ─── Tokens designer ─────────────────────────────────────────
const PRIMARY     = '#CCFF00'              // lime neon
const PRIMARY_40  = 'rgba(204,255,0,0.40)'
const PROTEIN_CLR = '#FF006E'              // magenta chaud
const CARBS_CLR   = '#00F5FF'             // cyan électrique
const FATS_CLR    = PRIMARY               // lime (même que primary)
const SURFACE     = '#1A1A24'
const SURFACE_LOW = '#111118'
const SURFACE_LWR = '#0A0A0F'
const ON_SURFACE  = COLORS.textPrimary
const ON_SURF_V   = COLORS.textSecondary
const WHITE_5     = 'rgba(255,255,255,0.05)'
const WHITE_10    = 'rgba(255,255,255,0.10)'

// ─── Jauge circulaire SVG ─────────────────────────────────────
const GAUGE_SIZE  = 224     // w-56 = 224px
const GAUGE_CX    = 112
const GAUGE_CY    = 112
const GAUGE_R     = 90
const CIRCUMF     = 2 * Math.PI * GAUGE_R  // ≈ 565.48

function CalorieGauge({ consumed, total }: { consumed: number; total: number }) {
  const pct          = Math.min(consumed / Math.max(total, 1), 1)
  const dashOffset   = CIRCUMF * (1 - pct)
  const remaining    = Math.max(total - consumed, 0)

  return (
    <View style={styles.gaugeWrapper}>
      {/* Ombre bevel inset simulée */}
      <View style={styles.gaugeShadow} />

      {/* SVG Ring */}
      <Svg
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        style={styles.gaugeSvg}
      >
        {/* Track */}
        <Circle
          cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
          fill="transparent"
          stroke={SURFACE_LWR}
          strokeWidth={12}
        />
        {/* Progress arc — lime neon */}
        <Circle
          cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
          fill="transparent"
          stroke={PRIMARY}
          strokeWidth={12}
          strokeDasharray={`${CIRCUMF}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${GAUGE_CX}, ${GAUGE_CY}`}
        />
      </Svg>

      {/* Centre label */}
      <View style={styles.gaugeCenter}>
        <Text style={styles.gaugeSubLabel}>Restantes</Text>
        <Text style={styles.gaugeMain}>{remaining}</Text>
        <Text style={styles.gaugeOf}>/ {total} kcal</Text>
      </View>
    </View>
  )
}

// ─── Barre de macro ───────────────────────────────────────────
function MacroBar({ label, current, target, color }: {
  label: string; current: number; target: number; color: string
}) {
  const pct = Math.min((current / Math.max(target, 1)) * 100, 100)
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          <Text style={styles.macroValueCurrent}>{current}</Text>
          {' '}/ {target}g
        </Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  )
}

// ─── Interface ───────────────────────────────────────────────
export interface NutritionDashboardProps {
  consumedCalories: number
  totalCalories:    number
  proteinCurrent:   number
  proteinTarget:    number
  carbCurrent:      number
  carbTarget:       number
  fatCurrent:       number
  fatTarget:        number
  nbrRepas:         number
}

// ─── Composant principal ──────────────────────────────────────
export function NutritionDashboard({
  consumedCalories,
  totalCalories,
  proteinCurrent,
  proteinTarget,
  carbCurrent,
  carbTarget,
  fatCurrent,
  fatTarget,
  nbrRepas,
}: NutritionDashboardProps) {

  const calPerRepas = Math.round(totalCalories / Math.max(nbrRepas, 1))

  const macros = [
    { label: 'PROTEIN', current: proteinCurrent, target: proteinTarget, color: PROTEIN_CLR },
    { label: 'CARBS',   current: carbCurrent,    target: carbTarget,    color: CARBS_CLR   },
    { label: 'FATS',    current: fatCurrent,     target: fatTarget,     color: FATS_CLR    },
  ]

  return (
    <View style={styles.card}>

      {/* ── Header ───────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.tagline}>FUEL INTAKE</Text>
        <Text style={styles.title}>Nutrition</Text>
      </View>

      {/* ── Jauge principale ─────────────────────────────── */}
      <View style={styles.gaugeSection}>
        <CalorieGauge consumed={consumedCalories} total={totalCalories} />
      </View>

      {/* ── Barres macros — Bevel progress ───────────────── */}
      <View style={styles.macrosSection}>
        {macros.map(m => (
          <MacroBar key={m.label} {...m} />
        ))}
      </View>

      {/* ── Répartition repas — bevel inset ─────────────── */}
      <View style={styles.mealBreakdown}>
        {/* Header bevel */}
        <View style={styles.mealBreakdownHeader}>
          <MaterialIcons name="restaurant-menu" size={14} color={PRIMARY} />
          <Text style={styles.mealBreakdownTitle}>
            PROTOCOL BREAKDOWN ({nbrRepas} MEALS)
          </Text>
        </View>

        {/* Grille repas */}
        <View style={styles.mealGrid}>
          {Array.from({ length: nbrRepas }).map((_, i) => (
            <View key={i} style={styles.mealCell}>
              <Text style={styles.mealCellLabel}>M{i + 1}</Text>
              <Text style={styles.mealCellValue}>{calPerRepas}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({

  card: {
    backgroundColor: SURFACE,
    borderRadius: 32,          // rounded-[2rem]
    borderWidth: 1,
    borderColor: WHITE_10,
    padding: SPACING.xxl + 4,  // p-8 ≈ 32px
    overflow: 'hidden',
    // shadow-2xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },

  // ── Header
  header: { marginBottom: SPACING.xxl },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: ON_SURFACE,
    letterSpacing: -0.8,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },

  // ── Jauge
  gaugeSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl + 4,
  },
  gaugeWrapper: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeShadow: {
    position: 'absolute',
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    backgroundColor: SURFACE_LOW,
    // Bevel inset — ombre intérieure simulée via border
    borderWidth: 1,
    borderColor: WHITE_5,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  gaugeSvg: {
    position: 'absolute',
  },
  gaugeCenter: {
    alignItems: 'center',
    zIndex: 10,
  },
  gaugeSubLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: ON_SURF_V,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  gaugeMain: {
    fontSize: 48,
    fontWeight: '900',
    color: ON_SURFACE,
    letterSpacing: -2,
    lineHeight: 56,
    marginVertical: 2,
  },
  gaugeOf: {
    fontSize: 9,
    fontWeight: '700',
    color: ON_SURF_V,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.6,
  },

  // ── Barres macros
  macrosSection: {
    gap: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: ON_SURFACE,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  macroValue: {
    fontSize: 11,
    fontWeight: '700',
    color: ON_SURF_V,
  },
  macroValueCurrent: {
    color: ON_SURFACE,
    fontWeight: '700',
  },
  macroTrack: {
    height: 16,                // h-4
    backgroundColor: SURFACE_LWR,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: WHITE_5,
    // shadow-inner
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  macroFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    // Glow via ombre
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Répartition repas — bevel inset card
  mealBreakdown: {
    backgroundColor: SURFACE_LOW,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: WHITE_5,
    padding: SPACING.lg + 4,   // p-5 ≈ 20px
    // Bevel inset
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  mealBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  mealBreakdownTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mealGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  mealCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  mealCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: ON_SURF_V,
    marginBottom: 2,
  },
  mealCellValue: {
    fontSize: 13,
    fontWeight: '900',
    color: ON_SURFACE,
    letterSpacing: -0.5,
  },
})
