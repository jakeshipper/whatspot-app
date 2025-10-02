// app/api/places/photo/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

const GOOGLE_KEY =
  process.env.GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

export async function GET(req: Request) {
  try {
    if (!GOOGLE_KEY) {
      return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const nameParam = searchParams.get('name') // e.g. "places/abc/photos/def"
    const wParam = searchParams.get('w') || '800'

    if (!nameParam) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    // Avoid double-encoding: decode what we encoded on the server route
    const name = decodeURIComponent(nameParam)
    const w = parseInt(wParam, 10)
    const maxWidth = Number.isFinite(w) ? Math.max(50, Math.min(1600, w)) : 800

    const googleUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidth}`

    const r = await fetch(googleUrl, {
      headers: { 'X-Goog-Api-Key': GOOGLE_KEY },
      cache: 'force-cache',
    })

    if (!r.ok || !r.body) {
      const detail = await r.text().catch(() => '')
      console.error('PHOTO_PROXY_FAIL', { name, status: r.status, detail })
      return NextResponse.json({ error: 'photo_fetch_failed', detail }, { status: 502 })
    }

    const ct = r.headers.get('content-type') || 'image/jpeg'
    return new NextResponse(r.body, {
      headers: {
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=86400', // 1 day
      },
    })
  } catch {
    return NextResponse.json({ error: 'unexpected_error' }, { status: 500 })
  }
}
