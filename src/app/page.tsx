import { HeroSection } from '@/components/home/hero-section'
import { JoinForm } from '@/components/home/join-form'
import { getRoomList } from '@/services/chat.service'

async function getInitialRooms() {
  try {
    return await getRoomList()
  } catch (error) {
    return []
  }
}

export default async function JoinPage() {
  const initialRooms = await getInitialRooms()

  return (
    <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <HeroSection />
        <JoinForm initialRooms={initialRooms} />
      </div>
    </div>
  )
}
