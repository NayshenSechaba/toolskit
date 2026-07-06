'use client'

import dynamic from 'next/dynamic'

const PdfOrganizeClient = dynamic(() => import('./PdfOrganizeClient'), { ssr: false })

export default function OrganizeWrapper() {
  return <PdfOrganizeClient />
}
