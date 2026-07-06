'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'

type CompoundingFrequency = 'monthly' | 'quarterly' | 'annually'

interface CompoundInputs {
  principal: number
  monthlyContribution: number
  annualRate: number
  years: number
  frequency: CompoundingFrequency
}

interface YearRow {
  year: number
  contributions: number
  interest: number
  balance: number
}

interface CompoundResults {
  finalBalance: number
  totalContributions: number
  totalInterest: number
  yearlyData: YearRow[]
}

const frequencyOptions: { value: CompoundingFrequency; label: string; n: number }[] = [
  { value: 'monthly', label: 'Monthly (12×/year)', n: 12 },
  { value: 'quarterly', label: 'Quarterly (4×/year)', n: 4 },
  { value: 'annually', label: 'Annually (1×/year)', n: 1 },
]

const defaultInputs: CompoundInputs = {
  principal: 50000,
  monthlyContribution: 2000,
  annualRate: 10,
  years: 20,
  frequency: 'monthly',
}

const fmt = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

function calculateCompound(inputs: CompoundInputs): CompoundResults {
  const { principal, monthlyContribution, annualRate, years, frequency } = inputs
  const n = frequencyOptions.find((f) => f.value === frequency)?.n ?? 12
  const r = annualRate / 100 / n
  const periodsPerYear = n
  const contributionPerPeriod = (monthlyContribution * 12) / n

  const yearlyData: YearRow[] = []
  let balance = principal

  for (let year = 1; year <= years; year++) {
    let yearlyInterest = 0
    const yearlyContributions = contributionPerPeriod * periodsPerYear

    for (let p = 0; p < periodsPerYear; p++) {
      const interest = balance * r
      yearlyInterest += interest
      balance += interest + contributionPerPeriod
    }

    yearlyData.push({
      year,
      contributions: yearlyContributions,
      interest: yearlyInterest,
      balance: Math.round(balance),
    })
  }

  const finalBalance = Math.round(balance)
  const totalContributions = principal + monthlyContribution * 12 * years
  const totalInterest = Math.max(0, finalBalance - totalContributions)

  return {
    finalBalance,
    totalContributions,
    totalInterest,
    yearlyData,
  }
}

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: 'What is compound interest?',
    a: "Compound interest means earning interest on your interest — not just on your original deposit. For example, if you invest R10,000 at 10% annually, after year 1 you earn R1,000. In year 2 you earn 10% of R11,000 = R1,100. Over time this snowball effect dramatically grows your wealth, which is why Albert Einstein reportedly called it 'the eighth wonder of the world'.",
  },
  {
    q: 'How does compounding frequency affect returns in South Africa?',
    a: 'Monthly compounding outperforms quarterly and annual compounding because interest is applied more frequently, meaning you earn interest on interest sooner. South African banks typically compound savings accounts monthly. When comparing investment products, always check whether interest is compounded daily, monthly, or annually.',
  },
  {
    q: 'How does this relate to Retirement Annuities (RAs) in South Africa?',
    a: "A Retirement Annuity (RA) benefits enormously from compound growth. SARS allows a deduction of up to 27.5% of your taxable income (max R350,000/year) for RA contributions, meaning you get an immediate tax saving plus compound growth. Starting early — even with small contributions — can make a massive difference by retirement. A R2,000/month RA contribution growing at 10% for 30 years can exceed R4.5 million.",
  },
]

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="faq-section">
      <h2
        style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}
      >
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

export default function CompoundInterestClient() {
  const [inputs, setInputs] = useState<CompoundInputs>(defaultInputs)
  const [results, setResults] = useState<CompoundResults | null>(null)

  const recalculate = useCallback((inp: CompoundInputs) => {
    if (inp.principal >= 0 && inp.annualRate > 0 && inp.years > 0) {
      setResults(calculateCompound(inp))
    }
  }, [])

  useEffect(() => {
    recalculate(inputs)
  }, [inputs, recalculate])

  function setField<K extends keyof CompoundInputs>(key: K, value: CompoundInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const ratePct = ((inputs.annualRate - 1) / (30 - 1)) * 100
  const yearsPct = ((inputs.years - 1) / (50 - 1)) * 100

  return (
    <div className="tool-shell">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Compound Interest Calculator</span>
      </nav>

      {/* Header */}
      <div className="tool-header">
        <span className="tool-icon-large" role="img" aria-label="Chart">📈</span>
        <h1>Compound Interest &amp; Savings Calculator</h1>
        <p>
          See how your savings and investments grow over time with compound interest. Model your RA, TFSA,
          or savings account growth.
        </p>
      </div>

      <AdSlot size="banner" label="Advertisement" />

      {/* Inputs */}
      <div className="calc-card">
        <div className="calc-grid">
          {/* Principal */}
          <div className="field">
            <label className="label" htmlFor="ci-principal">
              Initial Investment (Lump Sum)
            </label>
            <div className="input-wrap">
              <span className="input-prefix">R</span>
              <input
                id="ci-principal"
                type="number"
                className="input input-with-prefix"
                value={inputs.principal}
                min={0}
                step={1000}
                onChange={(e) => setField('principal', Number(e.target.value))}
                aria-label="Initial principal in Rands"
              />
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="field">
            <label className="label" htmlFor="ci-monthly">
              Monthly Contribution
            </label>
            <div className="input-wrap">
              <span className="input-prefix">R</span>
              <input
                id="ci-monthly"
                type="number"
                className="input input-with-prefix"
                value={inputs.monthlyContribution}
                min={0}
                step={100}
                onChange={(e) => setField('monthlyContribution', Number(e.target.value))}
                aria-label="Monthly contribution in Rands"
              />
            </div>
          </div>

          {/* Annual Rate */}
          <div className="field">
            <label className="label" htmlFor="ci-rate">
              Annual Interest Rate — <strong>{inputs.annualRate.toFixed(1)}%</strong>
            </label>
            <div className="input-wrap">
              <input
                id="ci-rate"
                type="number"
                className="input input-with-suffix"
                value={inputs.annualRate}
                min={1}
                max={30}
                step={0.5}
                onChange={(e) => setField('annualRate', Number(e.target.value))}
                aria-label="Annual interest rate percentage"
              />
              <span className="input-suffix">%</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min={1}
              max={30}
              step={0.5}
              value={inputs.annualRate}
              onChange={(e) => setField('annualRate', Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--primary) ${ratePct}%, var(--surface-border) ${ratePct}%)`,
              }}
              aria-label="Annual rate slider"
            />
          </div>

          {/* Years */}
          <div className="field">
            <label className="label" htmlFor="ci-years">
              Investment Period — <strong>{inputs.years} Years</strong>
            </label>
            <div className="input-wrap">
              <input
                id="ci-years"
                type="number"
                className="input input-with-suffix"
                value={inputs.years}
                min={1}
                max={50}
                step={1}
                onChange={(e) => setField('years', Number(e.target.value))}
                aria-label="Investment period in years"
              />
              <span className="input-suffix">Yrs</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min={1}
              max={50}
              step={1}
              value={inputs.years}
              onChange={(e) => setField('years', Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--primary) ${yearsPct}%, var(--surface-border) ${yearsPct}%)`,
              }}
              aria-label="Years slider"
            />
          </div>

          {/* Compounding Frequency */}
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="label" htmlFor="ci-frequency">
              Compounding Frequency
            </label>
            <select
              id="ci-frequency"
              className="select"
              value={inputs.frequency}
              onChange={(e) => setField('frequency', e.target.value as CompoundingFrequency)}
              aria-label="Compounding frequency"
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="results-card">
          <p className="results-title">📊 Projected Results after {inputs.years} Years</p>

          {/* Hero */}
          <div className="results-hero">
            <div className="results-hero-label">Final Balance</div>
            <div className="results-hero-value">{fmt.format(results.finalBalance)}</div>
          </div>

          <hr className="divider" />

          <div className="results-grid">
            <div className="result-item">
              <div className="result-item-label">Total Contributions</div>
              <div className="result-item-value primary">{fmt.format(results.totalContributions)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Total Interest Earned</div>
              <div className="result-item-value positive">{fmt.format(results.totalInterest)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Interest-to-Contribution Ratio</div>
              <div className="result-item-value">
                {results.totalContributions > 0
                  ? `${((results.totalInterest / results.totalContributions) * 100).toFixed(0)}%`
                  : '—'}
              </div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Monthly Contribution</div>
              <div className="result-item-value">{fmt.format(inputs.monthlyContribution)}/mo</div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        💡 <strong>The power of compound interest:</strong> Starting 10 years earlier can more than double your final balance. South African investors should consider a Tax-Free Savings Account (TFSA — up to R36,000/year, R500,000 lifetime) or a Retirement Annuity (RA — up to 27.5% of taxable income, tax-deductible) to maximise compound growth tax-efficiently.
      </div>

      {/* Year-by-year table */}
      {results && results.yearlyData.length > 0 && (
        <>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: '2rem 0 0',
              color: 'var(--text-primary)',
            }}
          >
            Year-by-Year Growth
          </h2>
          <div className="table-wrap">
            <table className="data-table" aria-label="Compound interest year-by-year table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Annual Contributions</th>
                  <th>Interest Earned</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyData.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{fmt.format(row.contributions)}</td>
                    <td>{fmt.format(row.interest)}</td>
                    <td>{fmt.format(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <hr className="divider" style={{ marginTop: '2.5rem' }} />

      <EmailCta source="compound-interest" />

      <FaqAccordion items={faqs} />
    </div>
  )
}
