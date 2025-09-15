'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface FilterChipsProps {
  onFiltersChange?: (filters: string[]) => void
}

const filters = [
  'Hidden gem',
  'Popular spot',
  'Vegetarian',
  'Vegan',
  'Open now',
  '$',
  '$$',
  '$$$',
]

export function FilterChips({ onFiltersChange }: FilterChipsProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleFilter = (filter: string) => {
    const newSelected = selected.includes(filter)
      ? selected.filter(f => f !== filter)
      : [...selected, filter]
    
    setSelected(newSelected)
    onFiltersChange?.(newSelected)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Badge
          key={filter}
          variant={selected.includes(filter) ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => toggleFilter(filter)}
        >
          {filter}
        </Badge>
      ))}
    </div>
  )
}