'use client'

import { Coffee, Utensils, Wine, Croissant, Cake, Sandwich } from 'lucide-react'

interface CategoryGridProps {
  onCategorySelect?: (category: string) => void
  activeCategory?: string | null
}

const categories: Array<{ name: string; icon: React.ComponentType<{ className?: string }> }> = [
  { name: 'Restaurants', icon: Utensils },
  { name: 'Bars', icon: Wine },
  { name: 'Coffee & Cafés', icon: Coffee },
  { name: 'Brunch', icon: Croissant },
  { name: 'Bakeries & Desserts', icon: Cake },
  { name: 'Quick Bites', icon: Sandwich },
]

export function CategoryGrid({ onCategorySelect, activeCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map(({ name, icon: Icon }) => {
        const isActive = activeCategory === name

        const baseTile =
          'w-full h-24 sm:h-28 md:h-32 rounded-xl flex flex-col items-center justify-center gap-2 text-primary transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:#72c677]'
        const activeTile = 'glass-strong ring-2 ring-[color:#72c677]'
        const inactiveTile = 'glass-panel hover:shadow-xl'

        return (
          <button
            key={name}
            type="button"
            aria-pressed={isActive}
            onClick={() => onCategorySelect?.(name)}
            className={`${baseTile} ${isActive ? activeTile : inactiveTile}`}
          >
            <Icon className="mb-1 h-7 w-7 md:h-8 md:w-8" />
            <span className="text-center text-sm font-medium">{name}</span>
          </button>
        )
      })}
    </div>
  )
}
