import { Metadata } from 'next'
import BondCalculator from './BondCalculator'

export const metadata: Metadata = {
  title: 'Bond / Home Loan Calculator South Africa | PDFCalculate',
  description:
    'Calculate your South African home loan repayment, total interest, transfer duty, and bond registration costs. Updated for 2025 SARB prime rate of 11.75%.',
}

export default function BondCalculatorPage() {
  return <BondCalculator />
}
