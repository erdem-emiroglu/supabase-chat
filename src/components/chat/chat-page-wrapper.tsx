'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChatHeader } from '@/components/chat/chat-header'
import { ChatContainer } from '@/components/chat/chat-container'
import { storeMessages, getRoomList, getMessageCount } from '@/services/chat.service'
import type { ChatMessage } from '@/types/chat'

interface ChatPageWrapperProps {
  initialRooms?: string[]
  initialMessageCount?: number
}

export function ChatPageWrapper({ initialRooms = [], initialMessageCount = 0 }: ChatPageWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('room') || 'general'
  const username = searchParams.get('user') || ''

  const [availableRooms, setAvailableRooms] = useState<string[]>(initialRooms)
  const [messageCount, setMessageCount] = useState<number>(initialMessageCount)

  useEffect(() => {
    if (!username) {
      router.push('/')
      return
    }

    const loadData = async () => {
      const loadMessageCount = async () => {
        if (roomName) {
          try {
            const count = await getMessageCount(roomName)
            setMessageCount(count)
          } catch (error) {
            // Silent error handling for message count loading
          }
        }
      }

      const loadRooms = async () => {
        try {
          const rooms = await getRoomList()
          setAvailableRooms(rooms)
        } catch (error) {
          // Silent error handling for room loading
        }
      }

      await Promise.all([loadMessageCount(), loadRooms()])
    }

    loadData()
  }, [username, roomName, router])

  const handleMessage = async (messages: ChatMessage[]) => {
    try {
      await storeMessages(messages, { roomName })
      const count = await getMessageCount(roomName)
      setMessageCount(count)
    } catch (error) {
      // Silent error handling for message storage
    }
  }

  const handleRoomChange = (room: string) => {
    // Room change is handled by router.push in ChatHeader
  }

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
        onRoomChange={handleRoomChange}
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
} 