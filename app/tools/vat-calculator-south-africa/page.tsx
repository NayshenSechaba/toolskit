import { Metadata } from 'next'
import VatCalculatorClient from './VatCalculator'

export const metadata: Metadata = {
  title: 'VAT Calculator South Africa (15%) | ToolsKit',
  description:
    'Add or remove 15% VAT from any amount instantly. Free South African VAT calculator for invoices, quotes, and bookkeeping. Updated for 2025.',
}

export default function VatCalculatorPage() {
  return <VatCalculatorClient />
}
