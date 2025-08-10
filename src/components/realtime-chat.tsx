import { cn } from '@/lib/utils'
import { ChatMessageItem } from '@/components/chat-message'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import {
  type ChatMessage,
  useRealtimeChat,
} from '@/hooks/use-realtime-chat'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface RealtimeChatProps {
  roomName: string
  userData: {
    id: string
    name: string
    role: 'student' | 'teacher' | 'admin'
  }
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
}

export function RealtimeChat({
  roomName,
  userData,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) {
  const { containerRef, scrollToBottom } = useChatScroll()
  const isMobile = useIsMobile()

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    onlineUsers,
    loadingPersisted,
    persistenceError,
  } = useRealtimeChat({
    roomName,
    userData,
  })
  const [newMessage, setNewMessage] = useState('')

  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) => index === self.findIndex((m) => 
        m.id === message.id || 
        (m.user.id === message.user.id && m.sequenceNumber === message.sequenceNumber)
      )
    )
    const sortedMessages = uniqueMessages.sort((a, b) => {
      if (a.sequenceNumber && b.sequenceNumber) {
        return a.sequenceNumber - b.sequenceNumber
      }
      return a.createdAt.localeCompare(b.createdAt)
    })

    return sortedMessages
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    if (onMessage) {
      onMessage(allMessages)
    }
  }, [allMessages, onMessage])

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected) return

      sendMessage(newMessage)
      setNewMessage('')
    },
    [newMessage, isConnected, sendMessage]
  )

  const onlineUsersCount = Object.keys(onlineUsers).length;
  const isOtherUserOnline = onlineUsersCount > 1; // Shows if another user is present

  return (
    <div className={`flex flex-col h-full w-full bg-background text-foreground antialiased ${isMobile ? 'rounded-none' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOtherUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-muted-foreground">
            {isOtherUserOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingPersisted && (
          <div className="text-center text-sm text-muted-foreground py-4">
            📚 Loading chat history...
          </div>
        )}
        {persistenceError && (
          <div className="text-center text-sm text-red-500 py-2 bg-red-50 rounded-md mx-2">
            ⚠️ Failed to load chat history: {persistenceError}
          </div>
        )}
        {!loadingPersisted && allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null
            const showHeader = !prevMessage || prevMessage.user.id !== message.user.id

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.id === userData.id}
                  showHeader={showHeader}
                />
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="flex w-full gap-2 border-t border-border p-4">
        <Input
          className={cn(
            'rounded-full bg-background text-sm transition-all duration-300 focus-visible:ring-offset-0',
            isConnected && newMessage.trim() ? 'w-[calc(100%-36px)]' : 'w-full'
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
}


