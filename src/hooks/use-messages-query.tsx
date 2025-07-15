'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { ChatMessage } from './use-realtime-chat'

interface UseMessagesQueryProps {
  roomName?: string
}

export function useMessagesQuery({ roomName }: UseMessagesQueryProps = {}) {
  const [data, setData] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      if (!roomName) {
        setData([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const supabase = createClient()
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_name', roomName)
          .order('created_at', { ascending: true })

        if (error) throw error

        const formattedMessages: ChatMessage[] = messages?.map(msg => ({
          id: msg.id,
          content: msg.content,
          user: {
            name: msg.user_name
          },
          createdAt: msg.created_at
        })) || []

        setData(formattedMessages)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [roomName])

  return { data, isLoading, error }
} 