
import { createClient } from '@/utils/supabase/server'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HobbyRent | Rent Dirt, Watersports, Trailers & Tools',
  description: 'The premium marketplace for renting outdoor gear and tools.',
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
