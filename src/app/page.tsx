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
        // Silent error handling for room loading
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
    <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Supabase Chat</h1>
          <p className="text-muted-foreground text-lg">
            Real-time conversations, anywhere
          </p>
        </div>
        
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
      </div>
    </div>
  )
}
