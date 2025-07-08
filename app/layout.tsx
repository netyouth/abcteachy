import type { Metadata } from 'next'
import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ABC Teachy - Learn English with AI-Powered Teachies',
  description: 'Learn English with our fun, AI-powered Teachies who make English learning engaging and effective',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
} 