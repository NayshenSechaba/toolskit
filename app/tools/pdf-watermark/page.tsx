import type { Metadata } from 'next'
import PdfWatermark from './PdfWatermark'

export const metadata: Metadata = {
  title: 'Free Watermark PDF | PDFCalculate',
  description: 'Stamp custom text watermarks onto your PDF pages. Secure local processing with custom color, transparency, and angles.',
}

export default function Page() {
  return <PdfWatermark />
}
