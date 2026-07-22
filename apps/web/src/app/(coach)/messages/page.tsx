'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Check, CheckCheck } from 'lucide-react'
import type { UserRow, MessageRow } from '@lmm/supabase'

export default function MessagesPage() {
  const [adherents, setAdherents] = useState<UserRow[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
      const { data } = await supabase.from('users').select('*').eq('role', 'adherent')
      setAdherents(data ?? [])
    }
    init()
  }, [supabase])

  const fetchMessages = useCallback(async () => {
    if (!selectedUser || !currentUserId) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${currentUserId})`)
      .order('timestamp', { ascending: true })
    setMessages(data ?? [])

    // Marquer comme lus
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', selectedUser)
      .eq('is_read', false)
  }, [supabase, selectedUser, currentUserId])

  useEffect(() => {
    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId) return
    setSending(true)
    await supabase.from('messages').insert([{
      sender_id: currentUserId,
      receiver_id: selectedUser,
      content: newMessage.trim(),
    }])
    setNewMessage('')
    setSending(false)
  }

  const selectedAdherent = adherents.find(a => a.id === selectedUser)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messagerie</h1>
          <p className="page-subtitle">Chat direct avec vos adhérents</p>
        </div>
      </div>

      <div className="card" style={{ height: 'calc(100vh - 200px)', display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar conversations */}
        <div style={{ width: '280px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Conversations
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {adherents.map(adherent => {
              const colors = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']
              const color = colors[adherent.email.charCodeAt(0) % colors.length]
              return (
                <button key={adherent.id}
                  onClick={() => setSelectedUser(adherent.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '10px',
                    border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                    background: selectedUser === adherent.id ? 'rgba(245,158,11,0.08)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                  onMouseEnter={e => { if (selectedUser !== adherent.id) (e.currentTarget.style.background = 'var(--bg-elevated)') }}
                  onMouseLeave={e => { if (selectedUser !== adherent.id) (e.currentTarget.style.background = 'transparent') }}
                >
                  <div className="avatar-fallback" style={{ width: '36px', height: '36px', fontSize: '14px', background: `${color}20`, borderColor: `${color}30`, color, flexShrink: 0 }}>
                    {adherent.email.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: selectedUser === adherent.id ? 'var(--gold-primary)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {adherent.email.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Adhérent</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Zone chat */}
        {!selectedUser ? (
          <div className="empty-state" style={{ flex: 1 }}>
            <div style={{ fontSize: '48px' }}>💬</div>
            <h3>Sélectionnez un adhérent</h3>
            <p style={{ fontSize: '14px' }}>Choisissez une conversation dans la liste à gauche</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Chat header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar-fallback" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                {selectedAdherent?.email.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-heading)' }}>
                  {selectedAdherent?.email.split('@')[0]}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                  En ligne
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 && (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div style={{ fontSize: '40px' }}>🏋️</div>
                  <p style={{ fontSize: '14px' }}>Démarrez la conversation !</p>
                </div>
              )}
              {messages.map(msg => {
                const isSent = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${isSent ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {isSent && (msg.is_read ? <CheckCheck size={12} color="var(--accent-green)" /> : <Check size={12} />)}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
