
import { createClient } from '@/utils/supabase/server'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://hobby-rent-co.vercel.app'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'HobbyRent | Rent Offroad, Watersports, Trailers & Tools',
  description: 'The premium marketplace for renting outdoor gear and tools. Turn your toys into income.',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'HobbyRent | Rent Offroad, Watersports, Trailers & Tools',
    description: 'Turn your toys into income. Rent them out when you\'re not using them.',
    url: SITE_URL,
    siteName: 'HobbyRent',
    images: [
      {
        url: '/api/og?tenantId=hobbyrent&title=HobbyRent%20Gear%20Rentals',
        width: 1200,
        height: 630,
        alt: 'HobbyRent - Turn your toys into income',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HobbyRent | Rent Offroad, Watersports, Trailers & Tools',
    description: 'Turn your toys into income. Rent them out when you\'re not using them.',
    images: ['/api/og?tenantId=hobbyrent&title=HobbyRent%20Gear%20Rentals'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HobbyRent',
  },
  formatDetection: {
    telephone: false,
  },
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HobbyRent',
    url: 'https://www.hobbyrent.com',
    logo: 'https://www.hobbyrent.com/icon.png',
    description: 'The premium marketplace for renting outdoor gear and tools.',
    sameAs: [
      'https://twitter.com/hobbyrent',
      'https://instagram.com/hobbyrent'
    ]
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar user={user} />
        <main style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
          {children}
        </main>
        <Footer />
        <ChatWidget />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}

