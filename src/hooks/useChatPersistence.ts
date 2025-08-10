import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage } from './use-realtime-chat'

interface UseChatPersistenceProps {
  roomName: string
  enabled?: boolean
}

export interface PersistedChatMessage {
  id: string
  room_name: string
  sender_id: string
  sender_name: string
  sender_role: 'student' | 'teacher' | 'admin'
  content: string
  sequence_number: number
  created_at: string
}

export function useChatPersistence({ roomName, enabled = true }: UseChatPersistenceProps) {
  const supabase = createClient()
  const [persistedMessages, setPersistedMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !roomName) return

    const loadMessages = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .rpc('get_chat_messages', {
            room_name_param: roomName,
            limit_param: 50
          })

        if (error) {
          setError(error.message)
          return
        }

        const chatMessages: ChatMessage[] = (data || []).map((msg: PersistedChatMessage) => ({
          id: msg.id,
          content: msg.content,
          user: {
            id: msg.sender_id,
            name: msg.sender_name,
            role: msg.sender_role,
          },
          createdAt: msg.created_at,
          sequenceNumber: msg.sequence_number,
          roomName: msg.room_name,
        }))

        setPersistedMessages(chatMessages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [roomName, enabled, supabase])

  const saveMessage = useCallback(async (message: ChatMessage) => {
    if (!enabled) return
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          room_name: message.roomName,
          sender_id: message.user.id,
          sender_role: message.user.role,
          content: message.content,
          sequence_number: message.sequenceNumber,
        })
      if (error) throw error
    } catch (_err) {
      // swallow, non-blocking
    }
  }, [enabled, supabase])

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!enabled) return
    await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)
  }, [enabled, supabase])

  return {
    persistedMessages,
    loading,
    error,
    saveMessage,
    deleteMessage,
  }
}






