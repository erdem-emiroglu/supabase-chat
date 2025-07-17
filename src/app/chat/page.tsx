import { ChatPageWrapper } from '@/components/chat/chat-page-wrapper'
import { getRoomList, getMessageCount } from '@/services/chat.service'

interface ChatPageProps {
  searchParams: Promise<{
    room?: string
    user?: string
  }>
}

async function getInitialData(roomName?: string) {
  try {
    const [rooms, messageCount] = await Promise.all([
      getRoomList(),
      roomName ? getMessageCount(roomName) : Promise.resolve(0)
    ])
    return { rooms, messageCount }
  } catch {
    return { rooms: [], messageCount: 0 }
  }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const resolvedSearchParams = await searchParams
  const roomName = resolvedSearchParams.room || 'general'
  const { rooms, messageCount } = await getInitialData(roomName)

  return (
    <ChatPageWrapper 
      initialRooms={rooms}
      initialMessageCount={messageCount}
    />
  )
} 