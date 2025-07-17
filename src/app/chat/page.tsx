import { ChatPageWrapper } from '@/components/chat/chat-page-wrapper'
import { getRoomList, getMessageCount } from '@/services/chat.service'

interface ChatPageProps {
  searchParams: {
    room?: string
    user?: string
  }
}

async function getInitialData(roomName?: string) {
  try {
    const [rooms, messageCount] = await Promise.all([
      getRoomList(),
      roomName ? getMessageCount(roomName) : Promise.resolve(0)
    ])
    return { rooms, messageCount }
  } catch (error) {
    return { rooms: [], messageCount: 0 }
  }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const roomName = searchParams.room || 'general'
  const { rooms, messageCount } = await getInitialData(roomName)

  return (
    <ChatPageWrapper 
      initialRooms={rooms}
      initialMessageCount={messageCount}
    />
  )
} 