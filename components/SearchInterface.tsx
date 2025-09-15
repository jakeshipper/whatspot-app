'use client'

import { useState } from 'react'
import { SearchBar } from './SearchBar'
import { CategoryGrid } from './CategoryGrid'
import { FilterChips } from './FilterChips'
import { RadiusSlider } from './RadiusSlider'

interface SearchInterfaceProps {
  onSearch: (params: any) => void
  activeCategory?: string | null
}

export default function SearchInterface({ onSearch, activeCategory }: SearchInterfaceProps) {
  const [currentRadius, setCurrentRadius] = useState(10)

  const handleSearch = (query: string, location: string) => {
    console.log('Search triggered:', query, location)
    onSearch({ query })
  }

  const handleCategorySelect = (category: string) => {
    console.log('Category selected:', category)
    onSearch({ category })
  }

  const handleFiltersChange = (filters: string[]) => {
    console.log('Filters changed:', filters)
    
    // Handle price filters
    const priceFilter = filters.find(f => ['$', '$$', '$$$'].includes(f))
    
    // Handle other chips
    const chips = filters.filter(f => !['$', '$$', '$$$'].includes(f))
    
    onSearch({ 
      chips,
      budget_max: priceFilter || '$$$'
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
      <CategoryGrid 
        onCategorySelect={handleCategorySelect}
        activeCategory={activeCategory}
      />
      <FilterChips onFiltersChange={handleFiltersChange} />
      <RadiusSlider 
        value={currentRadius}
        onValueChange={handleRadiusChange}
      />
    </div>
  )
}