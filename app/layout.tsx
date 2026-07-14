import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'ToolsKit — Free SA Financial Calculators & Online Tools',
    template: '%s | ToolsKit',
  },
  description: 'Free South African financial calculators, productivity tools, and everyday utilities. PAYE, bond, VAT calculators built for South Africa.',
  keywords: ['calculators south africa', 'free tools', 'bond calculator', 'paye calculator', 'vat calculator south africa'],
  openGraph: {
    type: 'website',
    siteName: 'ToolsKit',
    locale: 'en_ZA',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6279329252340316"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
