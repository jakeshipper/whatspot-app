'use client'

import { useState, useEffect } from 'react'
import { getRecommendations } from '@/lib/supabase'
import SearchInterface from '@/components/SearchInterface'
import { MapPin } from 'lucide-react'

export default function Home() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    location: { lat: 43.65107, lng: -79.347015 }, // Toronto fallback
    radius_km: 100,
    budget_max: '$$$',
    chips: [] as string[],
    category: null as string | null,
    query: undefined as string | undefined,
  })

  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    console.log('🚀 WHATSPOT: Starting to fetch recommendations!')
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got user location:', position.coords)
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setSearchParams((prev) => ({ ...prev, location: newLocation }))
          fetchRecommendations({ ...searchParams, location: newLocation })
        },
        (error) => {
          console.error('Location error:', error)
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

  const fetchRecommendations = async (params = searchParams) => {
    setLoading(true)
    console.log('Fetching with params:', params)
    try {
      const data = await getRecommendations({
        location: params.location,
        radius_km: params.radius_km,
        budget_max: params.budget_max,
        chips: params.chips,
        category: params.category || undefined,
        query: params.query || undefined,
      })
      console.log('Data received:', data)
      setVenues(data.results || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchUpdate = (updates: any) => {
    if (updates.category !== undefined) {
      if (updates.category === activeCategory) {
        setActiveCategory(null)
        updates.category = null
      } else {
        setActiveCategory(updates.category)
      }
    }
    if (updates.query !== undefined) {
      console.log('Search query:', updates.query)
    }

    const newParams = { ...searchParams, ...updates }
    setSearchParams(newParams)
    fetchRecommendations(newParams)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Whatspot</h1>

        {locationError && (
          <div className="text-center text-sm text-gray-600 mb-4">{locationError}</div>
        )}

        <SearchInterface onSearch={handleSearchUpdate} activeCategory={activeCategory} />

        <div className="mt-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Finding perfect spots for you...</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                {venues.length > 0 ? `Found ${venues.length} venues` : 'No venues found'}
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {venues.map((venue) => {
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}&destination_place_id=${venue.place_id || ''}`
                  const dist = typeof venue.distance_km === 'number' ? venue.distance_km : null

                  return (
                    <div
                      key={venue.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                    >
                      <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>

                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        {venue.category && <span>{venue.category}</span>}
                        {venue.category && venue.price_level && <span>•</span>}
                        {venue.price_level && <span>{venue.price_level}</span>}
                        {dist !== null && <span>•</span>}
                        {dist !== null && (
                          <span>{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist}km`}</span>
                        )}
                      </div>

                      {venue.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-500">⭐</span>
                          <span>{venue.rating}</span>
                          {venue.review_count && (
                            <span className="text-gray-500 text-sm">({venue.review_count} reviews)</span>
                          )}
                        </div>
                      )}

                      {venue.justification && (
                        <p className="text-gray-700 italic text-sm mb-3">{venue.justification}</p>
                      )}

                      <div className="mt-3 flex justify-end">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          aria-label={`Get directions to ${venue.name}`}
                        >
                          <MapPin className="w-4 h-4" />
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
