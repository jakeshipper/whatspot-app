'use client'

import { useState } from 'react'
import { SearchBar } from './SearchBar'
import { CategoryGrid } from './CategoryGrid'
import { FilterChips } from './FilterChips'
import { RadiusSlider } from './RadiusSlider'
import type { SearchUpdates, BudgetTier } from '@/types/search'

interface SearchInterfaceProps {
  onSearch: (updates: SearchUpdates) => void
  activeCategory?: string | null
}

export default function SearchInterface({ onSearch, activeCategory }: SearchInterfaceProps) {
  const [currentRadius, setCurrentRadius] = useState<number>(10)

  const handleSearch = (query: string, _location: string) => {
    console.log('Search triggered:', query, _location)
    onSearch({ query })
  }

  const handleCategorySelect = (category: string) => {
    console.log('Category selected:', category)
    onSearch({ category })
  }

  const handleFiltersChange = (filters: string[]) => {
    console.log('Filters changed:', filters)

    const priceOptions: BudgetTier[] = ['$', '$$', '$$$', '$$$$']

    const priceFilter = filters.find(
      (f): f is BudgetTier => (priceOptions as string[]).includes(f)
    )

    const chips = filters.filter((f) => !priceOptions.includes(f as BudgetTier))

    onSearch({
      chips,
      budget_max: priceFilter ?? '$$$',
    })
  }

  const handleRadiusChange = (newRadius: number) => {
    console.log('Radius changed:', newRadius)
    setCurrentRadius(newRadius)
    onSearch({ radius_km: newRadius })
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
      <SearchBar onSearch={handleSearch} />
      <CategoryGrid onCategorySelect={handleCategorySelect} activeCategory={activeCategory} />
      <FilterChips onFiltersChange={handleFiltersChange} />
      <RadiusSlider value={currentRadius} onValueChange={handleRadiusChange} />
    </div>
  )
}
