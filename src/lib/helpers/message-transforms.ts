import type { 
  ChatMessage, 
  DatabaseMessage
} from '@/types/chat'

export const transformMessageToDatabase = (message: ChatMessage, roomName: string): Omit<DatabaseMessage, 'room_name'> & { room_name: string } => ({
  id: message.id,
  content: message.content,
  user_name: message.user.name,
  room_name: roomName,
  created_at: message.createdAt
})

export const transformDatabaseToMessage = (dbMessage: DatabaseMessage): ChatMessage => ({
  id: dbMessage.id,
  content: dbMessage.content,
  user: {
    name: dbMessage.user_name
  },
  createdAt: dbMessage.created_at
}) 