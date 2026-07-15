import type { Metadata } from 'next'
import OrganizeWrapper from './OrganizeWrapper'

export const metadata: Metadata = {
  title: 'Free Organize PDF Pages Visually | PDFCalculate',
  description: 'Re-order, rotate, or delete pages in your PDF document visually. Simple drag-and-drop page editor, 100% private and client-side.',
}

export default function Page() {
  return <OrganizeWrapper />
}
