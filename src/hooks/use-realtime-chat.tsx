'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import { useChatPersistence } from './useChatPersistence'

interface UseRealtimeChatProps {
  roomName: string
  userData: {
    id: string
    name: string
    role: 'student' | 'teacher' | 'admin'
  }
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    name: string
    role: 'student' | 'teacher' | 'admin'
  }
  createdAt: string
  sequenceNumber: number
  roomName: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, userData }: UseRealtimeChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})

  const { 
    persistedMessages, 
    loading: loadingPersisted, 
    error: persistenceError,
    saveMessage 
  } = useChatPersistence({ 
    roomName, 
    enabled: true 
  })

  useEffect(() => {
    if (channel) {
      supabase.removeChannel(channel)
      setMessages([])
      setIsConnected(false)
      setChannel(null)
    }

    const newChannel = supabase.channel(roomName, {
      config: {
        private: true,
        broadcast: { self: true },
        presence: {
          key: userData.id,
        }
      }
    })

    const setupChannel = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (token) {
          await supabase.realtime.setAuth(token)
        }
        supabase.auth.onAuthStateChange((_event, session) => {
          const t = session?.access_token
          if (t) void supabase.realtime.setAuth(t)
        })
        newChannel
          .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
            const message = payload.payload as ChatMessage
            if (message.roomName === roomName) {
              setMessages((current) => {
                const exists = current.some(m => 
                  m.id === message.id || 
                  (m.user.id === message.user.id && m.sequenceNumber === message.sequenceNumber)
                )
                if (exists) return current

                saveMessage(message).catch(() => {})
                const updated = [...current, message].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                return updated
              })
            }
          })
          .on('presence', { event: 'sync' }, () => {
            const presenceState = newChannel.presenceState()
            setOnlineUsers(presenceState)
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            setOnlineUsers((current) => ({
              ...current,
              [key]: newPresences
            }))
          })
          .on('presence', { event: 'leave' }, ({ key }) => {
            setOnlineUsers((current) => {
              const updated = { ...current }
              delete updated[key]
              return updated
            })
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              await newChannel.track({
                user: userData,
                online_at: new Date().toISOString(),
              })
            } else {
              setIsConnected(false)
            }
          })
      } catch (_error) {
        setIsConnected(false)
      }
    }

    setupChannel()
    setChannel(newChannel)

    return () => {
      if (newChannel) {
        try {
          // Removing explicit untrack avoids pushing presence before join
          supabase.removeChannel(newChannel)
        } catch {}
      }
      setChannel(null)
    }
  }, [roomName, supabase, userData.id])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          id: userData.id,
          name: userData.name,
          role: userData.role,
        },
        createdAt: new Date().toISOString(),
        sequenceNumber: Date.now(),
        roomName: roomName,
      }

      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })
    },
    [channel, isConnected, userData, roomName]
  )

  const allMessages = [...persistedMessages, ...messages].filter(
    (message, index, self) => index === self.findIndex((m) => 
      m.id === message.id || 
      (m.user.id === message.user.id && m.sequenceNumber === message.sequenceNumber)
    )
  ).sort((a, b) => a.sequenceNumber - b.sequenceNumber)

  return { 
    messages: allMessages, 
    sendMessage, 
    isConnected, 
    onlineUsers,
    channel,
    loadingPersisted,
    persistenceError
  }
}


