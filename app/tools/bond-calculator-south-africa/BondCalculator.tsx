'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import {
  BondInputs,
  BondResults,
  calculateBond,
  calculateTransferDuty,
  calculateBondRegistrationCost,
} from '@/lib/calculators/bond'

const fmt = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

const fmtShort = (n: number) => fmt.format(n)

const defaultInputs: BondInputs = {
  purchasePrice: 1500000,
  deposit: 150000,
  interestRate: 11.75,
  termYears: 20,
  includeBondCosts: true,
}

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: 'What is the current prime lending rate in South Africa?',
    a: 'As of 2025, the SARB prime lending rate is 11.75%. Most banks offer home loans at prime or prime plus a small margin (e.g. prime + 0.5% for higher-risk borrowers). Use this calculator with the exact rate your bank quoted you.',
  },
  {
    q: 'What is transfer duty and who pays it?',
    a: 'Transfer duty is a tax levied by SARS on the purchase of immovable property in South Africa. The buyer pays it. Properties under R1,100,000 are exempt (2024/25 rates). For a R1.5m property, transfer duty is approximately R12,375. New developments sold by a VAT vendor may be exempt from transfer duty but VAT applies instead.',
  },
  {
    q: 'Can I get a bond without a deposit in South Africa?',
    a: "Yes — a 100% bond (no deposit) is possible but banks typically require a strong credit score and stable income. Without a deposit your loan amount is the full purchase price, meaning higher monthly repayments and more total interest paid. Even a 10% deposit (like the R150,000 default here) meaningfully reduces your repayment burden.",
  },
]

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="faq-section">
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Frequently Asked Questions
      </h2>
      {items.map((item, i) => (
        <div key={i} className="faq-item">
          <button
            className="faq-question"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.q}</span>
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div className="faq-answer">{item.a}</div>}
        </div>
      ))}
    </div>
  )
}

export default function BondCalculator() {
  const [inputs, setInputs] = useState<BondInputs>(defaultInputs)
  const [results, setResults] = useState<BondResults | null>(null)

  const recalculate = useCallback((inp: BondInputs) => {
    if (inp.purchasePrice > 0 && inp.interestRate > 0 && inp.termYears > 0) {
      setResults(calculateBond(inp))
    }
  }, [])

  useEffect(() => {
    recalculate(inputs)
  }, [inputs, recalculate])

  function setField<K extends keyof BondInputs>(key: K, value: BondInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const interestPct =
    ((inputs.interestRate - 6) / (25 - 6)) * 100
  const termPct = ((inputs.termYears - 1) / (30 - 1)) * 100

  return (
    <div className="tool-shell">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Bond Calculator</span>
      </nav>

      {/* Header */}
      <div className="tool-header">
        <span className="tool-icon-large" role="img" aria-label="House">🏠</span>
        <h1>Bond / Home Loan Calculator</h1>
        <p>Calculate your monthly bond repayment, total interest, transfer duty, and bond registration costs for any South African property.</p>
      </div>

      <AdSlot size="banner" label="Advertisement" />

      {/* Inputs */}
      <div className="calc-card">
        <div className="calc-grid">
          {/* Purchase Price */}
          <div className="field">
            <label className="label" htmlFor="purchasePrice">Purchase Price</label>
            <div className="input-wrap">
              <span className="input-prefix">R</span>
              <input
                id="purchasePrice"
                type="number"
                className="input input-with-prefix"
                value={inputs.purchasePrice}
                min={100000}
                step={10000}
                onChange={(e) => setField('purchasePrice', Number(e.target.value))}
                aria-label="Purchase price in Rands"
              />
            </div>
          </div>

          {/* Deposit */}
          <div className="field">
            <label className="label" htmlFor="deposit">Deposit</label>
            <div className="input-wrap">
              <span className="input-prefix">R</span>
              <input
                id="deposit"
                type="number"
                className="input input-with-prefix"
                value={inputs.deposit}
                min={0}
                step={5000}
                onChange={(e) => setField('deposit', Number(e.target.value))}
                aria-label="Deposit amount in Rands"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div className="field">
            <label className="label" htmlFor="interestRate">
              Interest Rate — <strong>{inputs.interestRate.toFixed(2)}%</strong>
            </label>
            <div className="input-wrap">
              <input
                id="interestRate"
                type="number"
                className="input input-with-suffix"
                value={inputs.interestRate}
                min={6}
                max={25}
                step={0.25}
                onChange={(e) => setField('interestRate', Number(e.target.value))}
                aria-label="Annual interest rate percentage"
              />
              <span className="input-suffix">%</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min={6}
              max={25}
              step={0.25}
              value={inputs.interestRate}
              onChange={(e) => setField('interestRate', Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--primary) ${interestPct}%, var(--surface-border) ${interestPct}%)`,
              }}
              aria-label="Interest rate slider"
            />
          </div>

          {/* Term */}
          <div className="field">
            <label className="label" htmlFor="termYears">
              Loan Term — <strong>{inputs.termYears} Years</strong>
            </label>
            <div className="input-wrap">
              <input
                id="termYears"
                type="number"
                className="input input-with-suffix"
                value={inputs.termYears}
                min={1}
                max={30}
                step={1}
                onChange={(e) => setField('termYears', Number(e.target.value))}
                aria-label="Loan term in years"
              />
              <span className="input-suffix">Yrs</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min={1}
              max={30}
              step={1}
              value={inputs.termYears}
              onChange={(e) => setField('termYears', Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--primary) ${termPct}%, var(--surface-border) ${termPct}%)`,
              }}
              aria-label="Loan term slider"
            />
          </div>

          {/* Include Bond Costs */}
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="checkbox-field">
              <input
                id="includeBondCosts"
                type="checkbox"
                checked={inputs.includeBondCosts}
                onChange={(e) => setField('includeBondCosts', e.target.checked)}
                aria-label="Include bond and transfer costs"
              />
              <span>Include transfer duty, bond registration &amp; initiation fees</span>
            </label>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="info-box">
        💡 <strong>SARB prime rate is currently 11.75% (2025).</strong> Adjust the interest rate to match your bank&apos;s offered rate. Most banks offer prime or prime + 0.5–2% depending on your credit profile.
      </div>

      {/* Results */}
      {results && (
        <div className="results-card">
          <p className="results-title">📊 Calculation Results</p>

          {/* Hero */}
          <div className="results-hero">
            <div className="results-hero-label">Monthly Repayment</div>
            <div className="results-hero-value">{fmtShort(results.monthlyRepayment)}</div>
          </div>

          <hr className="divider" />

          {/* Results grid */}
          <div className="results-grid">
            <div className="result-item">
              <div className="result-item-label">Loan Amount</div>
              <div className="result-item-value primary">{fmtShort(results.loanAmount)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Total Interest</div>
              <div className="result-item-value negative">{fmtShort(results.totalInterest)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Total Repayment</div>
              <div className="result-item-value">{fmtShort(results.totalRepayment)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Effective Rate</div>
              <div className="result-item-value">{inputs.interestRate.toFixed(2)}% p.a.</div>
            </div>
          </div>

          {/* Upfront costs */}
          {inputs.includeBondCosts && (
            <>
              <hr className="divider" />
              <p className="results-title" style={{ marginBottom: '1rem' }}>🏦 Upfront Costs</p>
              <div className="results-grid">
                <div className="result-item">
                  <div className="result-item-label">Transfer Duty</div>
                  <div className="result-item-value">{fmtShort(results.transferDuty)}</div>
                </div>
                <div className="result-item">
                  <div className="result-item-label">Bond Registration</div>
                  <div className="result-item-value">{fmtShort(results.bondRegistrationCost)}</div>
                </div>
                <div className="result-item">
                  <div className="result-item-label">Initiation Fee</div>
                  <div className="result-item-value">{fmtShort(results.initiationFee)}</div>
                </div>
                <div className="result-item">
                  <div className="result-item-label">Total Upfront Costs</div>
                  <div className="result-item-value negative">{fmtShort(results.totalUpfrontCosts)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Amortisation Table */}
      {results && results.amortisation.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2rem 0 0', color: 'var(--text-primary)' }}>
            Yearly Amortisation Schedule
          </h2>
          <div className="table-wrap">
            <table className="data-table" aria-label="Amortisation schedule">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Opening Balance</th>
                  <th>Principal Paid</th>
                  <th>Interest Paid</th>
                  <th>Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {results.amortisation.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{fmtShort(row.openingBalance)}</td>
                    <td>{fmtShort(row.principal)}</td>
                    <td>{fmtShort(row.interest)}</td>
                    <td>{fmtShort(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <hr className="divider" style={{ marginTop: '2.5rem' }} />

      <EmailCta source="bond-calculator" />

      <FaqAccordion items={faqs} />
    </div>
  )
}
