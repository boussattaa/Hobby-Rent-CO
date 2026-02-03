
import { createClient } from '@/utils/supabase/server'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <main style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
