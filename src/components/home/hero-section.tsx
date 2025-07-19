import { SupabaseLogo } from '@/components/icons/supabase-logo'

export function HeroSection() {
  return (
    <div className="text-center space-y-3">
      <div className="w-16 h-16 bg-primary/10 border-primary rounded-2xl flex items-center justify-center mx-auto">
        <SupabaseLogo />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Supabase Chat</h1>
      <p className="text-muted-foreground text-lg">
        Chat with other users in real-time
      </p>
    </div>
  )
} 