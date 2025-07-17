'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isConnected: boolean
}

export function MessageInput({ onSendMessage, isConnected }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected) return

      onSendMessage(newMessage)
      setNewMessage('')
    },
    [newMessage, isConnected, onSendMessage]
  )

  return (
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
  )
} 