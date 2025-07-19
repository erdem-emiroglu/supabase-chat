'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChatHeader } from '@/components/chat/chat-header'
import { ChatContainer } from '@/components/chat/chat-container'
import { storeMessages, getRoomList, getMessageCount } from '@/services/chat.service'
import { handleError } from '@/lib/error-handler'
import type { ChatMessage } from '@/types/chat'

interface ChatPageWrapperProps {
  initialRooms?: string[]
  initialMessageCount?: number
}

export const ChatPageWrapper = memo(function ChatPageWrapper({ 
  initialRooms = [], 
  initialMessageCount = 0 
}: ChatPageWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('room') || 'general'
  const username = searchParams.get('user') || ''

  const [availableRooms, setAvailableRooms] = useState<string[]>(initialRooms)
  const [messageCount, setMessageCount] = useState<number>(initialMessageCount)

  const loadMessageCount = useCallback(async () => {
    if (!roomName) return
    
    try {
      const count = await getMessageCount(roomName)
      setMessageCount(count)
    } catch (error) {
      handleError(error, 'Failed to load message count')
    }
  }, [roomName])

  const loadRooms = useCallback(async () => {
    try {
      const rooms = await getRoomList()
      setAvailableRooms(rooms)
    } catch (error) {
      handleError(error, 'Failed to load rooms')
    }
  }, [])

  useEffect(() => {
    if (!username) {
      router.push('/')
      return
    }

    Promise.all([loadMessageCount(), loadRooms()])
  }, [username, roomName, router, loadMessageCount, loadRooms])

  const handleMessage = useCallback(async (messages: ChatMessage[]) => {
    try {
      await storeMessages(messages, { roomName })
      const count = await getMessageCount(roomName)
      setMessageCount(count)
    } catch (error) {
      handleError(error, 'Failed to store messages')
    }
  }, [roomName])

  if (!username) {
    return null
  }

  return (
    <div className="h-dvh flex flex-col">
      <ChatHeader
        roomName={roomName}
        username={username}
        messageCount={messageCount}
        availableRooms={availableRooms}
      />
      
      <div className="flex-1 min-h-0">
        <ChatContainer
          roomName={roomName}
          username={username}
          onMessage={handleMessage}
        />
      </div>
    </div>
  )
}) 