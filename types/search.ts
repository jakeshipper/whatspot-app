// types/search.ts
export type LatLng = { lat: number; lng: number }

export type BudgetTier = '$' | '$$' | '$$$' | '$$$$'

export type SearchParams = {
  location: LatLng
  radius_km: number
  budget_max: BudgetTier
  chips: string[]
  category: string | null
  query?: string
}

export type SearchUpdates = Partial<SearchParams>

export type Venue = {
  id: string | number
  name: string
  latitude: number
  longitude: number
  place_id?: string
  category?: string
  price_level?: BudgetTier | string
  distance_km?: number
  rating?: number
  review_count?: number
  justification?: string
}

export type RecommendationsResponse = {
  results: Venue[]
}
