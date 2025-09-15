'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'

interface RadiusSliderProps {
  value?: number
  onValueChange?: (value: number) => void
}

export function RadiusSlider({ value = 2, onValueChange }: RadiusSliderProps) {
  const [radius, setRadius] = useState([value])

  useEffect(() => {
    setRadius([value])
  }, [value])

  const handleChange = (newValue: number[]) => {
    setRadius(newValue)
    onValueChange?.(newValue[0])
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Search Radius</span>
        <span>{radius[0]} km</span>
      </div>
      <Slider
        value={radius}
        onValueChange={handleChange}
        min={1}
        max={20}
        step={1}
        className="w-full"
      />
    </div>
  )
}