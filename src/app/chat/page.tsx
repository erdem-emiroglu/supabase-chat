'use client'

import { RealtimeChat } from '@/components/realtime-chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMessagesQuery } from '@/hooks/use-messages-query'
import { storeMessages, getRoomList, getMessageCount } from '@/services/chat.service'
import type { ChatMessage } from '@/types/chat'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('room') || 'general'
  const username = searchParams.get('user') || ''
  
  const [currentRoomName, setCurrentRoomName] = useState(roomName)
  const [currentUsername, setCurrentUsername] = useState(username)
  const [availableRooms, setAvailableRooms] = useState<string[]>([])
  const [messageCount, setMessageCount] = useState<number>(0)
  const [showRoomSelector, setShowRoomSelector] = useState(false)
  
  const { data: messages } = useMessagesQuery({ roomName: currentRoomName })

  useEffect(() => {
    if (!username) {
      router.push('/')
      return
    }
    
    const loadRooms = async () => {
      try {
        const rooms = await getRoomList()
        setAvailableRooms(rooms)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      }
    }
    loadRooms()
  }, [username, router])

  useEffect(() => {
    const loadMessageCount = async () => {
      if (currentRoomName) {
        try {
          const count = await getMessageCount(currentRoomName)
          setMessageCount(count)
        } catch (error) {
          console.error('Failed to load message count:', error)
        }
      }
    }
    loadMessageCount()
  }, [currentRoomName])

  const handleMessage = async (messages: ChatMessage[]) => {
    try {
      await storeMessages(messages, { roomName: currentRoomName })
      const count = await getMessageCount(currentRoomName)
      setMessageCount(count)
    } catch (error) {
      console.error('Failed to store messages:', error)
    }
  }

  const handleRoomSelect = (selectedRoom: string) => {
    setCurrentRoomName(selectedRoom)
    setShowRoomSelector(false)
    router.push(`/chat?room=${selectedRoom}&user=${currentUsername}`)
  }

  const handleLeaveRoom = () => {
    router.push('/')
  }

  if (!username) {
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-card px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">
              Chat Room: {currentRoomName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Welcome, {currentUsername}! • {messageCount} messages
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoomSelector(!showRoomSelector)}
              className="text-xs px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Switch Room</span>
              <span className="sm:hidden">Switch</span>
            </Button>
            <button
              onClick={handleLeaveRoom}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
            >
              <span className="hidden sm:inline">Leave Room</span>
              <span className="sm:hidden">Leave</span>
            </button>
          </div>
        </div>
        {showRoomSelector && availableRooms.length > 0 && (
          <div className="mt-2 p-2 sm:p-3 bg-muted rounded-md">
            <p className="text-xs sm:text-sm font-medium mb-2">Available Rooms:</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {availableRooms.map((room) => (
                <Button
                  key={room}
                  variant={room === currentRoomName ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoomSelect(room)}
                  className="text-xs px-2 sm:px-3 h-7 sm:h-8"
                >
                  {room}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>
      
      <div className="flex-1 min-h-0">
        <RealtimeChat
          roomName={currentRoomName}
          username={currentUsername}
          messages={messages}
          onMessage={handleMessage}
        />
      </div>
    </div>
  )
} 