import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { saveTrackingOffline } from '../../src/lib/offline/db'
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../../src/constants/design'

type MacroTargets = { calories: number; proteines: number; glucides: number; lipides: number }

const REPAS_PRESETS = [
  { label: '3 repas', repas: 3 },
  { label: '3 + 1 collation', repas: 4 },
  { label: '5 repas', repas: 5 },
  { label: '6 repas', repas: 6 },
]

function CircularProgress({ value, max, size, color, label }: { value: number; max: number; size: number; color: string; label: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: size, height: size }}>
        <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}20` }} />
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color }}>{Math.round(percentage)}%</Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 11, color: COLORS.textMuted }}>{value}g / {max}g</Text>
    </View>
  )
}

export default function DietScreen() {
  const [userId, setUserId] = useState<string | null>(null)
  const [targets, setTargets] = useState<MacroTargets>({ calories: 2500, proteines: 180, glucides: 280, lipides: 75 })
  const [current, setCurrent] = useState({ calories: 0, proteines: 0, glucides: 0, lipides: 0 })
  const [nbrRepas, setNbrRepas] = useState(4)
  const [calories, setCalories] = useState('')
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('tracking_activity')
        .select('calories_consommees')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data?.calories_consommees) {
        setCalories(String(data.calories_consommees))
        setCurrent(computeFromCalories(data.calories_consommees, targets))
      }
    }
    init()
  }, [today])

  function computeFromCalories(kcal: number, t: MacroTargets) {
    const ratio = kcal / t.calories
    return {
      calories: kcal,
      proteines: Math.round(t.proteines * ratio),
      glucides: Math.round(t.glucides * ratio),
      lipides: Math.round(t.lipides * ratio),
    }
  }

  const saveCalories = useCallback(async () => {
    if (!userId || !calories) return
    const kcal = +calories
    setCurrent(computeFromCalories(kcal, targets))

    const id = `track-${userId}-${today}`
    await saveTrackingOffline({ id, user_id: userId, date: today, calories_consommees: kcal })
    await supabase.from('tracking_activity').upsert({ id, user_id: userId, date: today, calories_consommees: kcal })
  }, [userId, calories, targets, today])

  const perRepas = (value: number) => (value / nbrRepas).toFixed(0)

  const macros = [
    { label: 'Protéines', key: 'proteines' as const, color: COLORS.blue, unit: 'g', kcalPerG: 4 },
    { label: 'Glucides', key: 'glucides' as const, color: COLORS.goldPrimary, unit: 'g', kcalPerG: 4 },
    { label: 'Lipides', key: 'lipides' as const, color: COLORS.green, unit: 'g', kcalPerG: 9 },
  ]

  const caloriesRatio = Math.min((+calories / targets.calories) * 100, 100)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Diététique</Text>
          <Text style={styles.pageSubtitle}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        {/* Calories principale */}
        <LinearGradient colors={['#1A1A24', '#111118']} style={styles.caloriesCard}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.caloriesIconBg}>
            <Feather name="flame" size={20} color="#000" />
          </LinearGradient>
          <View style={styles.caloriesInfo}>
            <Text style={styles.caloriesLabel}>Kcal consommées</Text>
            <View style={styles.caloriesRow}>
              <TextInput
                style={styles.caloriesInput}
                value={calories}
                onChangeText={setCalories}
                onBlur={saveCalories}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.caloriesTarget}>/ {targets.calories} kcal</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Barre progression calories */}
        <View style={styles.caloriesBar}>
          <View style={[styles.caloriesBarFill, { width: `${caloriesRatio}%` }]} />
        </View>
        <Text style={styles.caloriesBarLabel}>
          {caloriesRatio >= 100 ? '⚡ Objectif atteint !' : `${(targets.calories - +calories).toFixed(0)} kcal restantes`}
        </Text>

        {/* Macros circulaires */}
        <View style={styles.macrosCard}>
          <Text style={styles.sectionTitle}>Macronutriments</Text>
          <View style={styles.macrosRow}>
            {macros.map(m => (
              <CircularProgress
                key={m.key}
                value={current[m.key]}
                max={targets[m.key]}
                size={96}
                color={m.color}
                label={m.label}
              />
            ))}
          </View>

          {/* Détails */}
          <View style={styles.macroDetails}>
            {macros.map(m => (
              <View key={m.key} style={styles.macroDetailRow}>
                <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                <Text style={styles.macroDetailLabel}>{m.label}</Text>
                <Text style={styles.macroDetailValue}>{current[m.key]}g</Text>
                <Text style={styles.macroDetailTarget}>/ {targets[m.key]}g</Text>
                <Text style={styles.macroDetailKcal}>({current[m.key] * m.kcalPerG} kcal)</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Répartition par repas */}
        <View style={styles.repasCard}>
          <Text style={styles.sectionTitle}>Répartition par repas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {REPAS_PRESETS.map(p => (
                <TouchableOpacity key={p.label} onPress={() => setNbrRepas(p.repas)}
                  style={[styles.repasTab, nbrRepas === p.repas && styles.repasTabActive]}>
                  <Text style={[styles.repasTabText, nbrRepas === p.repas && styles.repasTabTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {Array.from({ length: nbrRepas }).map((_, i) => {
            const isCollation = nbrRepas === 4 && i === 2
            return (
              <View key={i} style={styles.repasRow}>
                <View style={styles.repasNumBadge}>
                  <Text style={styles.repasNumText}>{isCollation ? '🍎' : `R${i + 1}`}</Text>
                </View>
                <View style={styles.repasContent}>
                  <Text style={styles.repasLabel}>{isCollation ? 'Collation' : `Repas ${i + 1}`}</Text>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: 4 }}>
                    <Text style={[styles.repasValue, { color: COLORS.red }]}>{perRepas(targets.calories)} kcal</Text>
                    <Text style={[styles.repasValue, { color: COLORS.blue }]}>{perRepas(targets.proteines)}g P</Text>
                    <Text style={[styles.repasValue, { color: COLORS.goldPrimary }]}>{perRepas(targets.glucides)}g G</Text>
                    <Text style={[styles.repasValue, { color: COLORS.green }]}>{perRepas(targets.lipides)}g L</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  scroll: { flex: 1 },
  container: { padding: SPACING.xl, paddingBottom: 40 },

  pageHeader: { marginBottom: SPACING.xl },
  pageTitle: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  caloriesCard: {
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderGold,
    marginBottom: SPACING.md,
    ...SHADOWS.gold,
  },
  caloriesIconBg: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  caloriesInfo: { flex: 1 },
  caloriesLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  caloriesRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  caloriesInput: { fontSize: 36, fontWeight: '700', color: COLORS.goldPrimary, letterSpacing: -1, minWidth: 80 },
  caloriesTarget: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },

  caloriesBar: { height: 6, backgroundColor: COLORS.bgOverlay, borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  caloriesBarFill: { height: '100%', backgroundColor: COLORS.goldPrimary, borderRadius: 3 },
  caloriesBarLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'right' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.lg },

  macrosCard: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.xl, marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.xl },

  macroDetails: { gap: SPACING.sm },
  macroDetailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  macroDot: { width: 8, height: 8, borderRadius: 4 },
  macroDetailLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  macroDetailValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  macroDetailTarget: { fontSize: 12, color: COLORS.textMuted },
  macroDetailKcal: { fontSize: 11, color: COLORS.textMuted },

  repasCard: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.xl, marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  repasTab: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgOverlay,
  },
  repasTabActive: { borderColor: COLORS.borderGold, backgroundColor: 'rgba(245,158,11,0.1)' },
  repasTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  repasTabTextActive: { color: COLORS.goldPrimary },

  repasRow: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center', marginBottom: SPACING.md },
  repasNumBadge: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgOverlay, borderWidth: 1, borderColor: COLORS.borderSubtle,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  repasNumText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  repasContent: { flex: 1 },
  repasLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  repasValue: { fontSize: 12, fontWeight: '600' },
})
