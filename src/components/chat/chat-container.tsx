'use client'

import { useCallback, useEffect, useMemo, useState, memo } from 'react'
import { useChatScroll } from '@/hooks/chat/use-chat-scroll'
import { useRealtimeChat } from '@/hooks/chat/use-realtime-chat'
import { useMessagesQuery } from '@/hooks/chat/use-messages-query'
import { ChatMessageItem } from '@/components/chat/chat-message'
import { SearchBar } from '@/components/chat/search-bar'
import { PresenceIndicator } from '@/components/chat/presence-indicator'
import { MessageInput } from '@/components/chat/message-input'

import type { ChatMessage } from '@/types/chat'

interface ChatContainerProps {
  roomName: string
  username: string
  onMessage?: (messages: ChatMessage[]) => void
}

export const ChatContainer = memo(function ChatContainer({ 
  roomName, 
  username, 
  onMessage 
}: ChatContainerProps) {
  const { containerRef, scrollToBottom } = useChatScroll()
  const { data: initialMessages = [] } = useMessagesQuery({ roomName })

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    onlineUsers,
  } = useRealtimeChat({
    roomName,
    username,
  })

  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])

  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) => index === self.findIndex((m) => m.id === message.id)
    )
    return uniqueMessages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    if (onMessage && allMessages.length > 0) {
      onMessage(allMessages)
    }
  }, [allMessages, onMessage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [allMessages.length, scrollToBottom])

  const handleMessageDelete = useCallback((messageId: string) => {
    const updatedMessages = allMessages.filter(msg => msg.id !== messageId)
    onMessage?.(updatedMessages)
  }, [allMessages, onMessage])

  const handleSearchResults = useCallback((results: ChatMessage[]) => {
    setSearchResults(results)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
  }, [])

  const handleSendMessage = useCallback((message: string) => {
    sendMessage(message)
  }, [sendMessage])

  const displayMessages = searchResults.length > 0 ? searchResults : allMessages

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased relative">
      <div className="border-b border-border/50 bg-muted/10 p-4 space-y-4 flex-shrink-0">
        <SearchBar 
          roomName={roomName}
          onSearchResults={handleSearchResults}
          onClearSearch={handleClearSearch}
        />
        {searchResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Found {searchResults.length} messages matching your search
          </div>
        )}
        <PresenceIndicator onlineUsers={onlineUsers} />
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4">
          {displayMessages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              {searchResults.length > 0 ? 'No messages found.' : 'No messages yet. Start the conversation!'}
            </div>
          ) : (
            <div className="space-y-1">
              {displayMessages.map((message, index) => {
                const prevMessage = index > 0 ? displayMessages[index - 1] : null
                const showHeader = !prevMessage || prevMessage.user.name !== message.user.name

                return (
                  <div
                    key={message.id}
                    className="group animate-in fade-in slide-in-from-bottom-4 duration-300"
                  >
                    <ChatMessageItem
                      message={message}
                      isOwnMessage={message.user.name === username}
                      showHeader={showHeader}
                      onMessageDelete={handleMessageDelete}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <MessageInput onSendMessage={handleSendMessage} isConnected={isConnected} />
    </div>
  )
}) 