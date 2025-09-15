'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("Toronto")

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, location)
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex-1">
        <Input
          placeholder="Search for restaurants, bars, cafes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <Button onClick={handleSearch}>
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  )
}