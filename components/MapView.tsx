'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'

type Venue = {
  place_id: string
  name: string
  latitude: number
  longitude: number
  rating?: number
  distance_km?: number
}

type Props = {
  center: { lat: number; lng: number }
  venues: Venue[]
  radiusKm?: number // search radius in km
  zoom?: number
}

// Inline SVG -> data URL so we don't rely on external images
const pinSvg = encodeURIComponent(`
<svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
      <feOffset in="blur" dx="0" dy="2" result="offset"/>
      <feMerge><feMergeNode in="offset"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <path d="M23 4C14.7157 4 8 10.7157 8 19C8 27.2843 23 42 23 42C23 42 38 27.2843 38 19C38 10.7157 31.2843 4 23 4Z" fill="#72c677"/>
    <circle cx="23" cy="19" r="6.5" fill="white" fill-opacity="0.95"/>
  </g>
</svg>
`);

const pinIcon = L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
  iconSize: [32, 44],
  iconAnchor: [16, 42],
  popupAnchor: [0, -36],
  className: 'whatspot-pin',
})

export default function MapView({ center, venues, radiusKm = 5, zoom = 13 }: Props) {
  const markers = useMemo(
    () =>
      (venues ?? [])
        .filter(
          (v) =>
            typeof v.latitude === 'number' &&
            Number.isFinite(v.latitude) &&
            typeof v.longitude === 'number' &&
            Number.isFinite(v.longitude)
        )
        .map((v) => ({
          id: v.place_id,
          lat: v.latitude,
          lng: v.longitude,
          name: v.name,
          rating: v.rating,
          distance_km:
            typeof v.distance_km === 'number'
              ? Number(v.distance_km.toFixed(2))
              : undefined,
        })),
    [venues]
  )

  const radiusMeters = Math.max(1, Math.round((radiusKm ?? 0) * 1000))

  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-white/40 bg-white/30 shadow-md backdrop-blur-md">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Softer basemap (CARTO Positron) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap, &copy; CARTO'
        />

        {/* Shaded search radius */}
        <Circle
          center={[center.lat, center.lng]}
          radius={radiusMeters}
          pathOptions={{
            color: '#72c677',
            weight: 1.5,
            fillColor: '#72c677',
            fillOpacity: 0.12,
          }}
        />

        {/* User pin */}
        <Marker position={[center.lat, center.lng]} icon={pinIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-medium">Search center</div>
              <div>Radius: {Math.round(radiusMeters / 100) / 10} km</div>
            </div>
          </Popup>
        </Marker>

        {/* Venue pins */}
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={pinIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{m.name}</div>
                {typeof m.rating === 'number' && <div>⭐ {m.rating}</div>}
                {typeof m.distance_km === 'number' && (
                  <div>{m.distance_km} km away</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
