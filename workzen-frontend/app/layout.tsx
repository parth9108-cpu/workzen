import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore: CSS module declarations not found in this TS environment
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WorkZen - HRMS',
  description: 'Modern HR Management System',
  icons: {
    icon: '/images/favicon.ico',
    apple: '/images/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
