'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'

const VAT_RATE = 0.15

interface VatResult {
  vatAmount: number
  total: number
  exclusive: number
  inclusive: number
}

type VatMode = 'add' | 'remove'

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: 'What is the current VAT rate in South Africa?',
    a: "South Africa's VAT (Value-Added Tax) rate is 15%, effective from 1 May 2018. It was previously 14% from 1993. VAT is administered by SARS (South African Revenue Service) and applies to most goods and services.",
  },
  {
    q: 'What is the difference between VAT-exclusive and VAT-inclusive prices?',
    a: 'A VAT-exclusive price (also called "ex VAT" or "nett") does not include VAT — you need to add 15% to get the final price. A VAT-inclusive price already has VAT built in. To remove VAT from an inclusive price, divide by 1.15 (not subtract 15%), since VAT is calculated on the nett value, not the gross.',
  },
  {
    q: 'Which businesses must register for VAT in South Africa?',
    a: 'Any business with taxable supplies exceeding R1,000,000 in any 12-month period must register for VAT with SARS. Voluntary registration is allowed from R50,000. Once registered, the business must charge VAT on taxable supplies and may claim input VAT on business expenses.',
  },
]

const fmt = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

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

function calculateVat(amount: number, mode: VatMode): VatResult {
  if (mode === 'add') {
    // amount is exclusive of VAT
    const vatAmount = amount * VAT_RATE
    return {
      vatAmount,
      total: amount + vatAmount,
      exclusive: amount,
      inclusive: amount + vatAmount,
    }
  } else {
    // amount is inclusive of VAT
    const exclusive = amount / (1 + VAT_RATE)
    const vatAmount = amount - exclusive
    return {
      vatAmount,
      total: exclusive,
      exclusive,
      inclusive: amount,
    }
  }
}

export default function VatCalculatorClient() {
  const [amountStr, setAmountStr] = useState<string>('1000')
  const [mode, setMode] = useState<VatMode>('add')
  const [result, setResult] = useState<VatResult | null>(null)

  const recalculate = useCallback((str: string, m: VatMode) => {
    const parsed = parseFloat(str.replace(/,/g, ''))
    if (!isNaN(parsed) && parsed >= 0) {
      setResult(calculateVat(parsed, m))
    } else {
      setResult(null)
    }
  }, [])

  useEffect(() => {
    recalculate(amountStr, mode)
  }, [amountStr, mode, recalculate])

  return (
    <div className="tool-shell">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>VAT Calculator</span>
      </nav>

      {/* Header */}
      <div className="tool-header">
        <span className="tool-icon-large" role="img" aria-label="Receipt">🧾</span>
        <h1>VAT Calculator South Africa (15%)</h1>
        <p>Instantly add or remove 15% VAT from any amount. Perfect for invoicing, quoting, and bookkeeping.</p>
      </div>

      <AdSlot size="banner" label="Advertisement" />

      {/* Calculator Card */}
      <div className="calc-card">
        {/* Mode toggle */}
        <div className="field" style={{ marginBottom: '1.25rem' }}>
          <span className="label">Calculation Mode</span>
          <div className="toggle-group" style={{ marginTop: '0.375rem' }}>
            <button
              id="vat-mode-add"
              className={`toggle-btn${mode === 'add' ? ' active' : ''}`}
              onClick={() => setMode('add')}
              aria-pressed={mode === 'add'}
            >
              Add VAT (excl → incl)
            </button>
            <button
              id="vat-mode-remove"
              className={`toggle-btn${mode === 'remove' ? ' active' : ''}`}
              onClick={() => setMode('remove')}
              aria-pressed={mode === 'remove'}
            >
              Remove VAT (incl → excl)
            </button>
          </div>
        </div>

        {/* Amount input */}
        <div className="field">
          <label className="label" htmlFor="vat-amount">
            {mode === 'add' ? 'VAT-Exclusive Amount (ex VAT)' : 'VAT-Inclusive Amount (incl VAT)'}
          </label>
          <div className="input-wrap">
            <span className="input-prefix">R</span>
            <input
              id="vat-amount"
              type="number"
              className="input input-with-prefix"
              value={amountStr}
              min={0}
              step={1}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              aria-label="Amount in Rands"
            />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="results-card" style={{ marginTop: '1.5rem' }}>
            <p className="results-title">📊 Result</p>

            {/* Hero */}
            <div className="results-hero">
              <div className="results-hero-label">
                {mode === 'add' ? 'VAT-Inclusive Total' : 'VAT-Exclusive Amount'}
              </div>
              <div className="results-hero-value">
                {mode === 'add' ? fmt.format(result.inclusive) : fmt.format(result.exclusive)}
              </div>
            </div>

            <hr className="divider" />

            <div className="results-grid">
              <div className="result-item">
                <div className="result-item-label">VAT Amount (15%)</div>
                <div className="result-item-value negative">{fmt.format(result.vatAmount)}</div>
              </div>
              <div className="result-item">
                <div className="result-item-label">
                  {mode === 'add' ? 'Original (excl VAT)' : 'Original (incl VAT)'}
                </div>
                <div className="result-item-value primary">
                  {mode === 'add' ? fmt.format(result.exclusive) : fmt.format(result.inclusive)}
                </div>
              </div>
            </div>

            {/* Formula note */}
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
              {mode === 'add'
                ? `Formula: R${parseFloat(amountStr || '0').toFixed(2)} × 1.15 = ${fmt.format(result.inclusive)}`
                : `Formula: R${parseFloat(amountStr || '0').toFixed(2)} ÷ 1.15 = ${fmt.format(result.exclusive)}`}
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        💡 <strong>South Africa VAT is 15%</strong>, effective 1 May 2018 (previously 14%). Administered by SARS. Most goods and services are standard-rated. Zero-rated items include basic foodstuffs, exports, and certain financial services.
      </div>

      <hr className="divider" style={{ marginTop: '2rem' }} />

      <EmailCta source="vat-calculator" />

      <FaqAccordion items={faqs} />
    </div>
  )
}
