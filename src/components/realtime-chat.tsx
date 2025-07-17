'use client'

import { cn } from '@/lib/utils'
import { ChatMessageItem } from '@/components/chat-message'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useRealtimeChat } from '@/hooks/use-realtime-chat'
import type { ChatMessage } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { searchMessages } from '@/services/chat.service'

interface RealtimeChatProps {
  roomName: string
  username: string
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
}

export const RealtimeChat = ({
  roomName,
  username,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll()

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    onlineUsers,
  } = useRealtimeChat({
    roomName,
    username,
  })
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) => index === self.findIndex((m) => m.id === message.id)
    )
    const sortedMessages = uniqueMessages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

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

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const results = await searchMessages(roomName, searchTerm, 20)
      setSearchResults(results)
    } catch (error) {
      // Silent error handling for search
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, roomName])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setSearchResults([])
    setIsSearching(false)
  }, [])



  const handleMessageDelete = useCallback((messageId: string) => {
    const updatedMessages = allMessages.filter(msg => msg.id !== messageId)
    if (onMessage) {
      onMessage(updatedMessages)
    }
  }, [allMessages, onMessage])

  const displayMessages = searchResults.length > 0 ? searchResults : allMessages

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased relative">
      <div className="border-b border-border/50 bg-muted/10 p-4 space-y-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-10 rounded-xl border-border/50 bg-background/50 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            disabled={isSearching}
            className="h-10 px-4 rounded-xl border-border/50 text-sm"
          >
            <span className="hidden sm:inline">{isSearching ? 'Searching...' : 'Search'}</span>
            <span className="sm:hidden">{isSearching ? '...' : '🔍'}</span>
          </Button>

        </div>
        {searchResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Found {searchResults.length} messages matching &quot;{searchTerm}&quot;
          </div>
        )}
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{onlineUsers.length} online: {onlineUsers.map(user => user.user).join(', ')}</span>
          </div>
        )}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4">
          {displayMessages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              {searchResults.length > 0 ? 'No messages found.' : 'No messages yet. Start the conversation!'}
            </div>
          ) : null}
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
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="flex w-full gap-3 border-t border-border/50 p-4 flex-shrink-0 bg-background/80 backdrop-blur-sm sticky bottom-0 z-10 safe-area-bottom">
        <Input
          className={cn(
            'rounded-full bg-background text-base transition-all duration-300 min-h-[40px]',
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
            className="aspect-square rounded-xl animate-in fade-in slide-in-from-right-4 duration-300 h-10 w-10"
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
