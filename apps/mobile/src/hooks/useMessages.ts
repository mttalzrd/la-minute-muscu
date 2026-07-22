// Hook : useMessages
// Messagerie temps réel adhérent ↔ coach
// Realtime Supabase + marquage lu

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages() {
  const [userId, setUserId] = useState<string | null>(null)
  const [coachId, setCoachId] = useState<string | null>(null)
  const [coachEmail, setCoachEmail] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    if (!userId || !coachId) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${userId})`)
      .order('timestamp', { ascending: true })
    setMessages(data ?? [])
    // Marquer lus
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

      const { data: coach } = await supabase
        .from('users').select('id, email').eq('role', 'coach').limit(1).single()
      if (coach) { setCoachId(coach.id); setCoachEmail(coach.email) }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!userId || !coachId) return
    fetchMessages()
    const channel = supabase.channel('mobile-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchMessages)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, coachId, fetchMessages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !userId || !coachId) return
    await supabase.from('messages').insert([{ sender_id: userId, receiver_id: coachId, content: content.trim() }])
  }, [userId, coachId])

  return { messages, loading, sendMessage, coachEmail, userId }
}
