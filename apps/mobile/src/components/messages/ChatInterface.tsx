/**
 * ChatInterface — React Native
 * Design by Stitch Designer (screen 52f6ba7287b640dcb138fe7d30b402dc)
 * Transpiled: React Web (Tailwind) → React Native (StyleSheet + Animated)
 *
 * Features :
 * - Bulle coach : lime #CCFF00 fond sombre, coin tl plat
 * - Bulle user  : dark surface, coin tr plat, texte clair
 * - Header coach avec online dot lime + badge "COACH" vérifié
 * - Input bevel inset + bouton send 3D (#99BF00 shadow)
 * - Auto-scroll to last message
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Pressable, Animated,
  KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'
import type { ChatMessage, RealtimeStatus } from '../../hooks/useMessages'

// ─── Tokens designer ─────────────────────────────────────────
const PRIMARY      = '#CCFF00'
const PRIMARY_DARK = '#99BF00'
const PRIMARY_30   = 'rgba(204,255,0,0.30)'
const SURFACE      = '#1A1A24'
const SURFACE_LOW  = '#111118'
const SURFACE_LWR  = '#0A0A0F'
const ON_SURFACE   = COLORS.textPrimary
const ON_SURF_V    = COLORS.textSecondary
const WHITE_5      = 'rgba(255,255,255,0.05)'
const WHITE_10     = 'rgba(255,255,255,0.10)'

// ─── Interface ───────────────────────────────────────────────
export interface ChatInterfaceProps {
  messages:       ChatMessage[]
  coachName:      string
  coachAvatarUrl: string | null
  currentUserId:  string
  realtimeStatus: RealtimeStatus
  onSendMessage:  (text: string) => Promise<void>
  isLoading:      boolean
  isSending:      boolean
}

// ─── Bulle de message ─────────────────────────────────────────
function MessageBubble({
  msg, isMe,
}: { msg: ChatMessage; isMe: boolean }) {
  const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <View style={[styles.msgWrapper, isMe && styles.msgWrapperRight]}>
      <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>

        {/* Badge COACH + heure */}
        <View style={[styles.msgMeta, isMe && styles.msgMetaRight]}>
          {!isMe && (
            <View style={styles.coachBadge}>
              <MaterialIcons name="verified" size={10} color={PRIMARY} />
              <Text style={styles.coachBadgeText}>COACH</Text>
            </View>
          )}
          <Text style={styles.msgTime}>{time}</Text>
          {isMe && (
            <MaterialIcons
              name={msg.isRead ? 'done-all' : 'done'}
              size={12}
              color={msg.isRead ? PRIMARY : 'rgba(255,255,255,0.3)'}
            />
          )}
        </View>

        {/* Bulle */}
        <View style={[
          styles.bubble,
          isMe ? styles.bubbleUser : styles.bubbleCoach,
        ]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextUser]}>
            {msg.text}
          </Text>
        </View>
      </View>
    </View>
  )
}

// ─── Bouton Send 3D bevel ─────────────────────────────────────
function SendButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  const btnAnim = useRef(new Animated.Value(0)).current

  const onPressIn = () =>
    Animated.spring(btnAnim, { toValue: 4, useNativeDriver: true, speed: 60, bounciness: 0 }).start()
  const onPressOut = () =>
    Animated.spring(btnAnim, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 4 }).start()

  return (
    <View style={styles.sendOuter}>
      <View style={[styles.sendShadow, disabled && styles.sendShadowDisabled]} />
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} disabled={disabled}>
        <Animated.View style={[
          styles.sendFront,
          disabled && styles.sendFrontDisabled,
          { transform: [{ translateY: btnAnim }] },
        ]}>
          <MaterialIcons name="send" size={20} color={disabled ? ON_SURF_V : SURFACE_LWR} />
        </Animated.View>
      </Pressable>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────
export function ChatInterface({
  messages,
  coachName,
  currentUserId,
  realtimeStatus,
  onSendMessage,
  isSending,
}: ChatInterfaceProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<FlatList>(null)

  // Auto-scroll au dernier message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = draft.trim()
    if (!text || isSending) return
    setDraft('')
    await onSendMessage(text)
  }, [draft, isSending, onSendMessage])

  const initiale = coachName.slice(0, 1).toUpperCase()

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >

        {/* ── Header ───────────────────────────────────── */}
        <View style={styles.header}>
          {/* Avatar coach avec online dot */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initiale}</Text>
            </View>
            {/* Online dot */}
            <View style={[
              styles.onlineDot,
              { backgroundColor: realtimeStatus === 'connected' ? PRIMARY : ON_SURF_V },
            ]} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{coachName.toUpperCase()}</Text>
            <Text style={styles.headerRole}>PROTOCOL SPECIALIST</Text>
          </View>

          {/* Badge statut Realtime */}
          <View style={[
            styles.realtimeBadge,
            { borderColor: realtimeStatus === 'connected' ? PRIMARY : ON_SURF_V },
          ]}>
            <View style={[
              styles.realtimeDot,
              { backgroundColor: realtimeStatus === 'connected' ? PRIMARY :
                realtimeStatus === 'error' ? COLORS.red : ON_SURF_V },
            ]} />
          </View>
        </View>

        {/* ── Liste messages ───────────────────────────── */}
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>Parlez avec votre coach !</Text>
            <Text style={styles.emptyText}>
              Questions, feedbacks de séance — votre coach est disponible.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => (
              <MessageBubble
                msg={item}
                isMe={item.sender === 'user'}
              />
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* ── Zone de saisie — bevel inset ────────────── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Tape ton message..."
              placeholderTextColor="rgba(152,152,168,0.45)"
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
            />
          </View>
          <SendButton onPress={handleSend} disabled={!draft.trim() || isSending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SURFACE_LWR },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: WHITE_10,
    backgroundColor: `${SURFACE}CC`,      // backdrop-blur approximé via opacity
  },
  avatarWrapper: { position: 'relative' },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: SURFACE_LOW,
    // Glow
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: PRIMARY },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: SURFACE_LWR,
  },
  headerName: {
    fontSize: 18, fontWeight: '900', fontStyle: 'italic',
    color: ON_SURFACE, letterSpacing: -0.5, textTransform: 'uppercase',
  },
  headerRole: {
    fontSize: 9, fontWeight: '700', color: PRIMARY,
    letterSpacing: 3, textTransform: 'uppercase', marginTop: 2,
  },
  realtimeBadge: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  realtimeDot: { width: 8, height: 8, borderRadius: 4 },

  // ── Messages
  messageList: { padding: SPACING.xl, gap: SPACING.xl },

  msgWrapper: { flexDirection: 'row', alignItems: 'flex-end' },
  msgWrapperRight: { justifyContent: 'flex-end' },

  msgMeta: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, marginBottom: 4, paddingHorizontal: 6,
  },
  msgMetaRight: { justifyContent: 'flex-end' },
  coachBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  coachBadgeText: {
    fontSize: 8, fontWeight: '900', color: PRIMARY,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  msgTime: {
    fontSize: 8, fontWeight: '700', color: ON_SURF_V,
    textTransform: 'uppercase', opacity: 0.45,
  },

  // Bulle coach — lime + texte sombre + coin tl plat
  bubble: {
    maxWidth: '85%',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  bubbleCoach: {
    backgroundColor: PRIMARY,
    borderTopLeftRadius: 4,       // rounded-tl-none approximé
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // Bulle user — dark + coin tr plat
  bubbleUser: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: WHITE_5,
    borderTopRightRadius: 4,      // rounded-tr-none approximé
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  bubbleText: {
    fontSize: 14,
    color: SURFACE_LWR,           // texte sombre sur fond lime
    lineHeight: 21,
    fontWeight: '600',
  },
  bubbleTextUser: {
    color: ON_SURFACE,            // texte clair sur bulle sombre
    fontWeight: '400',
  },

  // ── Zone de saisie
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
    padding: SPACING.xl,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: WHITE_10,
    // shadow-[0_-10px_30px_rgba(0,0,0,0.5)]
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  inputWrapper: { flex: 1 },
  input: {
    backgroundColor: SURFACE_LOW,
    borderWidth: 1,
    borderColor: WHITE_5,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    fontSize: 14,
    color: ON_SURFACE,
    maxHeight: 120,
    // bevel inset
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Bouton Send 3D
  sendOuter: { position: 'relative' },
  sendShadow: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0, height: 48,
    backgroundColor: PRIMARY_DARK,
    borderRadius: RADIUS.xl,
  },
  sendShadowDisabled: { backgroundColor: '#333' },
  sendFront: {
    width: 52, height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendFrontDisabled: { backgroundColor: SURFACE_LOW },

  // ── État vide
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xxxl, gap: SPACING.lg,
  },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: ON_SURFACE, textAlign: 'center' },
  emptyText:  { fontSize: 14, color: ON_SURF_V, textAlign: 'center', lineHeight: 22 },
})
