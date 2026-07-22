// 🎨 COMPOSANT : QuickStats
// Ligne de stats rapides en bas du Dashboard

import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/design'

export interface StatItem {
  icon: string
  label: string
  value: string
  color: string
}

export interface QuickStatsProps {
  stats: StatItem[]
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.stat}>
          <Feather name={stat.icon as any} size={16} color={stat.color} />
          <Text style={[styles.value, { color: stat.color }]}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.md },
  stat: {
    flex: 1, backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.xs,
    ...SHADOWS.card,
  },
  value: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
})
