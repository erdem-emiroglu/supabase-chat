'use client'

import { RealtimeChat } from '@/components/realtime-chat'
import { useMessagesQuery } from '@/hooks/use-messages-query'
import { storeMessages } from '@/lib/store-messages'
import type { ChatMessage } from '@/hooks/use-realtime-chat'
import { useState } from 'react'

export default function ChatPage() {
  const [roomName, setRoomName] = useState('general')
  const [username, setUsername] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  
  const { data: messages } = useMessagesQuery({ roomName: hasJoined ? roomName : undefined })

  const handleMessage = async (messages: ChatMessage[]) => {
    try {
      await storeMessages(messages, { roomName })
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

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-lg">
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
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="room" className="text-sm font-medium">
                Room Name
              </label>
              <input
                id="room"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
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
            <p className="text-sm text-muted-foreground">Welcome, {username}!</p>
          </div>
          <button
            onClick={() => setHasJoined(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Leave Room
          </button>
        </div>
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
