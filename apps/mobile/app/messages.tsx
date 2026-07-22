import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/design'
import type { MessageRow } from '@lmm/supabase'

export default function MessagesScreen() {
  const [userId, setUserId] = useState<string | null>(null)
  const [coachId, setCoachId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [coachName, setCoachName] = useState('Coach')
  const listRef = useRef<FlatList>(null)

  const fetchMessages = useCallback(async () => {
    if (!userId || !coachId) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${userId})`)
      .order('timestamp', { ascending: true })
    setMessages(data ?? [])

    // Marquer les messages du coach comme lus
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', coachId)
      .eq('is_read', false)
  }, [userId, coachId])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Trouver le coach
      const { data: coach } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'coach')
        .limit(1)
        .single()

      if (coach) {
        setCoachId(coach.id)
        setCoachName(coach.email.split('@')[0])
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!userId || !coachId) return
    fetchMessages()

    // Realtime
    const channel = supabase
      .channel('mobile-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, coachId, fetchMessages])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200)
    }
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !coachId) return
    setSending(true)
    await supabase.from('messages').insert([{
      sender_id: userId,
      receiver_id: coachId,
      content: newMessage.trim(),
    }])
    setNewMessage('')
    setSending(false)
  }

  const renderMessage = ({ item }: { item: MessageRow }) => {
    const isMine = item.sender_id === userId
    const time = new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    return (
      <View style={[styles.msgWrapper, isMine && styles.msgWrapperRight]}>
        {!isMine && (
          <View style={styles.coachAvatar}>
            <Text style={styles.coachAvatarText}>{coachName.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleCoach]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.content}</Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>{time}</Text>
            {isMine && (
              <Feather
                name={item.is_read ? 'check-circle' : 'check'}
                size={11}
                color={item.is_read ? COLORS.green : 'rgba(0,0,0,0.3)'}
              />
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coachInfo}>
          <View style={styles.coachAvatarLarge}>
            <Text style={styles.coachAvatarLargeText}>{coachName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.coachNameText}>{coachName}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Coach · En ligne</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>🏋️</Text>
            <Text style={styles.emptyTitle}>Parlez avec votre coach !</Text>
            <Text style={styles.emptySubtitle}>Questions sur vos exercices, feedbacks de séance — votre coach est là.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Votre message..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !newMessage.trim()}
            style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
          >
            <Feather name="send" size={18} color={newMessage.trim() ? '#000' : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },

  header: {
    padding: SPACING.xl, paddingBottom: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  coachInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  coachAvatar: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  coachAvatarText: { fontSize: 13, fontWeight: '700', color: COLORS.goldPrimary },
  coachAvatarLarge: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1, borderColor: COLORS.borderGold,
    alignItems: 'center', justifyContent: 'center',
  },
  coachAvatarLargeText: { fontSize: 18, fontWeight: '700', color: COLORS.goldPrimary },
  coachNameText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  onlineText: { fontSize: 12, color: COLORS.green, fontWeight: '500' },

  messagesList: { padding: SPACING.lg, gap: SPACING.md },

  msgWrapper: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end' },
  msgWrapperRight: { flexDirection: 'row-reverse' },

  bubble: {
    maxWidth: '78%', padding: SPACING.md, borderRadius: RADIUS.lg,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: COLORS.goldPrimary,
    borderBottomRightRadius: RADIUS.sm,
  },
  bubbleCoach: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    borderBottomLeftRadius: RADIUS.sm,
  },
  bubbleText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  bubbleTextMine: { color: '#000' },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  bubbleTime: { fontSize: 10, color: COLORS.textMuted },
  bubbleTimeMine: { color: 'rgba(0,0,0,0.4)' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl, gap: SPACING.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  inputWrapper: {
    flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.borderSubtle,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1, backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: SPACING.md, paddingTop: SPACING.md,
    fontSize: 14, color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.goldPrimary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.gold,
  },
  sendBtnDisabled: { backgroundColor: COLORS.bgOverlay },
})
