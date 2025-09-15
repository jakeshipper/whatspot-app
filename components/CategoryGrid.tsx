'use client'

import { Card } from '@/components/ui/card'
import { Coffee, Utensils, Wine, Croissant, Cake, Sandwich } from 'lucide-react'

interface CategoryGridProps {
  onCategorySelect?: (category: string) => void
  activeCategory?: string | null
}

const categories = [
  { name: 'Restaurants', icon: Utensils, color: 'bg-red-100 hover:bg-red-200', activeColor: 'bg-red-300 ring-2 ring-red-500' },
  { name: 'Bars', icon: Wine, color: 'bg-purple-100 hover:bg-purple-200', activeColor: 'bg-purple-300 ring-2 ring-purple-500' },
  { name: 'Coffee & Cafés', icon: Coffee, color: 'bg-brown-100 hover:bg-brown-200', activeColor: 'bg-amber-300 ring-2 ring-amber-500' },
  { name: 'Brunch', icon: Croissant, color: 'bg-yellow-100 hover:bg-yellow-200', activeColor: 'bg-yellow-300 ring-2 ring-yellow-500' },
  { name: 'Bakeries & Desserts', icon: Cake, color: 'bg-pink-100 hover:bg-pink-200', activeColor: 'bg-pink-300 ring-2 ring-pink-500' },
  { name: 'Quick Bites', icon: Sandwich, color: 'bg-green-100 hover:bg-green-200', activeColor: 'bg-green-300 ring-2 ring-green-500' },
]

export function CategoryGrid({ onCategorySelect, activeCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = activeCategory === category.name
        
        return (
          <Card
            key={category.name}
            className={`p-6 cursor-pointer transition-all ${
              isActive ? category.activeColor : category.color
            }`}
            onClick={() => onCategorySelect?.(category.name)}
          >
            <div className="flex flex-col items-center text-center">
              <Icon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}