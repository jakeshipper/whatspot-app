'use client'

type Props = {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

export function RadiusSlider({
  value,
  onValueChange,
  min = 1,
  max = 100,
  step = 1,
  label = 'Search radius (km)',
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-primary font-medium">{label}</span>
        <span className="text-secondary">{value} km</span>
      </div>
      <input
        type="range"
        className="range-input w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
      />
    </div>
  )
}
