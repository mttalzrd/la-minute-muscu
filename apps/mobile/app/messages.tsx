/**
 * MessagesScreen — Onglet Messages
 * Logique Supabase Realtime conservée intégralement via useMessages.
 * Rendu délégué au composant designer ChatInterface.
 */
import { ChatInterface } from '../src/components/messages/ChatInterface'
import { useMessages }   from '../src/hooks/useMessages'

export default function MessagesScreen() {
  const {
    messages,
    coachName,
    currentUserId,
    realtimeStatus,
    isLoading,
    isSending,
    sendMessage,
  } = useMessages()

  return (
    <ChatInterface
      messages={messages}
      coachName={coachName}
      coachAvatarUrl={null}
      currentUserId={currentUserId}
      realtimeStatus={realtimeStatus}
      onSendMessage={sendMessage}
      isLoading={isLoading}
      isSending={isSending}
    />
  )
}
