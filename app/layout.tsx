import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'

import { cn } from '@/lib/utils'

import './globals.css'
import Providers from '@/components/providers'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChatbotWrapper } from '@/components/chatbot'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'Roy Lo',
  description: 'Startup founder turned product builder with a deep technical edge. I create and scale software products that bridge user needs with business impact. Former CEO of BotBonnie, now exploring what’s next.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-screen flex-col font-sans antialiased',
          inter.variable,
          playfair.variable
        )}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <main className='grow'>{children}</main>
          <Footer />
          <ChatbotWrapper />
        </Providers>
      </body>
    </html>
  )
}