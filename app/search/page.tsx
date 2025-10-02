'use client'

import { useEffect, useState } from 'react'
import { getRecommendations } from '@/lib/recommendations'
import dynamic from 'next/dynamic'
import SearchInterface from '@/components/SearchInterface'
import VenueCard from '@/components/VenueCard'
import SortControl from '@/components/SortControl'
// Leaflet relies on the browser window; disable SSR for the map
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

/** ---- Local types kept inline to avoid import/type drift ---- */
type Budget = '$' | '$$' | '$$$' | '$$$$'
type LatLng = { lat: number; lng: number }

type Venue = {
  place_id: string
  id: string
  name: string
  latitude: number
  longitude: number
  category?: string
  price_level?: Budget
  rating?: number
  review_count?: number
  distance_km?: number
  address?: string
  website?: string
  open_now?: boolean
  photo_url?: string
}

type SearchParams = {
  location: LatLng
  radius_km: number
  budget_max: Budget
  chips: string[]
  category: string | null
  query?: string
}
type SearchUpdates = Partial<SearchParams>
type RecommendationsResponse = { results: Venue[] }
/** ------------------------------------------------------------ */

export default function SearchPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'alpha'>('relevance')

  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: { lat: 43.65107, lng: -79.347015 }, // Toronto fallback
    radius_km: 5, // default radius
    budget_max: '$$$',
    chips: [],
    category: null,
    query: undefined,
  })

  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Initial fetch (with geolocation if available)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: LatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setSearchParams((prev) => ({ ...prev, location: newLocation }))
          fetchRecommendations({ ...searchParams, location: newLocation })
        },
        () => {
          setLocationError('Using default location (Toronto)')
          fetchRecommendations()
        }
      )
    } else {
      setLocationError('Geolocation not supported')
      fetchRecommendations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch from API
  const fetchRecommendations = async (params: SearchParams = searchParams) => {
    setLoading(true)
    try {
      const data = (await getRecommendations({
        location: params.location,
        radius_km: params.radius_km,
        budget_max: params.budget_max,
        chips: params.chips,
        category: params.category ?? null,
        query: params.query ?? undefined,
      })) as RecommendationsResponse
      setVenues(data?.results ?? [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search UI updates
  const handleSearchUpdate = (updates: SearchUpdates) => {
    if (updates.category !== undefined) {
      if (updates.category === activeCategory) {
        setActiveCategory(null)
        updates.category = null
      } else {
        setActiveCategory(updates.category ?? null)
      }
    }
    const newParams: SearchParams = { ...searchParams, ...updates }
    setSearchParams(newParams)
    fetchRecommendations(newParams)
  }

  // Client-side sorting (relevance = keep API order)
  function sortVenues(list: Venue[], mode: 'relevance' | 'distance' | 'alpha') {
    if (mode === 'distance') {
      return [...list].sort((a, b) => {
        const da = typeof a.distance_km === 'number' ? a.distance_km : Number.POSITIVE_INFINITY
        const db = typeof b.distance_km === 'number' ? b.distance_km : Number.POSITIVE_INFINITY
        return da - db
      })
    }
    if (mode === 'alpha') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-6 text-center text-3xl font-semibold text-primary">Search</h2>

        {locationError && (
          <div className="mb-4 text-center text-sm text-secondary">{locationError}</div>
        )}

        <SearchInterface
          onSearch={handleSearchUpdate}
          activeCategory={activeCategory}
          location={searchParams.location}
          radius_km={searchParams.radius_km}
        />

        {/* Map with shaded search radius */}
        <div className="mt-6">
          <MapView
            center={searchParams.location}
            venues={venues}
            radiusKm={searchParams.radius_km}
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[rgba(45,55,72,0.80)]" />
              <p className="mt-2 text-secondary">Finding perfect spots for you...</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-primary">
                  {venues.length > 0 ? `Found ${venues.length} venues` : 'No venues found'}
                </h3>
                <SortControl value={sortBy} onChange={setSortBy} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortVenues(venues, sortBy).map((v) => (
                  <VenueCard key={v.place_id} venue={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
