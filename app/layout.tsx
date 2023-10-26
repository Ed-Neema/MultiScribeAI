import type { Metadata } from 'next'
import { Barlow, Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/components/Modal-Provider'
import { ToasterProvider } from '@/components/ToasterProvider'
// const inter = Inter({ subsets: ['latin'] })
const barlow = Barlow({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})
export const metadata: Metadata = {
  icons: {
    icon: '/faviconLogo.ico',
  },
  title: 'MultiScribeAI',
  description: 'AI Chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={barlow.className}>          
          <ModalProvider />
          <ToasterProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
