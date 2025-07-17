'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getRoomList } from '@/services/chat.service'
import { handleError } from '@/lib/error-handler'
import { useState, useEffect, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'

interface JoinFormProps {
  initialRooms?: string[]
}

export const JoinForm = memo(function JoinForm({ initialRooms = [] }: JoinFormProps) {
  const router = useRouter()
  const [roomName, setRoomName] = useState('general')
  const [username, setUsername] = useState('')
  const [availableRooms, setAvailableRooms] = useState<string[]>(initialRooms)
  const [showRoomSelector, setShowRoomSelector] = useState(false)

  useEffect(() => {
    if (initialRooms.length > 0) {
      setAvailableRooms(initialRooms)
      return
    }

    const loadRooms = async () => {
      try {
        const rooms = await getRoomList()
        setAvailableRooms(rooms)
      } catch (error) {
        handleError(error, 'Failed to load available rooms')
      }
    }
    loadRooms()
  }, [initialRooms])

  const handleJoinChat = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUsername = username.trim()
    if (trimmedUsername) {
      router.push(`/chat?room=${roomName}&user=${trimmedUsername}`)
    }
  }, [username, roomName, router])

  const handleRoomSelect = useCallback((selectedRoom: string) => {
    setRoomName(selectedRoom)
    setShowRoomSelector(false)
  }, [])

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-xl">
      <form onSubmit={handleJoinChat} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="username" className="text-sm font-medium text-foreground/80">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="h-12 rounded-xl border-border/50 bg-background/50 text-base placeholder:text-muted-foreground/60"
            required
          />
        </div>
        
        <div className="space-y-3">
          <label htmlFor="room" className="text-sm font-medium text-foreground/80">
            Room
          </label>
          <div className="relative">
            <Input
              id="room"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="h-12 rounded-xl border-border/50 bg-background/50 text-base placeholder:text-muted-foreground/60"
              required
            />
            {availableRooms.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRoomSelector(!showRoomSelector)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 text-xs rounded-lg border-border/50"
              >
                Browse
              </Button>
            )}
            {showRoomSelector && availableRooms.length > 0 && (
              <div className="absolute z-10 left-0 right-0 top-full mt-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                {availableRooms.map((room) => (
                  <button
                    key={room}
                    type="button"
                    onClick={() => handleRoomSelect(room)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors"
                  >
                    {room}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-medium rounded-xl"
        >
          Join Chat
        </Button>
      </form>
    </div>
  )
}) 