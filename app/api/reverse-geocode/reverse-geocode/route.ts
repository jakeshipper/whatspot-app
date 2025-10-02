// app/api/reverse-geocode/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lng)}` +
    `&zoom=10&addressdetails=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'whatspot/1.0 (contact: you@example.com)',
        Accept: 'application/json',
      },
      // cache for a day to avoid hammering the service
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ cityLabel: null }, { status: 200 })
    }

    const data = (await res.json()) as {
      address?: Record<string, string | undefined>
      display_name?: string
    }

    const a = data.address ?? {}
    const city =
      a.city || a.town || a.village || a.hamlet || a.locality || a.county
    const state = a.state
    const cityLabel =
      [city, state].filter(Boolean).join(', ') || data.display_name || null

    return NextResponse.json({ cityLabel, address: a })
  } catch {
    return NextResponse.json({ cityLabel: null }, { status: 200 })
  }
}
