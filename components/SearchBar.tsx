'use client'

import { useState } from 'react'

type Props = {
  onSearch: (query: string, location: string) => void
  /** If true, shows inline location text next to the input (defaults to false). */
  showInlineLocation?: boolean
}

export function SearchBar({ onSearch, showInlineLocation = false }: Props) {
  const [query, setQuery] = useState<string>('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(query, '')
      }}
      className="flex w-full items-center gap-3"
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places, vibes, neighborhoods…"
        className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-base text-primary backdrop-blur placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:#72c677]"
      />
      <button type="submit" className="btn-primary px-5 py-3">Search</button>

      {showInlineLocation && (
        <div className="ml-3 text-sm text-secondary">
          {/* Inline location (optional). Intentionally left empty by default. */}
        </div>
      )}
    </form>
  )
}
