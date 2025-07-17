import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteMessage } from '@/services/chat.service'
import { handleError, handleSuccess } from '@/lib/error-handler'
import { memo, useCallback, useMemo } from 'react'

interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
  onMessageDelete?: (messageId: string) => void
}

export const ChatMessageItem = memo(function ChatMessageItem({ 
  message, 
  isOwnMessage, 
  showHeader, 
  onMessageDelete 
}: ChatMessageItemProps) {
  const handleDelete = useCallback(async () => {
    try {
      await deleteMessage(message.id)
      onMessageDelete?.(message.id)
      handleSuccess('Message deleted')
    } catch (error) {
      handleError(error, 'Failed to delete message')
    }
  }, [message.id, onMessageDelete])

  const formattedTime = useMemo(() => 
    new Date(message.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }), 
    [message.createdAt]
  )

  return (
    <div className={`flex mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn('max-w-[75%] w-fit flex flex-col gap-1', {
          'items-end': isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn('flex items-center gap-2 text-xs px-3', {
              'justify-end flex-row-reverse': isOwnMessage,
            })}
          >
            <span className={'font-medium'}>{message.user.name}</span>
            <span className="text-foreground/50 text-xs">
              {formattedTime}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div
            className={cn(
              'py-2 px-3 rounded-xl text-sm w-fit',
              isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            )}
          >
            {message.content}
          </div>
          {isOwnMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})
