'use client'

import { useState } from 'react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'

interface Debt {
  id: number
  name: string
  balance: number
  rate: number // annual %
  minPayment: number
}

interface PayoffMonth {
  month: number
  totalPaid: number
  remainingDebt: number
  interestPaid: number
}

function payoffDebts(debts: Debt[], extraPayment: number, method: 'snowball' | 'avalanche'): {
  months: number
  totalInterest: number
  schedule: PayoffMonth[]
} {
  if (!debts.length || debts.some(d => d.balance <= 0 || d.minPayment <= 0)) {
    return { months: 0, totalInterest: 0, schedule: [] }
  }

  // Sort debts according to method
  let remaining = debts.map(d => ({ ...d, balance: d.balance }))
  if (method === 'snowball') {
    remaining.sort((a, b) => a.balance - b.balance)
  } else {
    remaining.sort((a, b) => b.rate - a.rate)
  }

  const schedule: PayoffMonth[] = []
  let month = 0
  let totalInterest = 0
  let totalPaid = 0
  const totalDebt = remaining.reduce((s, d) => s + d.balance, 0)

  while (remaining.some(d => d.balance > 0) && month < 600) {
    month++
    let monthlyInterest = 0
    const totalMin = remaining.reduce((s, d) => s + (d.balance > 0 ? d.minPayment : 0), 0)

    // Apply interest
    remaining = remaining.map(d => {
      if (d.balance <= 0) return d
      const interest = d.balance * (d.rate / 100 / 12)
      monthlyInterest += interest
      return { ...d, balance: d.balance + interest }
    })

    totalInterest += monthlyInterest
    let budget = totalMin + extraPayment

    // Apply minimum payments first
    remaining = remaining.map(d => {
      if (d.balance <= 0) return d
      const payment = Math.min(d.minPayment, d.balance, budget)
      budget -= payment
      totalPaid += payment
      return { ...d, balance: Math.max(0, d.balance - payment) }
    })

    // Apply extra to first debt with balance > 0
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].balance > 0 && budget > 0) {
        const payment = Math.min(budget, remaining[i].balance)
        remaining[i] = { ...remaining[i], balance: remaining[i].balance - payment }
        totalPaid += payment
        budget -= payment
      }
    }

    const remainingDebt = remaining.reduce((s, d) => s + d.balance, 0)
    schedule.push({ month, totalPaid, remainingDebt: Math.max(0, remainingDebt), interestPaid: totalInterest })
  }

  return { months: month, totalInterest, schedule }
}

const DEFAULT_DEBTS: Debt[] = [
  { id: 1, name: 'Credit Card', balance: 15000, rate: 21, minPayment: 450 },
  { id: 2, name: 'Personal Loan', balance: 40000, rate: 14.5, minPayment: 900 },
  { id: 3, name: 'Car Finance', balance: 120000, rate: 11, minPayment: 2800 },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n)

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>(DEFAULT_DEBTS)
  const [extraPayment, setExtraPayment] = useState(500)
  const [nextId, setNextId] = useState(4)

  const snowball = payoffDebts(debts, extraPayment, 'snowball')
  const avalanche = payoffDebts(debts, extraPayment, 'avalanche')

  const addDebt = () => {
    setDebts(prev => [...prev, { id: nextId, name: `Debt ${nextId}`, balance: 10000, rate: 15, minPayment: 300 }])
    setNextId(n => n + 1)
  }

  const removeDebt = (id: number) => setDebts(prev => prev.filter(d => d.id !== id))

  const updateDebt = (id: number, field: keyof Debt, value: string | number) =>
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: field === 'name' ? value : Number(value) } : d))

  const savings = snowball.totalInterest - avalanche.totalInterest
  const monthsSaved = snowball.months - avalanche.months

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Debt Payoff Calculator</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">❄️</span>
        <h1>Debt Snowball vs Avalanche Calculator</h1>
        <p>Compare two proven debt payoff strategies to find the fastest, cheapest way to become debt-free.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      {/* Debt list */}
      <div className="calc-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Your Debts</h2>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem' }} onClick={addDebt}>
            + Add Debt
          </button>
        </div>

        {debts.map(debt => (
          <div key={debt.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: '0.75rem',
            alignItems: 'end',
            marginBottom: '0.75rem',
            padding: '0.875rem',
            background: 'var(--surface-alt)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="label" htmlFor={`debt-name-${debt.id}`}>Name</label>
              <input
                id={`debt-name-${debt.id}`}
                className="input"
                value={debt.name}
                onChange={e => updateDebt(debt.id, 'name', e.target.value)}
                aria-label="Debt name"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label" htmlFor={`debt-bal-${debt.id}`}>Balance</label>
              <div className="input-wrap">
                <span className="input-prefix">R</span>
                <input id={`debt-bal-${debt.id}`} type="number" className="input input-with-prefix" value={debt.balance} onChange={e => updateDebt(debt.id, 'balance', e.target.value)} min={0} aria-label="Balance" />
              </div>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label" htmlFor={`debt-rate-${debt.id}`}>Rate</label>
              <div className="input-wrap">
                <input id={`debt-rate-${debt.id}`} type="number" className="input input-with-suffix" value={debt.rate} onChange={e => updateDebt(debt.id, 'rate', e.target.value)} min={0} step={0.1} aria-label="Interest rate" />
                <span className="input-suffix">%</span>
              </div>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label" htmlFor={`debt-min-${debt.id}`}>Min Pay</label>
              <div className="input-wrap">
                <span className="input-prefix">R</span>
                <input id={`debt-min-${debt.id}`} type="number" className="input input-with-prefix" value={debt.minPayment} onChange={e => updateDebt(debt.id, 'minPayment', e.target.value)} min={0} aria-label="Minimum payment" />
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.6rem', marginBottom: '0' }}
              onClick={() => removeDebt(debt.id)}
              aria-label={`Remove ${debt.name}`}
              disabled={debts.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}

        <div className="field" style={{ marginTop: '1rem', maxWidth: 280 }}>
          <label className="label" htmlFor="extra-payment">Extra Monthly Payment</label>
          <div className="input-wrap">
            <span className="input-prefix">R</span>
            <input
              id="extra-payment"
              type="number"
              className="input input-with-prefix"
              value={extraPayment}
              onChange={e => setExtraPayment(Number(e.target.value))}
              min={0}
              aria-label="Extra monthly payment"
            />
          </div>
          <span className="text-muted">Any amount above your minimums</span>
        </div>
      </div>

      {/* Comparison results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        {[
          { label: '❄️ Snowball', desc: 'Pay smallest balance first — builds momentum', result: snowball, color: 'var(--primary)' },
          { label: '🌊 Avalanche', desc: 'Pay highest interest first — saves most money', result: avalanche, color: 'var(--accent)' },
        ].map(({ label, desc, result, color }) => (
          <div key={label} className="results-card" style={{ marginTop: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color, marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{desc}</div>
            <div className="results-hero">
              <div className="results-hero-label">Debt-free in</div>
              <div className="results-hero-value" style={{ color }}>
                {result.months > 0 ? `${Math.floor(result.months / 12)}y ${result.months % 12}m` : '—'}
              </div>
            </div>
            <div className="result-item" style={{ marginTop: '0.75rem' }}>
              <div className="result-item-label">Total Interest Paid</div>
              <div className="result-item-value negative">{result.months > 0 ? fmt(result.totalInterest) : '—'}</div>
            </div>
          </div>
        ))}
      </div>

      {avalanche.months > 0 && savings > 0 && (
        <div className="info-box" style={{ marginTop: '1rem', borderColor: 'var(--accent)', background: '#F0FDF4' }}>
          <strong>💡 Avalanche saves you {fmt(savings)}</strong> and gets you debt-free{' '}
          {monthsSaved > 0 ? `${monthsSaved} month${monthsSaved !== 1 ? 's' : ''} sooner` : 'at the same time'}.
          But snowball can be more motivating — choose what keeps you on track!
        </div>
      )}

      <EmailCta source="debt-payoff-calculator" headline="Take control of your finances" subtext="Get occasional financial planning tips and calculator updates." />

      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-item">
          <div className="faq-question">What is the debt snowball method?</div>
          <div className="faq-answer">
            The debt snowball method, popularised by Dave Ramsey, involves paying off your smallest debt balances first,
            regardless of interest rate. Once a debt is paid off, you roll that payment into the next smallest.
            The psychological wins from eliminating debts motivate you to keep going.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">What is the debt avalanche method?</div>
          <div className="faq-answer">
            The debt avalanche targets your highest interest rate debt first. Mathematically, this saves you the most
            money in total interest — but it can take longer to pay off your first debt, which some people find demotivating.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Which method is better?</div>
          <div className="faq-answer">
            The best method is the one you actually stick to. Avalanche saves more money; snowball keeps you motivated.
            Many personal finance experts recommend snowball for its psychological benefits, especially if you have
            many small debts. If discipline is not an issue, avalanche is mathematically optimal.
          </div>
        </div>
      </section>
    </div>
  )
}
