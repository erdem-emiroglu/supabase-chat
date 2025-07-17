export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value)

export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), value)

export const curry = <T, U, V>(fn: (a: T, b: U) => V) => (a: T) => (b: U): V => fn(a, b)

export const partial = <T extends unknown[], U>(fn: (...args: T) => U, ...partialArgs: Partial<T>) =>
  (...remainingArgs: unknown[]): U => fn(...(partialArgs.concat(remainingArgs) as T))

export const memoize = <T extends unknown[], U>(fn: (...args: T) => U): ((...args: T) => U) => {
  const cache = new Map<string, U>()
  return (...args: T): U => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

export const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: T): void => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const throttle = <T extends unknown[]>(fn: (...args: T) => void, limit: number) => {
  let inThrottle = false
  return (...args: T): void => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const tryAsync = async <T>(fn: () => Promise<T>): Promise<[T | null, Error | null]> => {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error('Unknown error')]
  }
}

export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError!
} 