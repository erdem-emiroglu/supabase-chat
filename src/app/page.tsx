'use client'

import { RealtimeChat } from '@/components/realtime-chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMessagesQuery } from '@/hooks/use-messages-query'
import { storeMessages, getRoomList, getMessageCount } from '@/services/chat.service'
import type { ChatMessage } from '@/types/chat'
import { useState, useEffect } from 'react'

export default function ChatPage() {
  const [roomName, setRoomName] = useState('general')
  const [username, setUsername] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<string[]>([])
  const [messageCount, setMessageCount] = useState<number>(0)
  const [showRoomSelector, setShowRoomSelector] = useState(false)
  
  const { data: messages } = useMessagesQuery({ roomName: hasJoined ? roomName : undefined })

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

  useEffect(() => {
    const loadMessageCount = async () => {
      if (hasJoined && roomName) {
        try {
          const count = await getMessageCount(roomName)
          setMessageCount(count)
        } catch (error) {
          console.error('Failed to load message count:', error)
        }
      }
    }
    loadMessageCount()
  }, [hasJoined, roomName])

  const handleMessage = async (messages: ChatMessage[]) => {
    try {
      await storeMessages(messages, { roomName })
      const count = await getMessageCount(roomName)
      setMessageCount(count)
    } catch (error) {
      console.error('Failed to store messages:', error)
    }
  }

  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setHasJoined(true)
    }
  }

  const handleRoomSelect = (selectedRoom: string) => {
    setRoomName(selectedRoom)
    setShowRoomSelector(false)
  }

  if (!hasJoined) {
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

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Chat Room: {roomName}</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {username}! • {messageCount} messages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoomSelector(!showRoomSelector)}
            >
              Switch Room
            </Button>
            <button
              onClick={() => setHasJoined(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
        {showRoomSelector && availableRooms.length > 0 && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Available Rooms:</p>
            <div className="flex flex-wrap gap-2">
              {availableRooms.map((room) => (
                <Button
                  key={room}
                  variant={room === roomName ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoomSelect(room)}
                >
                  {room}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>
      
      <div className="flex-1">
        <RealtimeChat
          roomName={roomName}
          username={username}
          messages={messages}
          onMessage={handleMessage}
        />
      </div>
    </div>
  )
}
