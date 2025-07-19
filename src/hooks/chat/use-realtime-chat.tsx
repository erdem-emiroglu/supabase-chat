'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { handleError } from '@/lib/error-handler'
import type { ChatMessage } from '@/types/chat'
import { generateUUID } from '@/lib/utils'

interface UseRealtimeChatProps {
  roomName: string
  username: string
}

interface PresenceUser {
  user: string
  online_at: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])

  const parsePresenceData = useCallback((presence: unknown): PresenceUser | null => {
    if (!presence || typeof presence !== 'object' || !('user' in presence) || !('online_at' in presence)) {
      return null
    }
    return {
      user: (presence as Record<string, unknown>).user as string,
      online_at: (presence as Record<string, unknown>).online_at as string
    }
  }, [])

  useEffect(() => {
    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        try {
          const newUsers = newPresences
            .map(parsePresenceData)
            .filter((user): user is PresenceUser => user !== null)
          
          setOnlineUsers((current) => {
            const existingUsernames = new Set(current.map(u => u.user))
            const uniqueNewUsers = newUsers.filter(u => !existingUsernames.has(u.user))
            return [...current, ...uniqueNewUsers]
          })
        } catch (error) {
          handleError(error, 'Failed to handle user join')
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        try {
          const leftUsernames = new Set(
            leftPresences
              .map(parsePresenceData)
              .filter((user): user is PresenceUser => user !== null)
              .map(user => user.user)
          )
          
          setOnlineUsers((current) => 
            current.filter(user => !leftUsernames.has(user.user))
          )
        } catch (error) {
          handleError(error, 'Failed to handle user leave')
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          await newChannel.track({
            user: username,
            online_at: new Date().toISOString()
          })
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [roomName, username, supabase, parsePresenceData])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected || !content.trim()) return

      try {
        const message: ChatMessage = {
          id: generateUUID(),
          content: content.trim(),
          user: {
            name: username,
          },
          createdAt: new Date().toISOString(),
        }

        setMessages((current) => [...current, message])

        await channel.send({
          type: 'broadcast',
          event: EVENT_MESSAGE_TYPE,
          payload: message,
        })
      } catch (error) {
        handleError(error, 'Failed to send message')
      }
    },
    [channel, isConnected, username]
  )

  return { messages, sendMessage, isConnected, onlineUsers }
}
