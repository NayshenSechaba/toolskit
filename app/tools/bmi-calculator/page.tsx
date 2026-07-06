'use client'

import { useState } from 'react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'

interface BmiResult {
  bmi: number
  category: string
  color: string
  description: string
}

function calculateBmi(weight: number, height: number): BmiResult {
  const bmi = weight / (height * height)

  if (bmi < 18.5) return { bmi, category: 'Underweight', color: '#60A5FA', description: 'Below the healthy range. Consider consulting a healthcare professional.' }
  if (bmi < 25) return { bmi, category: 'Normal weight', color: '#10B981', description: 'Within the healthy range. Keep up healthy habits!' }
  if (bmi < 30) return { bmi, category: 'Overweight', color: '#F59E0B', description: 'Above the healthy range. A balanced diet and regular exercise can help.' }
  if (bmi < 35) return { bmi, category: 'Obese (Class I)', color: '#EF4444', description: 'At elevated health risk. Consulting a doctor is recommended.' }
  if (bmi < 40) return { bmi, category: 'Obese (Class II)', color: '#DC2626', description: 'At high health risk. Medical advice is strongly recommended.' }
  return { bmi, category: 'Obese (Class III)', color: '#991B1B', description: 'At very high health risk. Please consult a healthcare professional.' }
}

export default function BmiCalculatorPage() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')

  let result: BmiResult | null = null
  const w = parseFloat(weight)

  if (unit === 'metric') {
    const h = parseFloat(height) / 100 // cm to m
    if (w > 0 && h > 0) result = calculateBmi(w, h)
  } else {
    const ft = parseFloat(heightFt) || 0
    const inches = parseFloat(heightIn) || 0
    const totalInches = ft * 12 + inches
    const heightM = totalInches * 0.0254
    const weightKg = w * 0.453592
    if (weightKg > 0 && heightM > 0) result = calculateBmi(weightKg, heightM)
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>BMI Calculator</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">⚖️</span>
        <h1>BMI Calculator</h1>
        <p>Calculate your Body Mass Index (BMI) using metric or imperial measurements. Understand what your result means.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div className="calc-card">
        <div className="field" style={{ marginBottom: '1.25rem' }}>
          <label className="label">Measurement System</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${unit === 'metric' ? 'active' : ''}`}
              onClick={() => setUnit('metric')}
            >Metric (kg / cm)</button>
            <button
              type="button"
              className={`toggle-btn ${unit === 'imperial' ? 'active' : ''}`}
              onClick={() => setUnit('imperial')}
            >Imperial (lbs / ft)</button>
          </div>
        </div>

        <div className="calc-grid">
          <div className="field">
            <label className="label" htmlFor="bmi-weight">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'})
            </label>
            <div className="input-wrap">
              <input
                id="bmi-weight"
                type="number"
                className="input input-with-suffix"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={unit === 'metric' ? 'e.g. 75' : 'e.g. 165'}
                min={0}
                aria-label={`Weight in ${unit === 'metric' ? 'kilograms' : 'pounds'}`}
              />
              <span className="input-suffix">{unit === 'metric' ? 'kg' : 'lbs'}</span>
            </div>
          </div>

          {unit === 'metric' ? (
            <div className="field">
              <label className="label" htmlFor="bmi-height">Height (cm)</label>
              <div className="input-wrap">
                <input
                  id="bmi-height"
                  type="number"
                  className="input input-with-suffix"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  min={0}
                  aria-label="Height in centimetres"
                />
                <span className="input-suffix">cm</span>
              </div>
            </div>
          ) : (
            <>
              <div className="field">
                <label className="label" htmlFor="bmi-ft">Height (feet)</label>
                <div className="input-wrap">
                  <input
                    id="bmi-ft"
                    type="number"
                    className="input input-with-suffix"
                    value={heightFt}
                    onChange={e => setHeightFt(e.target.value)}
                    placeholder="e.g. 5"
                    min={0}
                    aria-label="Height feet"
                  />
                  <span className="input-suffix">ft</span>
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="bmi-in">Height (inches)</label>
                <div className="input-wrap">
                  <input
                    id="bmi-in"
                    type="number"
                    className="input input-with-suffix"
                    value={heightIn}
                    onChange={e => setHeightIn(e.target.value)}
                    placeholder="e.g. 10"
                    min={0}
                    max={11}
                    aria-label="Height inches"
                  />
                  <span className="input-suffix">in</span>
                </div>
              </div>
            </>
          )}
        </div>

        {result && (
          <div className="results-card" style={{ marginTop: '1.25rem', background: `linear-gradient(135deg, ${result.color}15, ${result.color}05)`, borderColor: `${result.color}40` }}>
            <div className="results-hero">
              <div className="results-hero-label">Your BMI</div>
              <div className="results-hero-value" style={{ color: result.color }}>
                {result.bmi.toFixed(1)}
              </div>
            </div>
            <div style={{
              display: 'inline-block',
              background: result.color,
              color: 'white',
              padding: '0.25rem 0.875rem',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '0.75rem',
            }}>
              {result.category}
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{result.description}</p>

            {/* BMI Scale */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{
                height: 12,
                borderRadius: 6,
                background: 'linear-gradient(90deg, #60A5FA 0%, #10B981 25%, #10B981 45%, #F59E0B 60%, #EF4444 80%, #991B1B 100%)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${Math.min(Math.max(((result.bmi - 10) / 40) * 100, 0), 100)}%`,
                  top: -4,
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'white',
                  border: `3px solid ${result.color}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                <span>10</span><span>18.5 Underweight</span><span>25 Normal</span><span>30 Overweight</span><span>40 Obese</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>Disclaimer:</strong> BMI is a screening tool, not a diagnostic tool. It does not account for muscle mass,
        bone density, age, gender, or ethnicity. Always consult a healthcare professional for medical advice.
      </div>

      <EmailCta source="bmi-calculator" headline="Health tips & tool updates" subtext="Occasional health and wellness tool updates. No spam." />

      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">BMI Reference Table</h2>
        <div className="table-wrap" style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
          <table className="data-table">
            <thead>
              <tr><th>BMI Range</th><th>Category</th></tr>
            </thead>
            <tbody>
              {[['Below 18.5', 'Underweight'], ['18.5 – 24.9', 'Normal weight'], ['25.0 – 29.9', 'Overweight'], ['30.0 – 34.9', 'Obese (Class I)'], ['35.0 – 39.9', 'Obese (Class II)'], ['40.0+', 'Obese (Class III)']].map(([range, cat]) => (
                <tr key={range}><td>{range}</td><td>{cat}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="faq-item">
          <div className="faq-question">What is a healthy BMI range?</div>
          <div className="faq-answer">
            According to the World Health Organization (WHO), a BMI between 18.5 and 24.9 is considered normal/healthy
            for adults. Below 18.5 is underweight and 25 or above is overweight. These are general guidelines
            and individual health depends on many other factors.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Does BMI apply to children?</div>
          <div className="faq-answer">
            This calculator is designed for adults (age 18+). BMI for children and teens uses age- and
            gender-specific percentiles rather than fixed cutoffs. Consult your paediatrician for children&apos;s BMI interpretation.
          </div>
        </div>
      </section>
    </div>
  )
}
