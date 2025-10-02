'use client'

interface SortControlProps {
  value: 'relevance' | 'distance' | 'alpha'
  onChange: (v: 'relevance' | 'distance' | 'alpha') => void
}

export default function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-secondary">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortControlProps['value'])}
        className="rounded-md border border-white/40 bg-white/70 px-3 py-2 text-primary shadow-sm backdrop-blur-md focus:outline-none"
        aria-label="Sort venues"
      >
        <option value="relevance">Relevance</option>
        <option value="distance">Distance</option>
        <option value="alpha">Alphabetical</option>
      </select>
    </div>
  )
}
