/**
 * AnalyticsChart — React Native
 * Design by Stitch Designer (screen 27b2554574f249c98fb666871aaa0e93)
 * Transpiled from React Web (Tailwind) → React Native (StyleSheet + SVG + Animated)
 *
 * Sections :
 * 1. Courbe 1RM Evolution — SVG Path Bézier quadratique
 * 2. Consistency Heatmap  — grille 7×5 (35 derniers jours)
 *
 * Props :
 * - rmData        : DataPoint[]   — évolution 1RM estimé dans le temps
 * - currentRM     : number        — dernier 1RM estimé (affiché en header)
 * - heatmapDays   : HeatmapDay[]  — 35 jours (is_workout_done)
 * - exerciseName  : string        — ex: "Développé couché"
 */

import { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import Svg, { Path, Circle, Line } from 'react-native-svg'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

// ─── Tokens designer ──────────────────────────────────────────
const PRIMARY      = '#CCFF00'
const PRIMARY_40   = 'rgba(204,255,0,0.40)'
const PRIMARY_20   = 'rgba(204,255,0,0.20)'
const PRIMARY_10   = 'rgba(204,255,0,0.10)'
const SURFACE      = '#1A1A24'
const SURFACE_LOW  = '#111118'
const SURFACE_LWR  = '#0A0A0F'
const ON_SURFACE   = COLORS.textPrimary
const ON_SURF_V    = COLORS.textSecondary
const WHITE_5      = 'rgba(255,255,255,0.05)'
const WHITE_10     = 'rgba(255,255,255,0.10)'

// ─── Types ────────────────────────────────────────────────────
export interface DataPoint {
  date:  string   // ISO "2024-01-15"
  value: number   // 1RM en kg
}

export interface HeatmapDay {
  date:      string
  done:      boolean    // is_workout_done
  intensity: 0 | 0.4 | 1  // 0=repos, 0.4=partiel, 1=complet
}

export interface AnalyticsChartProps {
  rmData:       DataPoint[]
  currentRM:    number
  heatmapDays:  HeatmapDay[]
  exerciseName: string
}

// ─── Constantes SVG chart ─────────────────────────────────────
const CHART_W = 400
const CHART_H = 100
const PADDING = 8

// Convertit des DataPoint en path SVG normalisé dans le viewBox
function buildSvgPath(data: DataPoint[]): { pathD: string; lastX: number; lastY: number } {
  if (data.length < 2) return { pathD: '', lastX: 0, lastY: CHART_H / 2 }

  const values = data.map(d => d.value)
  const min    = Math.min(...values)
  const max    = Math.max(...values)
  const range  = max - min || 1

  const pts = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1)) * (CHART_W - PADDING * 2),
    y: PADDING + (1 - (d.value - min) / range) * (CHART_H - PADDING * 2),
  }))

  // Courbe smooth — Catmull-Rom via Control Points
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpX = (prev.x + curr.x) / 2
    d += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`
  }

  return { pathD: d, lastX: pts[pts.length - 1].x, lastY: pts[pts.length - 1].y }
}

// ─── Composant pulse animé pour le dernier point ─────────────
function PulsingDot({ cx, cy }: { cx: number; cy: number }) {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.2, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 0,   useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0,   useNativeDriver: true }),
        ]),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  return (
    <View
      style={{
        position: 'absolute',
        left: 0, top: 0, right: 0, bottom: 0,
        // On ne peut pas positionner le dot en coordonnées SVG viewBox ici —
        // on utilise un Animated.View superposé au SVG pour le halo pulse
      }}
      pointerEvents="none"
    />
  )
}

// ─── Heatmap Cell ─────────────────────────────────────────────
function HeatCell({ intensity }: { intensity: 0 | 0.4 | 1 }) {
  const bg =
    intensity === 1   ? PRIMARY :
    intensity === 0.4 ? PRIMARY_40 :
    SURFACE_LWR

  const glow = intensity === 1
    ? { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 }
    : {}

  return <View style={[styles.heatCell, { backgroundColor: bg }, glow]} />
}

// ─── Composant principal ──────────────────────────────────────
export function AnalyticsChart({
  rmData,
  currentRM,
  heatmapDays,
  exerciseName,
}: AnalyticsChartProps) {

  const { pathD, lastX, lastY } = buildSvgPath(rmData)
  const hasData = rmData.length >= 2

  // Heatmap — on s'assure d'avoir exactement 35 cellules
  const cells = heatmapDays.slice(0, 35)
  while (cells.length < 35) {
    cells.push({ date: '', done: false, intensity: 0 })
  }

  return (
    <View style={styles.card}>

      {/* ── Header 1RM ────────────────────────────────── */}
      <View style={styles.rmHeader}>
        <View>
          <Text style={styles.tagline}>PERFORMANCE</Text>
          <Text style={styles.title}>1RM ÉVOLUTION</Text>
        </View>
        <View style={styles.rmRight}>
          <Text style={styles.rmEstLabel}>ESTIMÉ ACTUEL</Text>
          <Text style={styles.rmValue}>
            {currentRM > 0 ? `${currentRM.toFixed(1)} kg` : '—'}
          </Text>
        </View>
      </View>

      {/* Exercice sélectionné */}
      {exerciseName ? (
        <Text style={styles.exerciseTag}>{exerciseName.toUpperCase()}</Text>
      ) : null}

      {/* ── Chart Area — Bevel Frame ───────────────────── */}
      <View style={styles.chartFrame}>
        {/* Grid lines (4 lignes) */}
        <View style={styles.gridLines} pointerEvents="none">
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>

        {/* SVG courbe */}
        {hasData ? (
          <Svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            style={styles.chartSvg}
            preserveAspectRatio="none"
          >
            {/* Courbe principale */}
            <Path
              d={pathD}
              fill="none"
              stroke={PRIMARY}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Zone remplie sous la courbe */}
            <Path
              d={`${pathD} L ${lastX} ${CHART_H} L ${PADDING} ${CHART_H} Z`}
              fill={PRIMARY_10}
            />
            {/* Point final — cercle plein */}
            <Circle cx={lastX} cy={lastY} r={4}  fill={PRIMARY} />
            {/* Halo pulse — cercle extérieur (statique, version non-animée stable) */}
            <Circle cx={lastX} cy={lastY} r={8}  fill={PRIMARY_20} />
            <Circle cx={lastX} cy={lastY} r={14} fill={PRIMARY_10} />
          </Svg>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              Enregistre des séances pour voir la courbe 1RM
            </Text>
          </View>
        )}
      </View>

      {/* ── Consistency Heatmap ────────────────────────── */}
      <Text style={styles.heatmapLabel}>CONSISTENCY HEATMAP</Text>

      <View style={styles.heatmapGrid}>
        {cells.map((cell, idx) => (
          <HeatCell key={idx} intensity={cell.intensity} />
        ))}
      </View>

      {/* ── Légende ───────────────────────────────────── */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>LESS</Text>
        <View style={styles.legendDots}>
          <View style={[styles.legendDot, { backgroundColor: SURFACE_LWR }]} />
          <View style={[styles.legendDot, { backgroundColor: PRIMARY_40 }]} />
          <View style={[styles.legendDot, { backgroundColor: PRIMARY    }]} />
        </View>
        <Text style={styles.legendText}>MORE</Text>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: SURFACE,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: WHITE_10,
    padding: SPACING.xxl + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },

  // ── Header 1RM
  rmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 10, fontWeight: '700', color: PRIMARY,
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3,
  },
  title: {
    fontSize: 22, fontWeight: '900', color: ON_SURFACE,
    letterSpacing: -0.5, fontStyle: 'italic', textTransform: 'uppercase',
  },
  rmRight: { alignItems: 'flex-end' },
  rmEstLabel: {
    fontSize: 9, fontWeight: '700', color: ON_SURF_V,
    textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.6,
  },
  rmValue: {
    fontSize: 20, fontWeight: '900', color: PRIMARY,
    letterSpacing: -0.5, marginTop: 2,
  },
  exerciseTag: {
    fontSize: 9, fontWeight: '700', color: ON_SURF_V,
    letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5,
    marginBottom: SPACING.lg,
  },

  // ── Chart frame — bevel inset
  chartFrame: {
    height: 192,               // h-48 = 192px
    backgroundColor: SURFACE_LOW,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: WHITE_5,
    marginBottom: SPACING.xxl + 4,
    overflow: 'hidden',
    position: 'relative',
    // Bevel inset
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  gridLines: {
    position: 'absolute',
    inset: 0,
    top: 0, left: 0, right: 0, bottom: 0,
    padding: SPACING.md,
    justifyContent: 'space-between',
    opacity: 0.10,
  },
  gridLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  chartSvg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyChartText: {
    fontSize: 13, color: ON_SURF_V, textAlign: 'center', opacity: 0.6, lineHeight: 20,
  },

  // ── Heatmap
  heatmapLabel: {
    fontSize: 9, fontWeight: '700', color: ON_SURF_V,
    letterSpacing: 2.5, textTransform: 'uppercase',
    opacity: 0.6, marginBottom: SPACING.md,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,                   // gap-2 ≈ 8px
    marginBottom: SPACING.md,
  },
  heatCell: {
    // 7 colonnes — calcul : (100% - 6 gaps × 6px) / 7
    // En RN on utilise un ratio fixe
    width: 36,
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: WHITE_5,
  },

  // ── Légende
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    opacity: 0.55,
    marginTop: SPACING.sm,
  },
  legendText: {
    fontSize: 8, fontWeight: '700', color: ON_SURF_V,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  legendDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  legendDot:  { width: 8, height: 8, borderRadius: 2 },
})
