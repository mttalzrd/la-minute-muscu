'use client'
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../src/lib/supabase'
import { router } from 'expo-router'
import { COLORS, SPACING, RADIUS, GRADIENTS } from '../../src/constants/design'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Email ou mot de passe incorrect')
    } else {
      router.replace('/')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🏋️</Text>
          </LinearGradient>
          <Text style={styles.appName}>La Minute Muscu</Text>
          <Text style={styles.tagline}>Votre espace entraînement</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENTS.gold} style={[styles.loginBtn, { opacity: loading ? 0.7 : 1 }]}>
              <Text style={styles.loginBtnText}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  container: { flex: 1, justifyContent: 'center', padding: SPACING.xl },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoIcon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  form: { gap: SPACING.lg },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: SPACING.md,
  },
  errorText: { color: '#EF4444', fontSize: 14 },
  inputGroup: { gap: SPACING.xs },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  input: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.lg, fontSize: 15, color: COLORS.textPrimary,
  },
  loginBtn: { borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginTop: SPACING.sm },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#000', letterSpacing: 0.3 },
})
