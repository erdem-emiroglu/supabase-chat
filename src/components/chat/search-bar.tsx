'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState, useCallback } from 'react'
import { searchMessages } from '@/services/chat.service'
import type { ChatMessage } from '@/types/chat'

interface SearchBarProps {
  roomName: string
  onSearchResults: (results: ChatMessage[]) => void
  onClearSearch: () => void
}

export function SearchBar({ roomName, onSearchResults, onClearSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      onClearSearch()
      return
    }

    try {
      setIsSearching(true)
      const results = await searchMessages(roomName, searchTerm, 20)
      onSearchResults(results)
    } catch (error) {
      // Silent error handling for search
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, roomName, onSearchResults, onClearSearch])

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-10 rounded-xl border-border/50 bg-background/50 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
        onClick={handleSearch}
        disabled={isSearching}
        className="h-10 px-4 rounded-xl border-border/50 text-sm"
      >
        <span className="hidden sm:inline">{isSearching ? 'Searching...' : 'Search'}</span>
        <span className="sm:hidden">{isSearching ? '...' : '🔍'}</span>
      </Button>
    </div>
  )
} 