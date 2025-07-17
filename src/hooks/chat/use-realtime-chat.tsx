'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
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
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = newChannel.presenceState()
        const users = Object.values(presenceState)
          .flat()
          .filter((presence) => 
            presence && typeof presence === 'object' && 'user' in presence && 'online_at' in presence
          )
          .map((presence) => ({
            user: (presence as Record<string, unknown>).user as string,
            online_at: (presence as Record<string, unknown>).online_at as string
          }))
        
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences
          .filter((presence) => 
            presence && typeof presence === 'object' && 'user' in presence && 'online_at' in presence
          )
          .map((presence) => ({
            user: (presence as Record<string, unknown>).user as string,
            online_at: (presence as Record<string, unknown>).online_at as string
          }))
        
        setOnlineUsers((current) => [...current, ...newUsers])
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUsernames = leftPresences
          .filter((presence) => 
            presence && typeof presence === 'object' && 'user' in presence
          )
          .map((presence) => (presence as Record<string, unknown>).user as string)
        
        setOnlineUsers((current) => 
          current.filter(user => !leftUsernames.includes(user.user))
        )
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
  }, [roomName, username, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return

      const message: ChatMessage = {
        id: generateUUID(),
        content,
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
    },
    [channel, isConnected, username]
  )

  return { messages, sendMessage, isConnected, onlineUsers }
}
