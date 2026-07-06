import type { Metadata } from 'next'
import PdfRotate from './PdfRotate'

export const metadata: Metadata = {
  title: 'Free Rotate PDF Pages | ToolsKit',
  description: 'Rotate PDF pages by 90, 180, or 270 degrees. Secure client-side processing, no file uploads.',
}

export default function Page() {
  return <PdfRotate />
}
