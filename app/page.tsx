'use client'

import { useEffect, useState } from 'react'
import { getRecommendations } from '@/lib/supabase'
import SearchInterface from '@/components/SearchInterface'
import type {
  Venue,
  SearchParams as ISearchParams,
  SearchUpdates,
  RecommendationsResponse,
  LatLng,
} from '@/types/search'

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [searchParams, setSearchParams] = useState<ISearchParams>({
    location: { lat: 43.65107, lng: -79.347015 }, // Toronto fallback
    radius_km: 100,
    budget_max: '$$$',
    chips: [],
    category: null,
    query: undefined,
  })

  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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

  const fetchRecommendations = async (params: ISearchParams = searchParams) => {
    setLoading(true)
    try {
      const data = (await getRecommendations({
        location: params.location,
        radius_km: params.radius_km,
        budget_max: params.budget_max,
        chips: params.chips,
        category: params.category ?? undefined,
        query: params.query ?? undefined,
      })) as RecommendationsResponse
      setVenues(data?.results ?? [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchUpdate = (updates: SearchUpdates) => {
    if (updates.category !== undefined) {
      if (updates.category === activeCategory) {
        setActiveCategory(null)
        updates.category = null
      } else {
        setActiveCategory(updates.category ?? null)
      }
    }

    const newParams: ISearchParams = { ...searchParams, ...updates }
    setSearchParams(newParams)
    fetchRecommendations(newParams)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold text-primary">Whatspot</h1>

        {locationError && (
          <div className="mb-4 text-center text-sm text-secondary">{locationError}</div>
        )}

        <SearchInterface
          onSearch={handleSearchUpdate}
          activeCategory={activeCategory}
          location={searchParams.location}
          radius_km={searchParams.radius_km}
        />

        <div className="mt-8">
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[rgba(45,55,72,0.80)]" />
              <p className="mt-2 text-secondary">Finding perfect spots for you...</p>
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-primary">
                {venues.length > 0 ? `Found ${venues.length} venues` : 'No venues found'}
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {venues.map((venue) => {
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}&destination_place_id=${venue.place_id || ''}`
                  const dist = typeof venue.distance_km === 'number' ? venue.distance_km : null

                  return (
                    <div key={venue.id} className="glass-panel p-6 transition-shadow hover:shadow-xl">
                      <h3 className="mb-2 text-xl font-semibold">{venue.name}</h3>

                      <div className="mb-2 flex items-center gap-2 text-secondary">
                        {venue.category && <span>{venue.category}</span>}
                        {venue.category && venue.price_level && <span>•</span>}
                        {venue.price_level && <span>{venue.price_level}</span>}
                        {dist !== null && <span>•</span>}
                        {dist !== null && (
                          <span>{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist}km`}</span>
                        )}
                      </div>

                      {typeof venue.rating === 'number' && (
                        <div className="mb-2 flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-primary">{venue.rating}</span>
                          {typeof venue.review_count === 'number' && (
                            <span className="text-sm text-secondary">
                              ({venue.review_count} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {venue.justification && (
                        <p className="mb-3 text-sm italic text-primary">{venue.justification}</p>
                      )}

                      <div className="mt-3 flex justify-end">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-accent flex items-center gap-1 text-sm"
                          aria-label={`Get directions to ${venue.name}`}
                        >
                          Directions
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
