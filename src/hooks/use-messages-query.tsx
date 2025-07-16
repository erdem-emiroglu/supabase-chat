'use client'

import { useEffect, useState } from 'react'
import { fetchMessages } from '@/services/chat.service'
import type { ChatMessage } from '@/types/chat'

interface UseMessagesQueryProps {
  roomName?: string
  limit?: number
  offset?: number
}

export function useMessagesQuery({ 
  roomName, 
  limit, 
  offset 
}: UseMessagesQueryProps = {}) {
  const [data, setData] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadMessages = async () => {
      if (!roomName) {
        setData([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const messages = await fetchMessages({
          roomName,
          limit,
          offset
        })

        setData(messages)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [roomName, limit, offset])

  return { data, isLoading, error }
} 