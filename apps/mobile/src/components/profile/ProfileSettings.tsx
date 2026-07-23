/**
 * ProfileSettings — React Native
 * Design by Stitch Designer (screen fea49d9b39db46f288775b552d78572e)
 * Transpiled: React Web (Tailwind) → React Native (StyleSheet + Animated)
 *
 * Sections :
 * - Header avatar (lime border + glow + plan badge)
 * - Biométrie : poids + taille (champs éditables inset)
 * - Morpho-Anatomie : envergure, fémur, tibia (inset)
 * - Bouton Save 3D bevel (identique DailyHub CTA)
 */

import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  SafeAreaView, Pressable, Animated,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'
import type { UserProfile, BiomechanicsData } from '../../hooks/useProfile'

// ─── Tokens designer ─────────────────────────────────────────
const PRIMARY      = '#CCFF00'
const PRIMARY_DARK = '#99BF00'
const PRIMARY_20   = 'rgba(204,255,0,0.20)'
const PRIMARY_12   = 'rgba(204,255,0,0.12)'
const SURFACE      = '#1A1A24'
const SURFACE_LOW  = '#111118'
const SURFACE_LWR  = '#0A0A0F'
const ON_SURFACE   = COLORS.textPrimary
const ON_SURF_V    = COLORS.textSecondary
const WHITE_5      = 'rgba(255,255,255,0.05)'
const WHITE_10     = 'rgba(255,255,255,0.10)'

// ─── Interface ───────────────────────────────────────────────
export interface ProfileSettingsProps {
  profile:         UserProfile
  biomechanics:    BiomechanicsData
  onUpdateMetrics: (patch: Partial<BiomechanicsData>) => Promise<void>
  onUpdateAvatar:  () => Promise<void>
  onSignOut:       () => Promise<void>
  isLoading:       boolean
  isSaving:        boolean
}

// ─── Champ inset "recessed" ───────────────────────────────────
function InsetField({
  label, value, unit, onChange, keyboardType = 'numeric',
}: {
  label:    string
  value:    string
  unit?:    string
  onChange: (v: string) => void
  keyboardType?: 'numeric' | 'default'
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}{unit ? ` (${unit})` : ''}</Text>
      <View style={styles.fieldInset}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder="—"
          placeholderTextColor="rgba(152,152,168,0.4)"
          selectTextOnFocus
        />
        {unit && <Text style={styles.fieldUnit}>{unit}</Text>}
      </View>
    </View>
  )
}

// ─── Ligne morpho (lecture + édition inline) ──────────────────
function MorphoRow({
  label, value, unit, onChange,
}: { label: string; value: string; unit: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.morphoRow}>
      <Text style={styles.morphoLabel}>{label}</Text>
      <View style={styles.morphoInset}>
        <TextInput
          style={styles.morphoInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor="rgba(152,152,168,0.35)"
          selectTextOnFocus
        />
        <Text style={styles.morphoUnit}> {unit}</Text>
      </View>
    </View>
  )
}

// ─── Bouton Save 3D bevel ─────────────────────────────────────
function Save3DButton({ onPress, disabled, label }: {
  onPress: () => void; disabled: boolean; label: string
}) {
  const btnAnim = useRef(new Animated.Value(0)).current

  const onPressIn  = () =>
    Animated.spring(btnAnim, { toValue: 6, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
  const onPressOut = () =>
    Animated.spring(btnAnim, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 4 }).start()

  return (
    <View style={styles.saveOuter}>
      <View style={[styles.saveShadow, disabled && { backgroundColor: '#222' }]} />
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} disabled={disabled}>
        <Animated.View style={[
          styles.saveFront,
          disabled && { backgroundColor: SURFACE_LOW },
          { transform: [{ translateY: btnAnim }] },
        ]}>
          <Text style={[styles.saveText, disabled && { color: ON_SURF_V }]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────
export function ProfileSettings({
  profile,
  biomechanics,
  onUpdateMetrics,
  onSignOut,
  isSaving,
}: ProfileSettingsProps) {

  // États locaux éditables
  const [poids,      setPoids]      = useState(biomechanics.poids?.toString()      ?? '')
  const [taille,     setTaille]     = useState(biomechanics.taille?.toString()     ?? '')
  const [envergure,  setEnvergure]  = useState(biomechanics.envergure?.toString()  ?? '')
  const [femur,      setFemur]      = useState(biomechanics.femur?.toString()      ?? '')
  const [tibia,      setTibia]      = useState(biomechanics.tibia?.toString()      ?? '')

  const handleSave = async () => {
    await onUpdateMetrics({
      poids:      poids     ? +poids      : null,
      taille:     taille    ? +taille     : null,
      envergure:  envergure ? +envergure  : null,
      femur:      femur     ? +femur      : null,
      tibia:      tibia     ? +tibia      : null,
    })
  }

  const initiale   = (profile.prenom ?? profile.email).slice(0, 1).toUpperCase()
  const memberYear = new Date(profile.memberSince).getFullYear()
  const monthFr    = new Date(profile.memberSince)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .toUpperCase()

  const planLabel = profile.subscriptionStatus === 'premium' ? 'ELITE PROTOCOL' : 'BASIC PLAN'

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header Avatar ────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarOuter}>
            {/* Cercle lime glow */}
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarLetter}>{initiale}</Text>
              </View>
            </View>
            {/* Badge plan */}
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{planLabel}</Text>
            </View>
          </View>

          <Text style={styles.profileName}>
            {profile.prenom ?? profile.email.split('@')[0]}
          </Text>
          <Text style={styles.memberSince}>MEMBRE DEPUIS {monthFr}</Text>
        </View>

        {/* ── Section Biométrie ────────────────────────── */}
        <View style={styles.section}>
          {/* Header section */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="straighten" size={20} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Biométrie</Text>
          </View>

          <View style={styles.biometryGrid}>
            <View style={{ flex: 1 }}>
              <InsetField label="Poids" value={poids} unit="kg" onChange={setPoids} />
            </View>
            <View style={{ flex: 1 }}>
              <InsetField label="Taille" value={taille} unit="cm" onChange={setTaille} />
            </View>
          </View>
        </View>

        {/* ── Section Morpho-Anatomie ───────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="accessibility-new" size={20} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Morpho-Anatomie</Text>
          </View>

          <View style={styles.morphoList}>
            <MorphoRow label="Envergure" value={envergure} unit="cm" onChange={setEnvergure} />
            <View style={styles.morphoDivider} />
            <MorphoRow label="Fémur"     value={femur}     unit="cm" onChange={setFemur}     />
            <View style={styles.morphoDivider} />
            <MorphoRow label="Tibia"     value={tibia}     unit="cm" onChange={setTibia}     />
          </View>
        </View>

        {/* ── Bouton Déconnexion ────────────────────────── */}
        <View style={styles.signOutSection}>
          <Pressable onPress={onSignOut} style={styles.signOutBtn}>
            <MaterialIcons name="logout" size={16} color={COLORS.red} />
            <Text style={styles.signOutText}>Se déconnecter</Text>
          </Pressable>
        </View>

        {/* Espace pour le bouton fixe */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bouton Save 3D — position absolue en bas ────── */}
      <View style={styles.saveContainer}>
        <Save3DButton
          onPress={handleSave}
          disabled={isSaving}
          label={isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        />
      </View>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: SURFACE_LWR },
  container: { padding: SPACING.xl, paddingBottom: 120, gap: SPACING.xxl },

  // ── Header Avatar
  profileHeader: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  avatarOuter: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarRing: {
    width: 112, height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: PRIMARY,
    padding: 4,
    // Glow
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: SPACING.lg + 2,
  },
  avatarInner: {
    flex: 1, borderRadius: 52,
    backgroundColor: SURFACE_LOW,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 42, fontWeight: '900', color: PRIMARY },
  planBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    // shadow-lg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  planBadgeText: {
    fontSize: 9, fontWeight: '900',
    color: SURFACE_LWR,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  profileName: {
    fontSize: 28, fontWeight: '900', fontStyle: 'italic',
    color: ON_SURFACE, letterSpacing: -0.8, textTransform: 'uppercase',
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 10, fontWeight: '700', color: ON_SURF_V,
    letterSpacing: 1.5, opacity: 0.6, marginTop: 4,
  },

  // ── Section commune
  section: {
    backgroundColor: SURFACE,
    borderRadius: 40,             // rounded-[2.5rem]
    borderWidth: 1,
    borderColor: WHITE_10,
    padding: SPACING.xxl + 4,    // p-8
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.md, marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 20, fontWeight: '900', fontStyle: 'italic',
    color: ON_SURFACE, letterSpacing: -0.5, textTransform: 'uppercase',
  },

  // ── Biométrie — 2 colonnes
  biometryGrid: { flexDirection: 'row', gap: SPACING.xl },
  fieldWrapper: { gap: 6 },
  fieldLabel: {
    fontSize: 9, fontWeight: '900', color: ON_SURF_V,
    textTransform: 'uppercase', letterSpacing: 2.5,
    opacity: 0.6, paddingHorizontal: 4,
  },
  fieldInset: {
    backgroundColor: SURFACE_LOW,
    borderWidth: 1, borderColor: WHITE_5,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center',
    // bevel inset
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  fieldInput: {
    flex: 1, fontSize: 20, fontWeight: '700',
    color: PRIMARY, letterSpacing: -0.3,
  },
  fieldUnit: { fontSize: 13, color: ON_SURF_V, opacity: 0.6 },

  // ── Morpho
  morphoList: { gap: 0 },
  morphoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  morphoDivider: { height: 1, backgroundColor: WHITE_5 },
  morphoLabel: {
    fontSize: 11, fontWeight: '700', color: ON_SURF_V,
    letterSpacing: 2, textTransform: 'uppercase', opacity: 0.65,
  },
  morphoInset: {
    width: 128,
    backgroundColor: SURFACE_LOW,
    borderWidth: 1, borderColor: WHITE_5,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end',
    // bevel inset
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  morphoInput: {
    fontSize: 14, fontWeight: '900',
    color: ON_SURFACE, textAlign: 'right', flex: 1,
  },
  morphoUnit: { fontSize: 12, color: ON_SURF_V, opacity: 0.6 },

  // ── Déconnexion
  signOutSection: { alignItems: 'center' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: COLORS.red },

  // ── Bouton Save 3D
  saveContainer: {
    position: 'absolute', bottom: 24, left: SPACING.xl, right: SPACING.xl,
  },
  saveOuter: { position: 'relative' },
  saveShadow: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0, height: 56,
    backgroundColor: PRIMARY_DARK,
    borderRadius: RADIUS.xl,
  },
  saveFront: {
    paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    // Glow
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  saveText: {
    fontSize: 13, fontWeight: '900',
    color: SURFACE_LWR,
    letterSpacing: 2.5, textTransform: 'uppercase',
  },
})
