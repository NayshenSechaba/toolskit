import type { Metadata } from 'next'
import PdfPageNumbers from './PdfPageNumbers'

export const metadata: Metadata = {
  title: 'Free Add PDF Page Numbers | ToolsKit',
  description: 'Number your PDF pages automatically. Customizable position, styling, cover page exclusion, and formatting options.',
}

export default function Page() {
  return <PdfPageNumbers />
}
