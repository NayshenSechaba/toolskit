import type { Metadata } from 'next'
import PdfRemovePages from './PdfRemovePages'

export const metadata: Metadata = {
  title: 'Free Remove PDF Pages | PDFCalculate',
  description: 'Delete unwanted pages from your PDF documents. Quick, secure client-side page removal.',
}

export default function Page() {
  return <PdfRemovePages />
}
