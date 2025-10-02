// app/api/recommendations/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

type Budget = '$' | '$$' | '$$$' | '$$$$'
type LatLng = { lat: number; lng: number }

type SearchBody = {
  location: LatLng
  radius_km: number
  budget_max: Budget
  chips: string[]
  category: string | null
  query?: string
}

type Candidate = {
  id: string
  place_id: string
  name: string
  latitude: number
  longitude: number
  category?: string          // Google primary type, e.g., "middle_eastern_restaurant"
  price_level?: Budget
  rating?: number
  review_count?: number
  distance_km?: number
  address?: string
  website?: string
  open_now?: boolean
  photo_url?: string
  photo_attributions?: Array<{ displayName?: string; uri?: string }>
}

// ---------- helpers: normalization & formatting ----------
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

function prettyType(raw?: string): string | undefined {
  if (!raw) return undefined
  if (TYPE_LABELS[raw]) return TYPE_LABELS[raw]
  const cleaned = raw.replace(/_restaurant$/, '').replace(/_/g, ' ')
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

function normalizeChips(chips: string[]): string[] {
  return chips.map((c) => c.trim().toLowerCase())
}

function deriveIntentFromQuery(q?: string) {
  const out: { vegan?: boolean; vegetarian?: boolean; open_now?: boolean; terms?: string[] } = {}
  if (!q) return out
  const lc = q.toLowerCase()

  if (/\bvegan\b/.test(lc)) out.vegan = true
  if (/\bvegetarian|veggie\b/.test(lc)) out.vegetarian = true
  if (/\bopen now|open\b/.test(lc)) out.open_now = true

  // Extract a couple of free terms for the text query
  const terms = lc
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['the', 'and', 'near', 'me', 'open', 'now'].includes(t))
  if (terms.length) out.terms = terms.slice(0, 5)

  return out
}

// ---------- scoring ----------
const PRICE_RANK: Record<Budget, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }

function baseScore(v: Candidate, budgetMax?: Budget): number {
  const rating = typeof v.rating === 'number' ? v.rating : 0
  const reviews = typeof v.review_count === 'number' ? Math.log1p(v.review_count) : 0
  const distance = typeof v.distance_km === 'number' ? v.distance_km : 0
  const pricePenalty =
    budgetMax && v.price_level
      ? Math.max(0, (PRICE_RANK[v.price_level] ?? 0) - PRICE_RANK[budgetMax]) * 0.45
      : 0
  const distancePenalty = Math.max(0, distance - 2) * 0.08 // stronger penalty beyond 2km
  return rating * (1 + reviews * 0.12) - pricePenalty - distancePenalty
}

function chipBoosts(v: Candidate, chips: string[], intents: ReturnType<typeof deriveIntentFromQuery>): number {
  let boost = 0
  const cset = new Set(chips)

  // Open now
  if ((cset.has('open now') || intents.open_now) && v.open_now) boost += 0.3

  // Dietary
  const type = v.category ?? ''
  if (cset.has('vegan') || intents.vegan) boost += 0.25 // heuristic
  if (cset.has('vegetarian') || intents.vegetarian) boost += 0.15

  return boost
}

function categoryBoost(v: Candidate, selectedCategory?: string | null, terms: string[] = []): number {
  if (!selectedCategory && terms.length === 0) return 0
  let boost = 0
  const label = (prettyType(v.category) || '').toLowerCase()

  if (selectedCategory && label.includes(selectedCategory.toLowerCase())) boost += 0.4

  // crude term match
  for (const t of terms) {
    if (!t) continue
    if (label.includes(t)) boost += 0.1
  }
  return Math.min(boost, 0.6)
}

// ---------- main handler ----------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SearchBody
    const { location, radius_km, budget_max, chips, category, query } = body

    const origin = new URL(req.url).origin

    // Intent from free text
    const intents = deriveIntentFromQuery(query)
    const normChips = normalizeChips(chips)

    // Build a textQuery for Places: prefer explicit category/query
    const terms: string[] = []
    if (category) terms.push(category)
    if (intents.terms?.length) terms.push(...intents.terms)
    if (normChips.includes('vegan')) terms.push('vegan')
    if (normChips.includes('vegetarian')) terms.push('vegetarian')

    const textQuery = (terms.join(' ').trim() || query || 'restaurants').slice(0, 128)

    const openNow = normChips.includes('open now') || intents.open_now ? true : undefined

    // Clamp radius to [1m, 50km]
    const radiusM = Number.isFinite(radius_km)
      ? Math.max(1, Math.min(50000, Math.round(radius_km * 1000)))
      : 1000

    // Fetch candidates from our Places source
    const placesRes = await fetch(new URL('/api/sources/places', origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        textQuery,
        radius_m: radiusM,
        open_now: openNow,
        price_level_max: budget_max,
        type: category ?? undefined,
      }),
    })

    if (!placesRes.ok) {
      const detail = await placesRes.text()
      return NextResponse.json({ error: 'places_source_failed', detail }, { status: 500 })
    }

    const { results } = (await placesRes.json()) as { results: Candidate[] }
    if (!results?.length) return NextResponse.json({ results: [] })

    // Pre-rank deterministically with boosts
    const preRanked = results
      .map((v) => {
        const s =
          baseScore(v, budget_max) +
          chipBoosts(v, normChips, intents) +
          categoryBoost(v, category, intents.terms ?? [])
        return { v, s }
      })
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map(({ v }) => v)

    // Optional LLM justifications
    let justifications: Record<string, string> = {}
    if (OPENAI_API_KEY) {
      try {
        const items = preRanked.map((v) => ({
          id: v.place_id,
          name: v.name,
          rating: v.rating,
          reviews: v.review_count,
          price: v.price_level,
          open_now: v.open_now,
          category: prettyType(v.category),
          address: v.address,
          distance_km: v.distance_km !== undefined ? Number(v.distance_km.toFixed(2)) : undefined,
        }))

        const completion = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            messages: [
              {
                role: 'system',
                content:
                  'Return strictly JSON with one-line factual justifications per venue using ONLY provided facts. No speculation.',
              },
              {
                role: 'user',
                content:
                  `Budget max: ${budget_max}. Query: "${query ?? textQuery}".\n` +
                  `Return {"justifications":{"<place_id>":"<one line>"}} for all items below:\n\n` +
                  JSON.stringify({ items }),
              },
            ],
          }),
        })

        if (completion.ok) {
          const data = await completion.json()
          const content = data?.choices?.[0]?.message?.content ?? '{}'
          const parsed = JSON.parse(content) as { justifications?: Record<string, string> }
          if (parsed?.justifications && typeof parsed.justifications === 'object') {
            justifications = parsed.justifications
          }
        }
      } catch {
        // ignore LLM failures
      }
    }

    // Final shape: pretty category + rounded distance
    const final = preRanked.slice(0, 15).map((v) => ({
      ...v,
      category: prettyType(v.category),
      distance_km:
        typeof v.distance_km === 'number' ? Number(v.distance_km.toFixed(2)) : undefined,
      justification: justifications[v.place_id],
    }))

    return NextResponse.json({ results: final })
  } catch {
    return NextResponse.json({ error: 'unexpected_error' }, { status: 500 })
  }
}
