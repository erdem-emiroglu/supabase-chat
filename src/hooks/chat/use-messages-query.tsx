'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchMessages } from '@/services/chat.service'
import { handleError } from '@/lib/error-handler'
import type { ChatMessage } from '@/types/chat'

interface UseMessagesQueryProps {
  roomName?: string
  limit?: number
  offset?: number
}

export function useMessagesQuery({ 
  roomName, 
  limit = 50, 
  offset = 0 
}: UseMessagesQueryProps = {}) {
  const [data, setData] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)



  const loadMessages = useCallback(async () => {
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
      const error = err instanceof Error ? err : new Error('Failed to fetch messages')
      setError(error)
      setData([])
      handleError(error, 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [roomName, limit, offset])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return { 
    data, 
    isLoading, 
    error,
    refetch: loadMessages
  }
} 