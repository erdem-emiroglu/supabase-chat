import { createClient } from '@/lib/supabase/client'
import type { ChatMessage } from '@/hooks/use-realtime-chat'

interface StoreMessagesOptions {
  roomName: string
}

export async function storeMessages(
  messages: ChatMessage[], 
  options: StoreMessagesOptions
) {
  const supabase = createClient()
  
  const messagesToInsert = messages.map(message => ({
    id: message.id,
    content: message.content,
    user_name: message.user.name,
    room_name: options.roomName,
    created_at: message.createdAt
  }))

  const { error } = await supabase
    .from('messages')
    .upsert(messagesToInsert, { 
      onConflict: 'id',
      ignoreDuplicates: true 
    })

  if (error) {
    throw new Error(`Failed to store messages: ${error.message}`)
  }
} 