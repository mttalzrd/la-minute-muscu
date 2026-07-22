import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../src/lib/supabase'
import { saveTrackingOffline } from '../src/lib/offline/db'
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../src/constants/design'
import type { TrackingRow } from '@lmm/supabase'

export default function DashboardScreen() {
  const [userId, setUserId] = useState<string | null>(null)
  const [tracking, setTracking] = useState<TrackingRow | null>(null)
  const [poids, setPoids] = useState('')
  const [pas, setPas] = useState('')
  const [todaySession, setTodaySession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Charger le tracking du jour
      const { data: track } = await supabase
        .from('tracking_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      setTracking(track)
      if (track?.poids_du_jour) setPoids(String(track.poids_du_jour))
      if (track?.pas_quotidiens) setPas(String(track.pas_quotidiens))

      // Charger la séance du jour
      const dayOfWeek = new Date().getDay() || 7 // 1=Lundi, 7=Dimanche
      const { data: programs } = await supabase
        .from('programs')
        .select(`
          id, nom,
          sessions(id, nom, jour_semaine, ordre,
            session_exercises(id, exercise_id, series, repetitions, rpe, tempo, repos_secondes,
              exercise_library(nom, groupe_musculaire)
            )
          )
        `)
        .eq('adherent_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (programs?.sessions) {
        const session = (programs.sessions as any[]).find(s => s.jour_semaine === dayOfWeek)
        setTodaySession(session || null)
      }
      setLoading(false)
    }
    init()
  }, [today])

  const saveTracking = async (updates: Partial<TrackingRow>) => {
    if (!userId) return
    const id = `track-${userId}-${today}`
    const data = {
      id,
      user_id: userId,
      date: today,
      poids_du_jour: poids ? +poids : undefined,
      pas_quotidiens: pas ? +pas : undefined,
      is_workout_done: tracking?.is_workout_done ?? false,
      ...updates,
    }
    // Save offline first
    await saveTrackingOffline(data)
    // Try Supabase (online)
    await supabase.from('tracking_activity').upsert({ ...data, id: undefined })
      .eq !== undefined
      ? await supabase.from('tracking_activity').upsert(data)
      : null
    setTracking(prev => ({ ...(prev ?? {} as any), ...data }))
  }

  const today_fr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour ! 👋</Text>
            <Text style={styles.date}>{today_fr.charAt(0).toUpperCase() + today_fr.slice(1)}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* CTA Séance */}
        {todaySession ? (
          <TouchableOpacity
            onPress={() => router.push(`/workout/${todaySession.id}`)}
            style={styles.ctaWrapper}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#1A1A24', '#111118']} style={styles.ctaCard}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.ctaIconWrapper}>
                <Feather name="zap" size={24} color="#000" />
              </LinearGradient>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Séance du jour</Text>
                <Text style={styles.ctaSession}>{todaySession.nom}</Text>
                <Text style={styles.ctaExCount}>
                  {todaySession.session_exercises?.length ?? 0} exercices
                </Text>
              </View>
              <View style={styles.ctaArrow}>
                <Feather name="chevron-right" size={22} color={COLORS.goldPrimary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : !loading ? (
          <View style={styles.noSessionCard}>
            <Feather name="coffee" size={28} color={COLORS.textMuted} />
            <Text style={styles.noSessionText}>Jour de repos — Récupère bien ! 💤</Text>
          </View>
        ) : null}

        {/* Saisie rapide */}
        <View style={styles.quickInputSection}>
          <Text style={styles.sectionTitle}>Saisie rapide</Text>
          <View style={styles.quickInputGrid}>
            {/* Poids du jour */}
            <View style={styles.inputCard}>
              <LinearGradient colors={['rgba(245,158,11,0.1)', 'transparent']} style={styles.inputCardGrad}>
                <View style={styles.inputCardHeader}>
                  <Feather name="activity" size={16} color={COLORS.goldPrimary} />
                  <Text style={styles.inputCardLabel}>Poids du jour</Text>
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.quickInput}
                    value={poids}
                    onChangeText={setPoids}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textMuted}
                    onBlur={() => saveTracking({ poids_du_jour: +poids })}
                  />
                  <Text style={styles.inputUnit}>kg</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Pas quotidiens */}
            <View style={styles.inputCard}>
              <LinearGradient colors={['rgba(16,185,129,0.1)', 'transparent']} style={styles.inputCardGrad}>
                <View style={styles.inputCardHeader}>
                  <Feather name="map" size={16} color={COLORS.green} />
                  <Text style={styles.inputCardLabel}>Pas du jour</Text>
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.quickInput, { color: COLORS.green }]}
                    value={pas}
                    onChangeText={setPas}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    onBlur={() => saveTracking({ pas_quotidiens: +pas })}
                  />
                  <Text style={[styles.inputUnit, { color: COLORS.green }]}>pas</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Séance terminée ? */}
        <TouchableOpacity
          onPress={() => saveTracking({ is_workout_done: !tracking?.is_workout_done })}
          style={[styles.workoutToggle, tracking?.is_workout_done && styles.workoutToggleDone]}
          activeOpacity={0.85}
        >
          <Feather
            name={tracking?.is_workout_done ? 'check-circle' : 'circle'}
            size={20}
            color={tracking?.is_workout_done ? COLORS.green : COLORS.textMuted}
          />
          <Text style={[styles.workoutToggleText, tracking?.is_workout_done && { color: COLORS.green }]}>
            {tracking?.is_workout_done ? 'Séance effectuée ✓' : 'Marquer la séance comme terminée'}
          </Text>
        </TouchableOpacity>

        {/* Stats rapides */}
        <View style={styles.quickStatsRow}>
          {[
            { icon: 'flame', label: 'Kcal', value: tracking?.calories_consommees ? `${tracking.calories_consommees}` : '—', color: COLORS.red },
            { icon: 'trending-up', label: 'Poids', value: tracking?.poids_du_jour ? `${tracking.poids_du_jour} kg` : '—', color: COLORS.goldPrimary },
            { icon: 'map', label: 'Pas', value: tracking?.pas_quotidiens ? `${(tracking.pas_quotidiens / 1000).toFixed(1)}k` : '—', color: COLORS.green },
          ].map((stat) => (
            <View key={stat.label} style={styles.quickStat}>
              <Feather name={stat.icon as any} size={18} color={stat.color} />
              <Text style={[styles.quickStatValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  scroll: { flex: 1 },
  container: { padding: SPACING.xl, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  greeting: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  date: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  avatarBtn: {},
  avatar: {
    width: 42, height: 42, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#000' },

  ctaWrapper: { marginBottom: SPACING.xl },
  ctaCard: {
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderGold,
    ...SHADOWS.gold,
  },
  ctaIconWrapper: {
    width: 52, height: 52, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  ctaSession: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  ctaExCount: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  ctaArrow: {},

  noSessionCard: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.lg,
    padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.xl,
  },
  noSessionText: { fontSize: 15, color: COLORS.textSecondary },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary,
    marginBottom: SPACING.md, letterSpacing: -0.2,
  },

  quickInputSection: { marginBottom: SPACING.xl },
  quickInputGrid: { flexDirection: 'row', gap: SPACING.md },

  inputCard: {
    flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  inputCardGrad: { padding: SPACING.lg },
  inputCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  inputCardLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs },
  quickInput: {
    fontSize: 28, fontWeight: '700', color: COLORS.goldPrimary,
    letterSpacing: -0.5, flex: 1,
  },
  inputUnit: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },

  workoutToggle: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  workoutToggleDone: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  workoutToggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },

  quickStatsRow: {
    flexDirection: 'row', gap: SPACING.md,
  },
  quickStat: {
    flex: 1, backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.lg,
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  quickStatValue: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  quickStatLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
})
