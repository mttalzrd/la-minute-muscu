/**
 * DailyHub — React Native
 * Design by Stitch Designer (screen 87acdbacad3e44d6b48c32c613c75c0b)
 * Transpiled from React Web (Tailwind) → React Native (StyleSheet + Animated)
 *
 * Props (designer) :
 * - sessionName   : string
 * - calories      : number
 * - steps         : number
 * - weightToday   : number
 * - isWorkoutDone : boolean
 *
 * Props (extended — logique app) :
 * - exerciseCount     : number   (optionnel)
 * - caloriesTarget    : number   (optionnel)
 * - stepsTarget       : number   (optionnel)
 * - onStartWorkout    : () => void
 * - onToggleWorkoutDone : () => void
 */

import { useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Pressable,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

// ─── Tokens designer ─────────────────────────────────────────
const PRIMARY        = '#CCFF00'               // lime neon — accent designer
const PRIMARY_DARK   = '#99BF00'               // ombre 3D du bouton (#99bf00)
const PRIMARY_30     = 'rgba(204,255,0,0.30)'
const PRIMARY_5      = 'rgba(204,255,0,0.05)'
const SURFACE        = '#1A1A24'               // surface-container
const SURFACE_LOW    = '#111118'               // surface-container-low
const SURFACE_LOWER  = '#0A0A0F'               // surface-container-lowest
const ON_SURFACE     = COLORS.textPrimary
const ON_SURFACE_V   = COLORS.textSecondary
const WHITE_5        = 'rgba(255,255,255,0.05)'
const WHITE_10       = 'rgba(255,255,255,0.10)'
const WHITE_3        = 'rgba(255,255,255,0.03)'

// ─── Interface ───────────────────────────────────────────────
export interface DailyHubProps {
  // Props designer (required)
  sessionName:   string
  calories:      number
  steps:         number
  weightToday:   number
  isWorkoutDone: boolean

  // Props étendues (logique app)
  exerciseCount?:       number
  caloriesTarget?:      number
  stepsTarget?:         number
  onStartWorkout?:      () => void
  onToggleWorkoutDone?: () => void
}

// ─── Composant ───────────────────────────────────────────────
export function DailyHub({
  sessionName,
  calories,
  steps,
  weightToday,
  isWorkoutDone,
  onStartWorkout,
}: DailyHubProps) {

  // Animation 3D du bouton CTA (pression → translateY)
  const btnAnim = useRef(new Animated.Value(0)).current

  const onPressIn = () => {
    Animated.spring(btnAnim, {
      toValue: 6,        // bouton "s'enfonce" de 6px
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(btnAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start()
  }

  const metrics = [
    { label: 'KCAL',   value: String(calories),              icon: 'local-fire-department' as const },
    { label: 'STEPS',  value: steps.toLocaleString('fr-FR'), icon: 'directions-walk'       as const },
    { label: 'WEIGHT', value: `${weightToday}kg`,            icon: 'scale'                 as const },
  ]

  return (
    <View style={styles.card}>

      {/* ── Ligne gradient supérieure ──────────────────── */}
      {/* bg-gradient-to-r from-transparent via-primary/30 to-transparent */}
      <LinearGradient
        colors={['transparent', PRIMARY_30, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      {/* ── Section Session ────────────────────────────── */}
      <View style={styles.sessionSection}>

        {/* Today's Protocol label */}
        <Text style={styles.protocolLabel}>TODAY'S PROTOCOL</Text>

        {/* Nom de la séance — italic uppercase font-black */}
        <Text style={styles.sessionName} numberOfLines={2}>
          {sessionName}
        </Text>

        {/* ── Bouton CTA 3D Bevel ──────────────────────── */}
        {isWorkoutDone ? (
          /* État : terminé — grisé, pas interactif */
          <View style={styles.btnDoneWrapper}>
            <View style={styles.btnDone}>
              <MaterialIcons name="check-circle" size={20} color={ON_SURFACE_V} />
              <Text style={styles.btnDoneText}>SESSION COMPLETED</Text>
            </View>
          </View>
        ) : (
          /* État : actif — bouton lime 3D avec ombre pressable */
          <View style={styles.btnActiveOuter}>
            {/* Couche ombre 3D (le "socle" #99bf00) */}
            <View style={styles.btnShadowLayer} />

            {/* Face avant du bouton — s'anime vers le bas au press */}
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={onStartWorkout}
            >
              <Animated.View
                style={[
                  styles.btnActiveFront,
                  { transform: [{ translateY: btnAnim }] },
                ]}
              >
                <MaterialIcons name="fitness-center" size={20} color={SURFACE_LOWER} />
                <Text style={styles.btnActiveText}>START WORKOUT</Text>
              </Animated.View>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Grille métriques — Bevel inset ─────────────── */}
      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View key={m.label} style={styles.metricCard}>
            {/* Icon wrapper */}
            <View style={styles.metricIconBg}>
              <MaterialIcons name={m.icon} size={14} color={ON_SURFACE_V} style={{ opacity: 0.7 }} />
            </View>

            {/* Label */}
            <Text style={styles.metricLabel}>{m.label}</Text>

            {/* Valeur */}
            <Text style={styles.metricValue}>{m.value}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Carte principale
  card: {
    backgroundColor: SURFACE,
    borderRadius: RADIUS.xl + 4,   // rounded-3xl ≈ 24px
    borderWidth: 1,
    borderColor: WHITE_10,
    padding: SPACING.xxl,
    overflow: 'hidden',
    position: 'relative',
    // shadow-2xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },

  // Ligne gradient 1px en haut
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  // ── Section session
  sessionSection: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
    paddingTop: SPACING.sm,   // espace après la ligne gradient
  },

  protocolLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ON_SURFACE_V,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    opacity: 0.6,
  },

  sessionName: {
    fontSize: 22,
    fontWeight: '900',   // font-black
    color: ON_SURFACE,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 28,
  },

  // ── Bouton terminé (grisé)
  btnDoneWrapper: {
    width: '100%',
  },
  btnDone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: '#2A2A36',
    borderWidth: 1,
    borderColor: WHITE_5,
    opacity: 0.5,
  },
  btnDoneText: {
    fontSize: 13,
    fontWeight: '900',
    color: ON_SURFACE_V,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // ── Bouton CTA 3D actif
  btnActiveOuter: {
    width: '100%',
    position: 'relative',
  },

  // Couche ombre 3D (#99bf00) — socle visible en bas
  btnShadowLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,          // même hauteur que le bouton
    backgroundColor: PRIMARY_DARK,
    borderRadius: RADIUS.xl,
  },

  // Face avant du bouton (lime vif) — translateY animé
  btnActiveFront: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: PRIMARY,
    // Halo glow
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    // Décalage initial (bouton "flotte" au-dessus de l'ombre)
    marginBottom: 6,
  },
  btnActiveText: {
    fontSize: 14,
    fontWeight: '900',
    color: SURFACE_LOWER,   // texte sombre sur fond lime
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // ── Grille métriques
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  metricCard: {
    flex: 1,
    backgroundColor: SURFACE_LOW,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: WHITE_5,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    // Bevel inset — bord haut clair / bas sombre
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },

  metricIconBg: {
    backgroundColor: `${SURFACE_LOWER}80`,
    borderRadius: RADIUS.sm,
    padding: 6,
    marginBottom: 3,
  },

  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: ON_SURFACE_V,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.5,
  },

  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: ON_SURFACE,
    letterSpacing: -0.5,
  },
})
