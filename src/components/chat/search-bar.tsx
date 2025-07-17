'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState, useCallback, memo, useRef } from 'react'
import { searchMessages } from '@/services/chat.service'
import { handleError } from '@/lib/error-handler'
import type { ChatMessage } from '@/types/chat'

interface SearchBarProps {
  roomName: string
  onSearchResults: (results: ChatMessage[]) => void
  onClearSearch: () => void
}

export const SearchBar = memo(function SearchBar({ 
  roomName, 
  onSearchResults, 
  onClearSearch 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      onClearSearch()
      return
    }

    try {
      setIsSearching(true)
      const results = await searchMessages(roomName, term, 20)
      onSearchResults(results)
    } catch (error) {
      handleError(error, 'Search failed')
      onClearSearch()
    } finally {
      setIsSearching(false)
    }
  }, [roomName, onSearchResults, onClearSearch])

  const handleSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (value.trim()) {
      timeoutRef.current = setTimeout(() => {
        performSearch(value)
      }, 300)
    } else {
      onClearSearch()
    }
  }, [performSearch, onClearSearch])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    onClearSearch()
    setIsSearching(false)
  }, [onClearSearch])

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
          className="pl-10 pr-10 h-10 rounded-xl border-border/50 bg-background/50 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && performSearch(searchTerm)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => performSearch(searchTerm)}
        disabled={isSearching || !searchTerm.trim()}
        className="h-10 px-4 rounded-xl border-border/50 text-sm"
      >
        <span className="hidden sm:inline">{isSearching ? 'Searching...' : 'Search'}</span>
        <span className="sm:hidden">{isSearching ? '...' : '🔍'}</span>
      </Button>
    </div>
  )
}) 