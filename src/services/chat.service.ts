import { createClient } from '@/lib/supabase/client'
import type { 
  ChatMessage, 
  DatabaseMessage, 
  StoreMessagesOptions, 
  FetchMessagesOptions 
} from '@/types/chat'
import { 
  transformMessageToDatabase, 
  transformDatabaseToMessage 
} from '@/lib/helpers/message-transforms'

export const storeMessages = async (
  messages: ChatMessage[], 
  options: StoreMessagesOptions
): Promise<void> => {
  const supabase = createClient()
  
  const messagesToInsert = messages.map(message => 
    transformMessageToDatabase(message, options.roomName)
  )

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

export const fetchMessages = async (
  options: FetchMessagesOptions
): Promise<ChatMessage[]> => {
  const supabase = createClient()
  
  let query = supabase
    .from('messages')
    .select('*')
    .eq('room_name', options.roomName)
    .order('created_at', { ascending: true })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  return (data as DatabaseMessage[])?.map(transformDatabaseToMessage) || []
}

export const deleteMessage = async (messageId: string): Promise<void> => {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`)
  }
}

export const deleteRoomMessages = async (roomName: string): Promise<void> => {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('room_name', roomName)

  if (error) {
    throw new Error(`Failed to delete room messages: ${error.message}`)
  }
}

export const getMessageCount = async (roomName: string): Promise<number> => {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('room_name', roomName)

  if (error) {
    throw new Error(`Failed to get message count: ${error.message}`)
  }

  return count || 0
}

export const getRoomList = async (): Promise<string[]> => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('room_name')

  if (error) {
    throw new Error(`Failed to get room list: ${error.message}`)
  }

  const uniqueRooms = [...new Set(data?.map(item => item.room_name) || [])]
  return uniqueRooms
}

export const searchMessages = async (
  roomName: string,
  searchTerm: string,
  limit: number = 50
): Promise<ChatMessage[]> => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_name', roomName)
    .ilike('content', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search messages: ${error.message}`)
  }

  return (data as DatabaseMessage[])?.map(transformDatabaseToMessage) || []
} 