'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ChatHeaderProps {
  roomName: string
  username: string
  messageCount: number
  availableRooms?: string[]
  onRoomChange?: (room: string) => void
}

export function ChatHeader({ 
  roomName, 
  username, 
  messageCount, 
  availableRooms = [],
  onRoomChange 
}: ChatHeaderProps) {
  const router = useRouter()
  const [showRoomSelector, setShowRoomSelector] = useState(false)

  const handleRoomSelect = (selectedRoom: string) => {
    setShowRoomSelector(false)
    onRoomChange?.(selectedRoom)
    router.push(`/chat?room=${selectedRoom}&user=${username}`)
  }

  const handleLeaveRoom = () => {
    router.push('/')
  }

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold truncate">
            #{roomName}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {username} • {messageCount} messages
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRoomSelector(!showRoomSelector)}
            className="h-9 px-4 rounded-lg border-border/50 text-sm"
          >
            <span className="hidden sm:inline">Switch Room</span>
            <span className="sm:hidden">Switch</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="hidden sm:inline">Leave</span>
            <span className="sm:hidden">×</span>
          </Button>
        </div>
      </div>
      {showRoomSelector && availableRooms.length > 0 && (
        <div className="mt-4 p-4 bg-muted/30 backdrop-blur-sm rounded-xl border border-border/30">
          <p className="text-sm font-medium mb-3 text-foreground/80">Available Rooms</p>
          <div className="flex flex-wrap gap-2">
            {availableRooms.map((room) => (
              <Button
                key={room}
                variant={room === roomName ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoomSelect(room)}
                className="h-8 px-3 rounded-lg text-sm border-border/50"
              >
                #{room}
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
} 