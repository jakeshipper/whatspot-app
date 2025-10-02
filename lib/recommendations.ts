// lib/recommendations.ts
import type { SearchParams, RecommendationsResponse } from '@/types/search'

export async function getRecommendations(params: SearchParams & { chips: string[] }) {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const data = await res.json()
      detail = JSON.stringify(data)
    } catch {
      detail = await res.text()
    }
    throw new Error(`Recommendations failed: ${res.status} ${res.statusText} ${detail}`)
  }

  return (await res.json()) as RecommendationsResponse
}
