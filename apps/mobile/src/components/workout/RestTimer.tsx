// 🎨 COMPOSANT : RestTimer
// Overlay de récupération entre les séries
// Compte à rebours + barre de progression + bouton passer

import { useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Vibration,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/design'

export interface RestTimerProps {
  seconds: number           // secondes restantes
  totalSeconds: number      // durée totale (pour la barre)
  onSkip: () => void
}

export function RestTimer({ seconds, totalSeconds, onSkip }: RestTimerProps) {
  const ratio = Math.max(0, seconds / totalSeconds)
  const progressAnim = useRef(new Animated.Value(ratio)).current

  const minutes = Math.floor(seconds / 60)
  const secs    = seconds % 60

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(10,10,15,0.96)', 'rgba(10,10,15,0.99)']}
        style={styles.card}
      >
        {/* Icône */}
        <View style={styles.iconWrapper}>
          <Feather name="clock" size={28} color={COLORS.goldPrimary} />
        </View>

        <Text style={styles.title}>Récupération</Text>

        {/* Chrono */}
        <Text style={styles.timer}>
          {minutes > 0 ? `${minutes}:${String(secs).padStart(2, '0')}` : `${secs}s`}
        </Text>

        {/* Barre de progression */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
        </View>

        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', inset: 0, zIndex: 100,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    padding: 40, borderRadius: RADIUS.xl + 4,
    alignItems: 'center', gap: SPACING.lg,
    minWidth: 240,
    borderWidth: 1, borderColor: COLORS.borderGold,
    ...SHADOWS.gold,
  },
  iconWrapper: {
    width: 56, height: 56, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(245,158,11,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.3 },
  timer: {
    fontSize: 72, fontWeight: '700', color: COLORS.goldPrimary,
    letterSpacing: -3, lineHeight: 80,
  },
  progressTrack: {
    width: '100%', height: 4, backgroundColor: COLORS.bgOverlay,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.goldPrimary, borderRadius: 2,
  },
  skipBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl },
  skipText: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
})
