'use client'

interface RadiusSliderProps {
  value: number
  onValueChange: (v: number) => void
  min?: number
  max?: number
}

export function RadiusSlider({ value, onValueChange, min = 1, max = 50 }: RadiusSliderProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">Search radius</span>
        <span className="text-sm text-secondary">{value} km</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(255,255,255,0.5)] outline-none"
        aria-label="Search radius in kilometers"
      />
      <div className="mt-1 flex justify-between text-xs text-secondary">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  )
}
