import { Metadata } from 'next'
import CompoundInterestClient from './CompoundInterestCalculator'

export const metadata: Metadata = {
  title: 'Compound Interest & Savings Calculator | PDFCalculate',
  description:
    'Calculate compound interest with monthly contributions. Model your Retirement Annuity (RA), TFSA, or savings growth year by year. Free South African savings calculator.',
}

export default function CompoundInterestPage() {
  return <CompoundInterestClient />
}
