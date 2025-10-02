'use client'

import { useEffect, useState } from 'react'
import VenueCard from '@/components/VenueCard'

type Venue = {
  place_id: string
  id: string
  name: string
  latitude: number
  longitude: number
  category?: string
  price_level?: '$' | '$$' | '$$$' | '$$$$'
  rating?: number
  review_count?: number
  distance_km?: number
  address?: string
  website?: string
  open_now?: boolean
  photo_url?: string
}

const FAV_KEY = 'whatspot:favorites'
const RATE_KEY = 'whatspot:ratings'
const WANT_KEY = 'whatspot:want'

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set<string>(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}
function readRatings(): Record<string, number> {
  try {
    const raw = localStorage.getItem(RATE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch { return {} }
}
function readWant(): Venue[] {
  try {
    const raw = localStorage.getItem(WANT_KEY)
    return raw ? (JSON.parse(raw) as Venue[]) : []
  } catch { return [] }
}

export default function ListsPage() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [want, setWant] = useState<Venue[]>([])

  useEffect(() => {
    setFavorites(readSet(FAV_KEY))
    setRatings(readRatings())
    setWant(readWant())
  }, [])

  // Any venue in want list OR any venue rated >= 4 or favorited
  // We only have detailed venue objects in WANT; favorites by id need real data in future (supabase).
  const wantList = want
  const favIds = new Set(
    Object.entries(ratings)
      .filter(([, r]) => r >= 4)
      .map(([id]) => id)
  )
  favorites.forEach((id) => favIds.add(id))

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-2xl font-semibold text-primary">Want to Go</h2>
        {wantList.length === 0 ? (
          <p className="text-secondary">You haven’t added any places yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wantList.map((v) => (
              <VenueCard key={v.place_id} venue={v} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-primary">Favorites</h2>
        {favIds.size === 0 ? (
          <p className="text-secondary">
            Favorites appear when you rate 4★ or higher—or tap the heart on a card.
          </p>
        ) : (
          <p className="text-secondary">
            You’ve favorited {favIds.size} place{favIds.size === 1 ? '' : 's'} (full details coming when we persist data to a backend).
          </p>
        )}
      </section>
    </div>
  )
}
