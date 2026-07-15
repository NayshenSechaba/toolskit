import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'PDFCalculate — Free PDF Tools & Financial Calculators',
    template: '%s | PDFCalculate',
  },
  description: 'Free PDF tools, document utilities, and financial calculators. Merge, split, organize, watermark, or sign PDFs, plus compound interest and tax calculators.',
  keywords: ['pdf tools', 'free calculators', 'pdf merge', 'pdf split', 'pdf organize', 'pdfcalculate'],
  openGraph: {
    type: 'website',
    siteName: 'PDFCalculate',
    locale: 'en_US',
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
        <meta name="google-adsense-account" content="ca-pub-6279329252340316" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6279329252340316"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
