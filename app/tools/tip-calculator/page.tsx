'use client'

import { useState } from 'react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

const fmtR = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 2 }).format(n)

export default function TipCalculatorPage() {
  const [bill, setBill] = useState('')
  const [tipPct, setTipPct] = useState(10)
  const [split, setSplit] = useState(1)
  const [customTip, setCustomTip] = useState('')

  const billAmount = parseFloat(bill) || 0
  const effectiveTip = customTip !== '' ? parseFloat(customTip) || 0 : tipPct
  const tipAmount = billAmount * (effectiveTip / 100)
  const total = billAmount + tipAmount
  const perPerson = split > 0 ? total / split : total
  const tipPerPerson = split > 0 ? tipAmount / split : tipAmount

  const PRESETS = [0, 5, 10, 12.5, 15, 20]

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Tip Calculator</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🍽️</span>
        <h1>Tip Calculator & Bill Splitter</h1>
        <p>Calculate tip amounts and split the bill between any number of people. Instantly.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div className="calc-card">
        <div className="calc-grid">
          {/* Bill amount */}
          <div className="field">
            <label className="label" htmlFor="tip-bill">Bill Amount</label>
            <div className="input-wrap">
              <span className="input-prefix">R</span>
              <input
                id="tip-bill"
                type="number"
                className="input input-with-prefix"
                value={bill}
                onChange={e => setBill(e.target.value)}
                placeholder="e.g. 450"
                min={0}
                aria-label="Bill amount in Rands"
              />
            </div>
          </div>

          {/* Number of people */}
          <div className="field">
            <label className="label" htmlFor="tip-split">Split Between</label>
            <div className="input-wrap">
              <input
                id="tip-split"
                type="number"
                className="input input-with-suffix"
                value={split}
                onChange={e => setSplit(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                aria-label="Number of people"
              />
              <span className="input-suffix">people</span>
            </div>
          </div>

          {/* Tip presets */}
          <div className="field field-full">
            <label className="label">Tip Percentage</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setTipPct(p); setCustomTip('') }}
                  style={{
                    padding: '0.45rem 0.875rem',
                    border: `2px solid ${customTip === '' && tipPct === p ? 'var(--primary)' : 'var(--surface-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: customTip === '' && tipPct === p ? '#fef2f2' : 'white',
                    color: customTip === '' && tipPct === p ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s',
                  }}
                  aria-pressed={customTip === '' && tipPct === p}
                >
                  {p}%
                </button>
              ))}
              <div className="input-wrap" style={{ flex: 1, minWidth: 100 }}>
                <input
                  type="number"
                  className="input input-with-suffix"
                  placeholder="Custom"
                  value={customTip}
                  onChange={e => setCustomTip(e.target.value)}
                  min={0}
                  max={100}
                  aria-label="Custom tip percentage"
                  style={{ border: customTip !== '' ? '2px solid var(--primary)' : undefined }}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {billAmount > 0 && (
          <div className="results-card" style={{ marginTop: '1.25rem' }}>
            <div className="results-title">Your Bill</div>

            <div style={{ display: 'grid', gridTemplateColumns: split > 1 ? '1fr 1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="result-item">
                <div className="result-item-label">Bill</div>
                <div className="result-item-value">{fmtR(billAmount)}</div>
              </div>
              <div className="result-item">
                <div className="result-item-label">Tip ({effectiveTip}%)</div>
                <div className="result-item-value">{fmtR(tipAmount)}</div>
              </div>
              <div className="result-item">
                <div className="result-item-label">Total</div>
                <div className="result-item-value primary">{fmtR(total)}</div>
              </div>
            </div>

            {split > 1 && (
              <>
                <hr className="divider" />
                <div className="results-hero">
                  <div className="results-hero-label">Each person pays</div>
                  <div className="results-hero-value">{fmtR(perPerson)}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  includes {fmtR(tipPerPerson)} tip per person
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>South African tipping guide:</strong> Tipping is customary but not mandatory in South Africa.
        5–10% is standard; 10–15% for good service; 15–20% for exceptional service.
        Tipping is especially common at restaurants, for petrol attendants, parking attendants, and hotel porters.
      </div>

      <EmailCta source="tip-calculator" />
    </div>
  )
}
