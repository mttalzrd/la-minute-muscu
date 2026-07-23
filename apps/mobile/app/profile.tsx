/**
 * ProfileScreen — Onglet Profil Adhérent
 * Données Supabase via useProfile (users + profiles_adherents JSONB).
 * Rendu délégué au composant designer ProfileSettings.
 */
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { ProfileSettings } from '../src/components/profile/ProfileSettings'
import { useProfile }       from '../src/hooks/useProfile'
import { COLORS }           from '../src/constants/design'

export default function ProfileScreen() {
  const {
    profile,
    biomechanics,
    isLoading,
    isSaving,
    updateMetrics,
    signOut,
  } = useProfile()

  // ── Loading skeleton ─────────────────────────────────────
  if (isLoading || !profile || !biomechanics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CCFF00" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    )
  }

  return (
    <ProfileSettings
      profile={profile}
      biomechanics={biomechanics}
      onUpdateMetrics={updateMetrics}
      onUpdateAvatar={async () => { /* TODO : picker image + upload Storage V2 */ }}
      onSignOut={signOut}
      isLoading={isLoading}
      isSaving={isSaving}
    />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
})
