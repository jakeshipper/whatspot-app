'use client'

import { useState, useEffect } from 'react'
import { SearchBar } from './SearchBar'
import { CategoryGrid } from './CategoryGrid'
import { FilterChips } from './FilterChips'
import { RadiusSlider } from './RadiusSlider'
import type { SearchUpdates, LatLng } from '@/types/search'

interface SearchInterfaceProps {
  onSearch: (params: SearchUpdates) => void
  activeCategory?: string | null
  location?: LatLng
  radius_km?: number // <- accepts initial radius from page (defaults to 5)
}

export default function SearchInterface({
  onSearch,
  activeCategory,
  location,
  radius_km = 5, // 🔒 default to 5 km
}: SearchInterfaceProps) {
  const [currentRadius, setCurrentRadius] = useState<number>(radius_km)

  // keep local slider in sync if parent changes (e.g., geolocation reset)
  useEffect(() => {
    setCurrentRadius(radius_km)
  }, [radius_km])

  const handleSearch = (query: string, _location: string) => {
    onSearch({ query })
  }

  const handleCategorySelect = (category: string) => {
    onSearch({ category })
  }

  const handleFiltersChange = (filters: string[]) => {
    // Handle price filters
    const priceFilter = filters.find((f) => ['$', '$$', '$$$'].includes(f))
    // Handle other chips
    const chips = filters.filter((f) => !['$', '$$', '$$$'].includes(f))
    onSearch({
      chips,
      budget_max: (priceFilter as '$' | '$$' | '$$$') || '$$$',
    })
  }

  const handleRadiusChange = (newRadius: number) => {
    setCurrentRadius(newRadius)
    onSearch({ radius_km: newRadius })
  }

  return (
    <div className="space-y-6 rounded-lg bg-white/30 p-6 shadow-xl backdrop-blur-md glass-panel">
      <SearchBar onSearch={handleSearch} />
      <CategoryGrid onCategorySelect={handleCategorySelect} activeCategory={activeCategory} />
      <FilterChips onFiltersChange={handleFiltersChange} />
      <RadiusSlider value={currentRadius} onValueChange={handleRadiusChange} min={1} max={50} />
    </div>
  )
}
