// 🎨 COMPOSANT : ProgressChart
// Graphique de progression sous forme de barres (sans lib externe)
// Adaptable pour poids, calories, 1RM

import { View, Text, StyleSheet } from 'react-native'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

export interface DataPoint {
  date: string
  value: number
}

export interface ProgressChartProps {
  data: DataPoint[]
  color?: string
  label?: string
  unit?: string
  height?: number
}

export function ProgressChart({
  data,
  color = COLORS.goldPrimary,
  label = 'Progression',
  unit = '',
  height = 100,
}: ProgressChartProps) {
  if (!data.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Pas encore de données</Text>
      </View>
    )
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const last = data[data.length - 1]
  const delta = data.length > 1 ? last.value - data[0].value : 0

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.chartLabel}>{label}</Text>
        <View style={styles.deltaRow}>
          <Text style={[styles.currentVal, { color }]}>{last.value}{unit}</Text>
          {delta !== 0 && (
            <Text style={[styles.delta, { color: delta < 0 ? COLORS.green : COLORS.red }]}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit}
            </Text>
          )}
        </View>
      </View>

      {/* Barres */}
      <View style={[styles.chart, { height }]}>
        {data.map((d, i) => {
          const barH = ((d.value - min) / range) * (height - 16) + 8
          const isLast = i === data.length - 1
          return (
            <View key={i} style={styles.barWrapper}>
              <View style={[
                styles.bar,
                {
                  height: barH,
                  backgroundColor: isLast ? color : `${color}50`,
                  borderRadius: RADIUS.sm / 2,
                },
              ]} />
            </View>
          )
        })}
      </View>

      {/* Dates */}
      <View style={styles.datesRow}>
        <Text style={styles.date}>
          {new Date(data[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </Text>
        <Text style={styles.date}>
          {new Date(last.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  deltaRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs },
  currentVal: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  delta: { fontSize: 12, fontWeight: '700' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  barWrapper: { flex: 1, alignItems: 'stretch', justifyContent: 'flex-end' },
  bar: { width: '100%' },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 10, color: COLORS.textMuted },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: COLORS.textMuted },
})
