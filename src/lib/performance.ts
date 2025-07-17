import { useCallback, useRef } from 'react'

export function useDebounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

export function useMemoCompare<T>(
  next: T,
  compare: (previous: T | undefined, next: T) => boolean
): T | undefined {
  const previousRef = useRef<T | undefined>(undefined)
  const previous = previousRef.current

  const isEqual = compare(previous, next)

  if (!isEqual) {
    previousRef.current = next
    return next
  }

  return previous
} 