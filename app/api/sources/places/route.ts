// app/api/sources/places/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

const GOOGLE_KEY =
  process.env.GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

type LatLng = { lat: number; lng: number }

type GooglePhoto = {
  name: string
  widthPx?: number
  heightPx?: number
  authorAttributions?: Array<{ displayName?: string; uri?: string }>
}

type GooglePlace = {
  id: string
  displayName?: { text?: string }
  location?: { latitude: number; longitude: number }
  rating?: number
  userRatingCount?: number
  priceLevel?: 'PRICE_LEVEL_INEXPENSIVE' | 'PRICE_LEVEL_MODERATE' | 'PRICE_LEVEL_EXPENSIVE' | 'PRICE_LEVEL_VERY_EXPENSIVE'
  types?: string[]
  currentOpeningHours?: { openNow?: boolean }
  websiteUri?: string
  shortFormattedAddress?: string
  photos?: GooglePhoto[]
}

type TextSearchResponse = { places?: GooglePlace[] }
type Budget = '$' | '$$' | '$$$' | '$$$$'

function priceLevelToDollars(level?: GooglePlace['priceLevel']): Budget | undefined {
  switch (level) {
    case 'PRICE_LEVEL_INEXPENSIVE': return '$'
    case 'PRICE_LEVEL_MODERATE':    return '$$'
    case 'PRICE_LEVEL_EXPENSIVE':   return '$$$'
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return '$$$$'
    default: return undefined
  }
}

function haversine(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

// Build a PROXY url so we don't expose the Google key to the browser
function photoProxyUrl(photo?: GooglePhoto): string | undefined {
  if (!photo) return undefined
  const params = new URLSearchParams({ name: photo.name, w: '800' })
  return `/api/places/photo?${params.toString()}`
}

export async function POST(req: Request) {
  try {
    if (!GOOGLE_KEY) {
      console.error('GOOGLE_MAPS_API_KEY not set.')
      return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 })
    }

    const {
      lat, lng, textQuery, radius_m, open_now, price_level_max,
    }: {
      lat: number; lng: number; textQuery: string; radius_m: number;
      open_now?: boolean; price_level_max?: Budget;
    } = await req.json()

    // Clamp to [1, 50000] meters
    const safeRadius = Number.isFinite(radius_m)
      ? Math.max(1, Math.min(50000, Math.round(radius_m)))
      : 1000

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.types',
      'places.shortFormattedAddress',
      'places.currentOpeningHours',
      'places.websiteUri',
      'places.photos',
    ].join(',')

    const body: Record<string, unknown> = {
      textQuery: textQuery?.trim() || 'restaurants',
      maxResultCount: 20,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: safeRadius } },
    }
    if (open_now !== undefined) body.openNow = open_now

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
      next: { revalidate: 900 },
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('Places search failed', res.status, detail)
      return NextResponse.json({ error: 'places_search_failed', detail }, { status: res.status })
    }

    const data = (await res.json()) as TextSearchResponse
    const center: LatLng = { lat, lng }

    const normalized = (data.places ?? []).map((p) => {
      const price = priceLevelToDollars(p.priceLevel)
      const dist =
        p.location?.latitude !== undefined && p.location?.longitude !== undefined
          ? haversine(center, { lat: p.location.latitude, lng: p.location.longitude })
          : undefined

      const firstPhoto = p.photos?.[0]
      const attributions =
        firstPhoto?.authorAttributions?.map(a => ({ displayName: a.displayName, uri: a.uri })) ?? []

      return {
        id: p.id,
        place_id: p.id,
        name: p.displayName?.text ?? 'Unknown',
        latitude: p.location?.latitude ?? 0,
        longitude: p.location?.longitude ?? 0,
        category: p.types?.[0],
        price_level: price,
        rating: p.rating,
        review_count: p.userRatingCount,
        address: p.shortFormattedAddress,
        website: p.websiteUri,
        open_now: p.currentOpeningHours?.openNow,
        distance_km: dist,
        photo_url: photoProxyUrl(firstPhoto),          // ← proxied URL
        photo_attributions: attributions,
      }
    })

    const priceRank: Record<Budget, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
    const filtered =
      price_level_max
        ? normalized.filter((v) => !v.price_level || priceRank[v.price_level] <= priceRank[price_level_max])
        : normalized

    return NextResponse.json({ results: filtered })
  } catch (err) {
    console.error('Unexpected error in /api/sources/places', err)
    return NextResponse.json({ error: 'unexpected_error' }, { status: 500 })
  }
}
