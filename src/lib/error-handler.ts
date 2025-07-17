import { toast } from 'sonner'

export function handleError(error: unknown, context: string) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]:`, error)
  }
  
  toast.error(`${context}: ${message}`)
}

export function handleSuccess(message: string) {
  toast.success(message)
}

export function handleInfo(message: string) {
  toast.info(message)
} 