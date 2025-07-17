interface PresenceUser {
  user: string
  online_at: string
}

interface PresenceIndicatorProps {
  onlineUsers: PresenceUser[]
}

export function PresenceIndicator({ onlineUsers }: PresenceIndicatorProps) {
  if (onlineUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>{onlineUsers.length} online: {onlineUsers.map(user => user.user).join(', ')}</span>
    </div>
  )
} 