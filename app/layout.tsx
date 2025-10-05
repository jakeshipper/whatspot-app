import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Whatspot',
  description: 'Discover great spots nearby',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen sunrise-bg text-primary antialiased font-sans`}>
        <header className="mx-auto w-full max-w-4xl px-4 pt-6">
          <h1 className="text-center text-4xl font-bold">Whatspot</h1>
          {/* Top nav on desktop/tablet */}
          <div className="mt-6 hidden md:block">
            <Nav variant="top" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 md:pb-10">
          {children}
        </main>

        {/* Bottom nav on mobile */}
        <div className="md:hidden">
          <Nav variant="bottom" />
        </div>
      </body>
    </html>
  )
}
