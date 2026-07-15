import { TOOLS } from '@/lib/tools-registry'
import HomePageClient from '@/components/HomePageClient'
import type { Metadata } from 'next'
import AdSlot from '@/components/layout/AdSlot'

export const metadata: Metadata = {
  title: 'PDFCalculate — Free PDF Tools & Financial Calculators',
  description: 'Free PDF tools and financial calculators: merge, split, organize, watermark, or rotate PDFs, plus compound interest, VAT, and bond calculators.',
}

export default function HomePage() {
  return (
    <>
      <HomePageClient initialTools={TOOLS} />
    </>
  )
}
