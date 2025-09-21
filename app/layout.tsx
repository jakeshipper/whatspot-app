import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Whatspot',
  description: 'Discover great spots nearby',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
         className={`${inter.className} min-h-screen sunrise-bg text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
