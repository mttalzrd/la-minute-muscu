/**
 * DietScreen — Onglet Diététique
 * Logique Supabase conservée intégralement.
 * Rendu délégué au composant designer NutritionDashboard.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView,
} from 'react-native'
import { NutritionDashboard } from '../src/components/diet/NutritionDashboard'
import { supabase } from '../src/lib/supabase'
import { saveTrackingOffline } from '../src/lib/offline/db'
import { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/design'

// ─── Types ────────────────────────────────────────────────────
type MacroTargets = { calories: number; proteines: number; glucides: number; lipides: number }

const REPAS_PRESETS = [
  { label: '3 repas',      repas: 3 },
  { label: '3 + 1 snack',  repas: 4 },
  { label: '5 repas',      repas: 5 },
  { label: '6 repas',      repas: 6 },
]

// ─── Écran ────────────────────────────────────────────────────
export default function DietScreen() {
  const [userId,   setUserId]   = useState<string | null>(null)
  const [targets,  setTargets]  = useState<MacroTargets>({ calories: 2500, proteines: 180, glucides: 280, lipides: 75 })
  const [current,  setCurrent]  = useState({ calories: 0, proteines: 0, glucides: 0, lipides: 0 })
  const [nbrRepas, setNbrRepas] = useState(4)
  const [calories, setCalories] = useState('')
  const today = new Date().toISOString().split('T')[0]

  // ── Chargement Supabase ──────────────────────────────────
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

  // ── Estimation macros depuis les kcal ────────────────────
  function computeFromCalories(kcal: number, t: MacroTargets) {
    const ratio = kcal / t.calories
    return {
      calories:  kcal,
      proteines: Math.round(t.proteines * ratio),
      glucides:  Math.round(t.glucides  * ratio),
      lipides:   Math.round(t.lipides   * ratio),
    }
  }

  // ── Save calories (offline-first + Supabase) ─────────────
  const saveCalories = useCallback(async () => {
    if (!userId || !calories) return
    const kcal = +calories
    setCurrent(computeFromCalories(kcal, targets))
    const id = `track-${userId}-${today}`
    await saveTrackingOffline({ id, user_id: userId, date: today, calories_consommees: kcal })
    await supabase.from('tracking_activity').upsert({ id, user_id: userId, date: today, calories_consommees: kcal })
  }, [userId, calories, targets, today])

  const kcalConsoNum = +calories || 0

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header page ──────────────────────────────── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Diététique</Text>
          <Text style={styles.pageSubtitle}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* ── Saisie rapide calories (conservée) ───────── */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardLeft}>
            <Text style={styles.inputLabel}>KCAL CONSOMMÉES</Text>
            <View style={styles.inputRow}>
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
          <View style={styles.inputCardRight}>
            <Text style={styles.remainingLabel}>Restantes</Text>
            <Text style={styles.remainingValue}>
              {Math.max(targets.calories - kcalConsoNum, 0)}
            </Text>
          </View>
        </View>

        {/* ── NutritionDashboard — Composant designer ───── */}
        {/* screen f56748548b174c9487e94036c4281e09         */}
        <NutritionDashboard
          consumedCalories={kcalConsoNum}
          totalCalories={targets.calories}
          proteinCurrent={current.proteines}
          proteinTarget={targets.proteines}
          carbCurrent={current.glucides}
          carbTarget={targets.glucides}
          fatCurrent={current.lipides}
          fatTarget={targets.lipides}
          nbrRepas={nbrRepas}
        />

        {/* ── Sélecteur nb repas (conservé sous le dashboard) */}
        <View style={styles.repasSelector}>
          <Text style={styles.sectionLabel}>RÉPARTITION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.repasTabs}>
            <View style={styles.repasTabRow}>
              {REPAS_PRESETS.map(p => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => setNbrRepas(p.repas)}
                  style={[styles.repasTab, nbrRepas === p.repas && styles.repasTabActive]}
                >
                  <Text style={[styles.repasTabText, nbrRepas === p.repas && styles.repasTabTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bgBase },
  scroll:    { flex: 1 },
  container: { padding: SPACING.xl, paddingBottom: 40, gap: SPACING.xl },

  // Header
  pageHeader: { marginBottom: SPACING.sm },
  pageTitle:  { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  // Saisie calories rapide
  inputCard: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    ...SHADOWS.gold,
  },
  inputCardLeft: { flex: 1 },
  inputLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
  },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  caloriesInput: {
    fontSize: 34, fontWeight: '700', color: COLORS.goldPrimary,
    letterSpacing: -1, minWidth: 80,
  },
  caloriesTarget: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  inputCardRight: { alignItems: 'flex-end' },
  remainingLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  remainingValue: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -1, marginTop: 2 },

  // Sélecteur repas
  repasSelector: { gap: SPACING.sm },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  repasTabs: { flexGrow: 0 },
  repasTabRow: { flexDirection: 'row', gap: SPACING.sm },
  repasTab: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full, borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgOverlay,
  },
  repasTabActive: { borderColor: COLORS.borderGold, backgroundColor: 'rgba(245,158,11,0.1)' },
  repasTabText:       { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  repasTabTextActive: { color: COLORS.goldPrimary },
})
