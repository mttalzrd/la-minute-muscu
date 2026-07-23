/**
 * useMessages — Hook Supabase Realtime
 * Messagerie temps réel adhérent ↔ coach
 * Version enrichie : types stricts, isSending, realtimeStatus
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types exportés (utilisés par ChatInterface.tsx) ─────────
export type RealtimeStatus = 'connecting' | 'connected' | 'error'

export interface ChatMessage {
  id:        string
  sender:    'coach' | 'user'
  text:      string
  timestamp: string
  avatarUrl: string | null
  isRead:    boolean
}

// ─── Hook ────────────────────────────────────────────────────
export function useMessages() {
  const [userId,         setUserId]         = useState<string | null>(null)
  const [coachId,        setCoachId]        = useState<string | null>(null)
  const [coachName,      setCoachName]      = useState('Coach')
  const [messages,       setMessages]       = useState<ChatMessage[]>([])
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')
  const [isLoading,      setIsLoading]      = useState(true)
  const [isSending,      setIsSending]      = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ── Fetch messages + marquage lu ─────────────────────────
  const fetchMessages = useCallback(async (uid: string, cid: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${cid}),` +
        `and(sender_id.eq.${cid},receiver_id.eq.${uid})`
      )
      .order('timestamp', { ascending: true })

    if (!error && data) {
      const mapped: ChatMessage[] = data.map(m => ({
        id:        m.id,
        sender:    m.sender_id === uid ? 'user' : 'coach',
        text:      m.content,
        timestamp: m.timestamp ?? m.created_at,
        avatarUrl: null,    // Futur : join profiles_adherents.avatar_url
        isRead:    m.is_read ?? false,
      }))
      setMessages(mapped)

      // Marquer les messages du coach reçus comme lus
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', uid)
        .eq('sender_id', cid)
        .eq('is_read', false)
    }
  }, [])

  // ── Init : userId + coachId ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: coach } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'coach')
        .limit(1)
        .single()

      if (coach) {
        setCoachId(coach.id)
        setCoachName(coach.email.split('@')[0])
        await fetchMessages(user.id, coach.id)
      }
      setIsLoading(false)
    }
    init()
  }, [fetchMessages])

  // ── Supabase Realtime ────────────────────────────────────
  useEffect(() => {
    if (!userId || !coachId) return

    const channel = supabase
      .channel(`chat:${userId}:${coachId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchMessages(userId, coachId)
      )
      .subscribe((status) => {
        setRealtimeStatus(
          status === 'SUBSCRIBED'    ? 'connected'  :
          status === 'CHANNEL_ERROR' ? 'error'      :
          'connecting'
        )
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [userId, coachId, fetchMessages])

  // ── Envoi message ────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !userId || !coachId) return
    setIsSending(true)
    await supabase
      .from('messages')
      .insert([{
        sender_id:   userId,
        receiver_id: coachId,
        content:     text.trim(),
      }])
    setIsSending(false)
  }, [userId, coachId])

  return {
    messages,
    coachName,
    currentUserId: userId ?? '',
    realtimeStatus,
    isLoading,
    isSending,
    sendMessage,
  }
}
