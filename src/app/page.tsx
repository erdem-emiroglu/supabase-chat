'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getRoomList } from '@/services/chat.service'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('general')
  const [username, setUsername] = useState('')
  const [availableRooms, setAvailableRooms] = useState<string[]>([])
  const [showRoomSelector, setShowRoomSelector] = useState(false)

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const rooms = await getRoomList()
        setAvailableRooms(rooms)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      }
    }
    loadRooms()
  }, [])

  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      router.push(`/chat?room=${roomName}&user=${username}`)
    }
  }

  const handleRoomSelect = (selectedRoom: string) => {
    setRoomName(selectedRoom)
    setShowRoomSelector(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-[90%] md:w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Join Chat</h1>
          <p className="text-muted-foreground mt-2">
            Enter your details to start chatting
          </p>
        </div>
        
        <form onSubmit={handleJoinChat} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="room" className="text-sm font-medium">
              Room Name
            </label>
            <div className="relative">
              <Input
                id="room"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full"
                required
              />
              {availableRooms.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoomSelector(!showRoomSelector)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2 text-xs"
                >
                  Browse
                </Button>
              )}
              {showRoomSelector && availableRooms.length > 0 && (
                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => handleRoomSelect(room)}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                    >
                      {room}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  )
}
