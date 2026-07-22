// 🎨 COMPOSANT : ChatBubble
// Bulle de message dans le chat Coach ↔ Adhérent

import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../constants/design'

export interface ChatBubbleProps {
  content: string
  timestamp: string     // ISO string
  isMine: boolean
  isRead?: boolean
}

export function ChatBubble({ content, timestamp, isMine, isRead = false }: ChatBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <View style={[styles.wrapper, isMine && styles.wrapperRight]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleCoach]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{content}</Text>
        <View style={styles.meta}>
          <Text style={[styles.time, isMine && styles.timeMine]}>{time}</Text>
          {isMine && (
            <Feather
              name={isRead ? 'check-circle' : 'check'}
              size={11}
              color={isRead ? COLORS.green : 'rgba(0,0,0,0.35)'}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', marginBottom: SPACING.sm },
  wrapperRight: { flexDirection: 'row-reverse' },
  bubble: {
    maxWidth: '78%', padding: SPACING.md,
    borderRadius: RADIUS.lg,
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
  text: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  textMine: { color: '#000' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-end' },
  time: { fontSize: 10, color: COLORS.textMuted },
  timeMine: { color: 'rgba(0,0,0,0.4)' },
})
