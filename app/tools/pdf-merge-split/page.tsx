import type { Metadata } from 'next'
import PdfMergeSplit from './PdfMergeSplit'

export const metadata: Metadata = {
  title: 'Free PDF Merge & Split Tool | PDFCalculate',
  description: 'Merge multiple PDF files into a single document, or split pages from a PDF. 100% client-side, secure, and private.',
}

export default function Page() {
  return <PdfMergeSplit />
}
