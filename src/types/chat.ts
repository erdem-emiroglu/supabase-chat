export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
  }
  createdAt: string
}

export interface DatabaseMessage {
  id: string
  content: string
  user_name: string
  room_name: string
  created_at: string
}

export interface ChatRoom {
  name: string
}

export interface User {
  name: string
}

export interface StoreMessagesOptions {
  roomName: string
}

export interface FetchMessagesOptions {
  roomName: string
  limit?: number
  offset?: number
} 