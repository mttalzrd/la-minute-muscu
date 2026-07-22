// 🎨 COMPOSANT : SerieRow
// Ligne de saisie pour une série dans le workout tracker
// Charge (kg) + Reps réalisées + bouton validation

import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

export interface SerieRowProps {
  serieNumber: number
  targetReps: string
  charge: string
  reps: string
  isDone: boolean
  onChargeChange: (v: string) => void
  onRepsChange:   (v: string) => void
  onValidate:     () => void
}

export function SerieRow({
  serieNumber, targetReps, charge, reps, isDone,
  onChargeChange, onRepsChange, onValidate,
}: SerieRowProps) {
  return (
    <View style={[styles.row, isDone && styles.rowDone]}>
      {/* Numéro */}
      <View style={styles.numBadge}>
        <Text style={styles.num}>{serieNumber}</Text>
      </View>

      {/* Cible */}
      <Text style={styles.target}>{targetReps}</Text>

      {/* Charge */}
      <TextInput
        style={[styles.input, isDone && styles.inputDone]}
        value={charge}
        onChangeText={onChargeChange}
        placeholder="kg"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="decimal-pad"
        editable={!isDone}
        textAlign="center"
      />

      {/* Reps */}
      <TextInput
        style={[styles.input, isDone && styles.inputDone]}
        value={reps}
        onChangeText={onRepsChange}
        placeholder="reps"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="number-pad"
        editable={!isDone}
        textAlign="center"
      />

      {/* Bouton validation */}
      <TouchableOpacity
        onPress={onValidate}
        disabled={isDone}
        style={[styles.checkBtn, isDone && styles.checkBtnDone]}
      >
        <Feather
          name={isDone ? 'check-circle' : 'circle'}
          size={24}
          color={isDone ? COLORS.green : COLORS.textMuted}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.xs,
  },
  rowDone: {
    backgroundColor: 'rgba(16,185,129,0.04)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  numBadge: {
    width: 28, height: 28, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgOverlay,
    alignItems: 'center', justifyContent: 'center',
  },
  num: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  target: { fontSize: 12, color: COLORS.textMuted, width: 36, textAlign: 'center' },
  input: {
    flex: 1, backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.sm, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary,
  },
  inputDone: { color: COLORS.textMuted, backgroundColor: COLORS.bgBase },
  checkBtn: { padding: SPACING.xs },
  checkBtnDone: {},
})
