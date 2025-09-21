'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onFiltersChange: (filters: string[]) => void
}

/**
 * Default filters requested:
 * 'Hidden gem', 'Popular spot', 'Vegetarian', 'Vegan', 'Open now', '$', '$$', '$$$'
 */
const DEFAULT_FILTERS = [
  'Hidden gem',
  'Popular spot',
  'Vegetarian',
  'Vegan',
  'Open now',
  '$',
  '$$',
  '$$$',
] as const

export function FilterChips({ onFiltersChange }: Props) {
  // Track selected as an array for simple equality logic + effect dependencies
  const [selected, setSelected] = useState<string[]>([])
  const onChangeRef = useRef(onFiltersChange)

  // Keep a stable ref to the latest callback to avoid extra effect runs
  useEffect(() => {
    onChangeRef.current = onFiltersChange
  }, [onFiltersChange])

  // Notify parent AFTER commit to avoid "update parent while rendering child"
  useEffect(() => {
    onChangeRef.current(selected)
  }, [selected])

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_FILTERS.map((label) => {
        const value = label
        const isSelected = selected.includes(value)

        // Visuals: faint green fill + visible greenish border when selected
        const base =
          'px-3 py-1.5 rounded-full text-sm transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:#72c677]'
        const selectedCls =
          'bg-[rgba(114,198,119,0.12)] border-[rgba(114,198,119,0.35)] text-primary'
        const unselectedCls =
          'bg-white/50 border-white/60 text-primary hover:bg-white/70'

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(value)}
            className={`${base} ${isSelected ? selectedCls : unselectedCls}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
