'use client'

import { useEffect, useState } from 'react'
import { SearchBar } from './SearchBar'
import { CategoryGrid } from './CategoryGrid'
import { FilterChips } from './FilterChips'
import { RadiusSlider } from './RadiusSlider'
import type { SearchUpdates, BudgetTier, LatLng } from '@/types/search'

type Props = {
  onSearch: (updates: SearchUpdates) => void
  activeCategory?: string | null
  location: LatLng
  radius_km: number
}

export default function SearchInterface({ onSearch, activeCategory, location, radius_km }: Props) {
  const [currentRadius, setCurrentRadius] = useState<number>(radius_km)
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [locLoading, setLocLoading] = useState(false)

  // Reverse-geocode when location changes
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLocLoading(true)
      try {
        const res = await fetch(
          `/api/reverse-geocode?lat=${encodeURIComponent(location.lat)}&lng=${encodeURIComponent(location.lng)}`
        )
        if (!cancelled && res.ok) {
          const { cityLabel } = (await res.json()) as { cityLabel: string | null }
          setLocationLabel(cityLabel)
        }
      } catch {
        // ignore; we’ll fall back to coords
      } finally {
        if (!cancelled) setLocLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [location.lat, location.lng])

  const handleSearch = (query: string, _location: string) => onSearch({ query })
  const handleCategorySelect = (category: string) => onSearch({ category })

  const handleFiltersChange = (filters: string[]) => {
    const priceOptions: BudgetTier[] = ['$', '$$', '$$$', '$$$$']
    const priceFilter = filters.find((f): f is BudgetTier => (priceOptions as string[]).includes(f))
    const chips = filters.filter((f) => !priceOptions.includes(f as BudgetTier))
    onSearch({ chips, budget_max: priceFilter ?? '$$$' })
  }

  const handleRadiusChange = (val: number) => {
    setCurrentRadius(val)
    onSearch({ radius_km: val })
  }

  const handleUseMyLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onSearch({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
        () => { /* optionally handle error */ }
      )
    }
  }

  return (
    <div className="space-y-5">
      {/* Prominent Search */}
      <div className="glass-strong p-4 md:p-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Location bar under Search */}
      <div className="glass-panel flex items-center justify-between px-4 py-3">
        <div className="text-sm">
          <span className="text-secondary">Current location:</span>{' '}
          <span className="font-medium text-primary">
            {locLoading
              ? '…'
              : locationLabel ?? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
          </span>
        </div>
        <button className="btn-primary" onClick={handleUseMyLocation}>Use my location</button>
      </div>

      {/* Category tiles */}
      <div className="glass-panel p-4">
        <CategoryGrid onCategorySelect={handleCategorySelect} activeCategory={activeCategory} />
      </div>

      {/* Filter chips */}
      <div className="glass-panel p-4">
        <FilterChips onFiltersChange={handleFiltersChange} />
      </div>

      {/* Radius control */}
      <div className="glass-panel p-4">
        <RadiusSlider value={currentRadius} onValueChange={handleRadiusChange} />
      </div>
    </div>
  )
}
