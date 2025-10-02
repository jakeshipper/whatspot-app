'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, List, User } from 'lucide-react'

type Props = {
  variant: 'top' | 'bottom'
}

const items = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/lists', label: 'Lists', Icon: List },
  { href: '/account', label: 'Account', Icon: User },
]

export default function Nav({ variant }: Props) {
  const pathname = usePathname() || '/'

  if (variant === 'top') {
    return (
      <nav className="flex items-center justify-center gap-2">
        <div className="flex overflow-hidden rounded-xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-md">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-2 px-4 py-2 text-sm transition',
                  active
                    ? 'bg-white/70 text-primary'
                    : 'text-secondary hover:bg-white/50',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  // bottom (mobile)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/50 bg-white/70 backdrop-blur-md">
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex flex-col items-center justify-center gap-1 py-3 text-xs',
                active ? 'text-primary' : 'text-secondary',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
