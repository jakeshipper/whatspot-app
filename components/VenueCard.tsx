'use client'

import { useEffect, useState } from 'react'
import type { Venue } from '@/types/search'
import { Heart, Star } from 'lucide-react'

type Props = { venue: Venue }

const FAV_KEY = 'whatspot:favorites'
const RATE_KEY = 'whatspot:ratings'

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch { return new Set() }
}
function writeSet(key: string, set: Set<string>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(Array.from(set)))
}
function readRatings(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(RATE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch { return {} }
}
function writeRatings(map: Record<string, number>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RATE_KEY, JSON.stringify(map))
}

// --- Category prettifier ---
const TYPE_LABELS: Record<string, string> = {
  middle_eastern_restaurant: 'Middle Eastern',
  italian_restaurant: 'Italian',
  japanese_restaurant: 'Japanese',
  sushi_restaurant: 'Sushi',
  thai_restaurant: 'Thai',
  chinese_restaurant: 'Chinese',
  korean_restaurant: 'Korean',
  indian_restaurant: 'Indian',
  mediterranean_restaurant: 'Mediterranean',
  pizza_restaurant: 'Pizza',
  burger_restaurant: 'Burgers',
  breakfast_restaurant: 'Breakfast',
  brunch_restaurant: 'Brunch',
  dessert_shop: 'Desserts',
  ice_cream_shop: 'Ice Cream',
  fast_food_restaurant: 'Fast Food',
  coffee_shop: 'Coffee Shop',
  cafe: 'Cafe',
  bakery: 'Bakery',
  bar: 'Bar',
  cocktail_bar: 'Cocktail Bar',
  wine_bar: 'Wine Bar',
}
function formatCategory(raw?: string): string | undefined {
  if (!raw) return undefined
  if (TYPE_LABELS[raw]) return TYPE_LABELS[raw]
  const cleaned = raw.replace(/_restaurant$/, '').replace(/_/g, ' ')
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function VenueCard({ venue }: Props) {
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [imgOk, setImgOk] = useState(true)

  const isFav = favs.has(venue.place_id)
  const myRating = ratings[venue.place_id] ?? 0

  useEffect(() => {
    setFavs(readSet(FAV_KEY))
    setRatings(readRatings())
  }, [])

  const toggleFav = () => {
    const next = new Set(favs)
    if (next.has(venue.place_id)) next.delete(venue.place_id)
    else next.add(venue.place_id)
    setFavs(next)
    writeSet(FAV_KEY, next)
  }
  const setMyRating = (v: number) => {
    const next = { ...ratings, [venue.place_id]: v }
    setRatings(next)
    writeRatings(next)
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}&destination_place_id=${venue.place_id || ''}`
  const dist = typeof venue.distance_km === 'number' ? venue.distance_km : null
  const distLabel =
    dist === null ? undefined : dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(2)} km`

  const showImg = Boolean(venue.photo_url) && imgOk

  return (
    <div data-venue-id={venue.place_id} className="glass-panel overflow-hidden transition-shadow hover:shadow-xl">
      {/* Image */}
      <div className="relative">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.photo_url!}
            alt=""                   // <- remove visible alt text entirely
            className="h-40 w-full object-cover md:h-44"
            onError={() => setImgOk(false)} // <- fallback to placeholder if it fails
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-white/50 text-secondary md:h-44">
            <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true" className="opacity-60">
              <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 19l4.5-6L12 17l3.5-4L21 19" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
        )}
        {venue.open_now && (
          <div className="absolute left-3 top-3 rounded-full bg-[rgba(114,198,119,0.9)] px-2 py-1 text-xs font-medium text-white">
            Open now
          </div>
        )}
        <button
          type="button"
          aria-pressed={isFav}
          onClick={toggleFav}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2"
          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-[color:#72c677] text-[color:#72c677]' : 'text-primary'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-xl font-semibold text-primary">{venue.name}</h3>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-secondary">
          {formatCategory(venue.category) && <span className="truncate">{formatCategory(venue.category)}</span>}
          {formatCategory(venue.category) && venue.price_level && <span>•</span>}
          {venue.price_level && <span>{venue.price_level}</span>}
          {distLabel && <span>•</span>}
          {distLabel && <span>{distLabel}</span>}
          {typeof venue.rating === 'number' && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-primary">{venue.rating}</span>
                {typeof venue.review_count === 'number' && (
                  <span className="text-sm text-secondary">({venue.review_count})</span>
                )}
              </span>
            </>
          )}
        </div>

        {venue.justification && (
          <p className="mb-2 text-sm italic text-primary">{venue.justification}</p>
        )}

        {venue.address && (
          <p className="mb-3 text-sm text-secondary">{venue.address}</p>
        )}

        {/* Quick rating (local) */}
        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMyRating(n)}
              className="p-0.5"
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
              title={`Rate ${n}`}
            >
              <Star className={`h-4 w-4 ${n <= myRating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary'}`} />
            </button>
          ))}
          {myRating > 0 && <span className="ml-2 text-sm text-secondary">You rated {myRating}/5</span>}
        </div>

        {/* Actions (attributions removed per request) */}
        <div className="mt-2 flex items-center justify-between text-sm">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
            aria-label={`Get directions to ${venue.name}`}
          >
            Directions
          </a>
        </div>
      </div>
    </div>
  )
}
