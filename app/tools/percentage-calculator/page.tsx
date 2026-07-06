'use client'

import { useState } from 'react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'

type PercentMode = 'of' | 'change' | 'is_what' | 'difference'

interface PercentResult {
  label: string
  value: string
  description: string
}

function calculate(mode: PercentMode, a: number, b: number): PercentResult | null {
  if (isNaN(a) || isNaN(b)) return null

  switch (mode) {
    case 'of':
      return {
        label: `${a}% of ${b}`,
        value: `${((a / 100) * b).toLocaleString('en-ZA', { maximumFractionDigits: 4 })}`,
        description: `${a}% of ${b} = ${((a / 100) * b).toFixed(4).replace(/\.?0+$/, '')}`,
      }
    case 'change':
      if (a === 0) return null
      const pct = ((b - a) / Math.abs(a)) * 100
      return {
        label: `${a} → ${b}`,
        value: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
        description: `${b > a ? 'Increase' : 'Decrease'} of ${Math.abs(pct).toFixed(2)}%`,
      }
    case 'is_what':
      if (b === 0) return null
      return {
        label: `${a} is what % of ${b}`,
        value: `${((a / b) * 100).toFixed(4).replace(/\.?0+$/, '')}%`,
        description: `${a} is ${((a / b) * 100).toFixed(2)}% of ${b}`,
      }
    case 'difference':
      const diff = Math.abs(a - b)
      const avgBase = (Math.abs(a) + Math.abs(b)) / 2
      const pctDiff = avgBase === 0 ? 0 : (diff / avgBase) * 100
      return {
        label: `Difference between ${a} and ${b}`,
        value: `${pctDiff.toFixed(2)}%`,
        description: `The two values differ by ${pctDiff.toFixed(2)}% (absolute difference: ${diff.toLocaleString()})`,
      }
    default:
      return null
  }
}

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<PercentMode>('of')
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  const result = calculate(mode, parseFloat(a), parseFloat(b))

  const modes: { key: PercentMode; label: string; aLabel: string; bLabel: string; example: string }[] = [
    { key: 'of', label: 'X% of Y', aLabel: 'Percentage', bLabel: 'Value', example: 'What is 15% of 500?' },
    { key: 'change', label: 'Percentage Change', aLabel: 'Original Value', bLabel: 'New Value', example: 'From 80 to 100 is what change?' },
    { key: 'is_what', label: 'X is what % of Y', aLabel: 'X', bLabel: 'Y', example: '25 is what % of 200?' },
    { key: 'difference', label: 'Percentage Difference', aLabel: 'Value 1', bLabel: 'Value 2', example: 'Difference between 50 and 60' },
  ]

  const currentMode = modes.find(m => m.key === mode)!

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Percentage Calculator</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">%</span>
        <h1>Percentage Calculator</h1>
        <p>Calculate percentages, percentage changes, and percentage differences — instantly.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div className="calc-card">
        {/* Mode selector */}
        <div className="field" style={{ marginBottom: '1.25rem' }}>
          <label className="label">What do you want to calculate?</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
            {modes.map(m => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                style={{
                  padding: '0.6rem 0.75rem',
                  border: `2px solid ${mode === m.key ? 'var(--primary)' : 'var(--surface-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: mode === m.key ? '#f0fdfa' : 'white',
                  color: mode === m.key ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                aria-pressed={mode === m.key}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="info-box" style={{ marginBottom: '1.25rem', marginTop: 0 }}>
          <strong>Example:</strong> {currentMode.example}
        </div>

        <div className="calc-grid">
          <div className="field">
            <label className="label" htmlFor="pct-a">{currentMode.aLabel}</label>
            <div className="input-wrap">
              {mode === 'of' && <span className="input-suffix">%</span>}
              <input
                id="pct-a"
                type="number"
                className={`input ${mode === 'of' ? 'input-with-suffix' : ''}`}
                value={a}
                onChange={e => setA(e.target.value)}
                placeholder={mode === 'of' ? 'e.g. 15' : 'e.g. 80'}
                aria-label={currentMode.aLabel}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="pct-b">{currentMode.bLabel}</label>
            <input
              id="pct-b"
              type="number"
              className="input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="e.g. 500"
              aria-label={currentMode.bLabel}
            />
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="results-card" style={{ marginTop: '1.25rem' }}>
            <div className="results-hero">
              <div className="results-hero-label">{result.label}</div>
              <div className="results-hero-value" style={{ color: 'var(--primary)' }}>{result.value}</div>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{result.description}</p>
          </div>
        )}
      </div>

      <EmailCta source="percentage-calculator" />

      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-item">
          <div className="faq-question">What is the difference between percentage change and percentage difference?</div>
          <div className="faq-answer">
            Percentage change measures how much a value has changed from an original value (directional).
            Percentage difference measures the relative difference between two values without implying which was first,
            using the average as the base.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How do I calculate VAT quickly?</div>
          <div className="faq-answer">
            In South Africa, VAT is 15%. To add VAT: multiply by 1.15.
            To get the VAT-exclusive price from a VAT-inclusive price: divide by 1.15.
            Use our dedicated <Link href="/tools/vat-calculator-south-africa" style={{ color: 'var(--primary)' }}>VAT Calculator</Link> for this.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How do I calculate a salary increase percentage?</div>
          <div className="faq-answer">
            Use the &ldquo;Percentage Change&rdquo; mode: enter your old salary as Value 1 and your new salary as Value 2.
            The result shows the exact percentage increase. Alternatively: (new − old) ÷ old × 100.
          </div>
        </div>
      </section>
    </div>
  )
}
