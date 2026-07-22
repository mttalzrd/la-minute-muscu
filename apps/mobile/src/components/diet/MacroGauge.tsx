// 🎨 COMPOSANT : MacroGauge
// Jauge circulaire (approximée avec View) pour les macronutriments

import { View, Text, StyleSheet } from 'react-native'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

export interface MacroGaugeProps {
  label: string
  current: number
  target: number
  color: string
  unit?: string
}

export function MacroGauge({ label, current, target, color, unit = 'g' }: MacroGaugeProps) {
  const pct = Math.min((current / target) * 100, 100)
  const isOver = current > target

  return (
    <View style={styles.container}>
      {/* Cercle approximé */}
      <View style={[styles.circle, { borderColor: `${color}30` }]}>
        <View style={[styles.circleFill, {
          backgroundColor: `${color}15`,
          width: `${pct}%` as any,
          height: `${pct}%` as any,
          borderRadius: RADIUS.full,
        }]} />
        <View style={styles.circleContent}>
          <Text style={[styles.pct, { color }]}>{Math.round(pct)}%</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.values, { color: isOver ? COLORS.red : COLORS.textMuted }]}>
        {current}{unit} / {target}{unit}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: SPACING.xs },
  circle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  circleFill: { position: 'absolute' },
  circleContent: { alignItems: 'center' },
  pct: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  values: { fontSize: 10, textAlign: 'center' },
})
