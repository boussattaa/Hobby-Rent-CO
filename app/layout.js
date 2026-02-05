
import { createClient } from '@/utils/supabase/server'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HobbyRent | Rent Offroad, Watersports, Trailers & Tools',
  description: 'The premium marketplace for renting outdoor gear and tools. Turn your toys into income.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'HobbyRent | Rent Offroad, Watersports, Trailers & Tools',
    description: 'Turn your toys into income. Rent them out when you\'re not using them.',
    url: 'https://www.hobbyrent.com',
    siteName: 'HobbyRent',
    images: [
      {
        url: '/images/og-main.jpg',
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
    images: ['/images/og-main.jpg'],
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
        <SpeedInsights />
      </body>
    </html>
  )
}
