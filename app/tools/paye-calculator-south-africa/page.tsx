'use client'

import { useState, useCallback } from 'react'
import { calculatePaye } from '@/lib/calculators/paye'
import type { PayeInputs, PayeResults } from '@/lib/calculators/paye'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import type { Metadata } from 'next'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n)

const fmtPct = (n: number) => `${n.toFixed(1)}%`

const DEFAULT_INPUTS: PayeInputs = {
  grossSalary: 35000,
  period: 'monthly',
  age: 35,
  retirementContribution: 1750,
  medicalAidMembers: 2,
}

export default function PayeCalculatorPage() {
  const [inputs, setInputs] = useState<PayeInputs>(DEFAULT_INPUTS)
  const results: PayeResults = calculatePaye(inputs)

  const set = (field: keyof PayeInputs, value: unknown) =>
    setInputs(prev => ({ ...prev, [field]: value }))

  return (
    <>
      <div className="tool-shell">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>PAYE Calculator</span>
        </nav>

        {/* Header */}
        <div className="tool-header">
          <span className="tool-icon-large">💼</span>
          <h1>South African PAYE / UIF Calculator (2025/26)</h1>
          <p>
            Calculate your take-home salary, income tax (PAYE), UIF contribution, and effective tax rate based on the
            current 2025/26 SARS tax tables.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <AdSlot size="banner" />
        </div>

        {/* Inputs */}
        <div className="calc-card">
          <div className="calc-grid">
            {/* Salary */}
            <div className="field">
              <label className="label" htmlFor="paye-salary">Gross Salary</label>
              <div className="input-wrap">
                <span className="input-prefix">R</span>
                <input
                  id="paye-salary"
                  type="number"
                  className="input input-with-prefix"
                  value={inputs.grossSalary}
                  onChange={e => set('grossSalary', Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>

            {/* Period toggle */}
            <div className="field">
              <label className="label">Pay Period</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${inputs.period === 'monthly' ? 'active' : ''}`}
                  onClick={() => set('period', 'monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${inputs.period === 'annual' ? 'active' : ''}`}
                  onClick={() => set('period', 'annual')}
                >
                  Annual
                </button>
              </div>
            </div>

            {/* Age */}
            <div className="field">
              <label className="label" htmlFor="paye-age">Age</label>
              <div className="input-wrap">
                <input
                  id="paye-age"
                  type="number"
                  className="input"
                  value={inputs.age}
                  onChange={e => set('age', Number(e.target.value))}
                  min={18}
                  max={75}
                />
              </div>
              <span className="text-muted">
                {inputs.age >= 75 ? 'Tertiary rebate applies' : inputs.age >= 65 ? 'Secondary rebate applies' : 'Primary rebate only'}
              </span>
            </div>

            {/* Retirement contribution */}
            <div className="field">
              <label className="label" htmlFor="paye-ret">Monthly Retirement Contribution</label>
              <div className="input-wrap">
                <span className="input-prefix">R</span>
                <input
                  id="paye-ret"
                  type="number"
                  className="input input-with-prefix"
                  value={inputs.retirementContribution}
                  onChange={e => set('retirementContribution', Number(e.target.value))}
                  min={0}
                />
              </div>
              <span className="text-muted">RA/pension/provident — deductible up to 27.5% of income</span>
            </div>

            {/* Medical aid */}
            <div className="field">
              <label className="label" htmlFor="paye-med">Medical Aid Members</label>
              <select
                id="paye-med"
                className="select"
                value={inputs.medicalAidMembers}
                onChange={e => set('medicalAidMembers', Number(e.target.value))}
              >
                <option value={0}>No medical aid</option>
                <option value={1}>1 (main member only)</option>
                <option value={2}>2 (main + 1 dependent)</option>
                <option value={3}>3 members</option>
                <option value={4}>4 members</option>
                <option value={5}>5 members</option>
                <option value={6}>6 members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="info-box">
          <strong>2025/26 Tax Year</strong> — Using current SARS tax tables and rebates.
          PAYE is calculated after retirement fund deductions. Medical aid credits reduce final tax payable.
          SDL (Skills Development Levy) of 1% is payable by the employer, not deducted from your salary.
        </div>

        {/* Results */}
        <div className="results-card">
          <div className="results-title">💼 Your Take-Home Pay</div>

          <div className="results-hero">
            <div className="results-hero-label">Monthly Net Salary</div>
            <div className="results-hero-value">
              {fmt(results.monthlyNetSalary)}
            </div>
          </div>

          <div className="results-grid">
            <div className="result-item">
              <div className="result-item-label">Monthly Gross</div>
              <div className="result-item-value">{fmt(results.monthlyGross)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Monthly PAYE</div>
              <div className="result-item-value negative">{fmt(results.monthlyPaye)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Monthly UIF</div>
              <div className="result-item-value negative">{fmt(results.monthlyUif)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Effective Tax Rate</div>
              <div className="result-item-value">{fmtPct(results.effectiveTaxRate)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Marginal Tax Rate</div>
              <div className="result-item-value">{fmtPct(results.marginalTaxRate)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Annual Net Salary</div>
              <div className="result-item-value positive">{fmt(results.monthlyNetSalary * 12)}</div>
            </div>
          </div>

          <hr className="divider" />

          {/* Annual breakdown */}
          <div className="results-title" style={{ marginBottom: '1rem' }}>Annual Tax Breakdown</div>
          <div className="results-grid">
            <div className="result-item">
              <div className="result-item-label">Annual Gross Income</div>
              <div className="result-item-value">{fmt(results.annualGross)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Taxable Income</div>
              <div className="result-item-value">{fmt(results.annualTaxableIncome)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Tax Before Rebates</div>
              <div className="result-item-value">{fmt(results.annualTax)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Rebates</div>
              <div className="result-item-value positive">{fmt(results.annualRebate)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Medical Tax Credit</div>
              <div className="result-item-value positive">{fmt(results.annualMedicalCredit)}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Annual Tax Payable</div>
              <div className="result-item-value negative">{fmt(results.annualNetTax)}</div>
            </div>
          </div>
        </div>

        {/* 2025/26 Tax brackets reference */}
        <div className="table-wrap" style={{ marginTop: '1.5rem' }}>
          <table className="data-table" aria-label="2025/26 SARS Income Tax Brackets">
            <thead>
              <tr>
                <th>2025/26 Taxable Income</th>
                <th>Rate</th>
                <th>Tax on lower amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['R1 – R237 100', '18%', 'R0'],
                ['R237 101 – R370 500', '26%', 'R42 678'],
                ['R370 501 – R512 800', '31%', 'R77 362'],
                ['R512 801 – R673 000', '36%', 'R121 475'],
                ['R673 001 – R857 900', '39%', 'R179 147'],
                ['R857 901 – R1 817 000', '41%', 'R251 258'],
                ['R1 817 001+', '45%', 'R644 489'],
              ].map(([range, rate, base]) => (
                <tr key={range}>
                  <td>{range}</td>
                  <td>{rate}</td>
                  <td>{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <EmailCta source="paye-calculator" />

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-item">
            <div className="faq-question">What is PAYE in South Africa?</div>
            <div className="faq-answer">
              PAYE stands for Pay As You Earn. It is the income tax your employer deducts from your salary each month
              and pays over to SARS on your behalf. The amount depends on your taxable income and the applicable tax
              bracket in the current tax year.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">What is UIF and how is it calculated?</div>
            <div className="faq-answer">
              UIF (Unemployment Insurance Fund) is 1% of your gross monthly salary, up to a maximum monthly salary of
              R17 712. Your employer also contributes 1%, for a total of 2%. UIF provides short-term relief if you
              become unemployed, are unable to work due to illness, or for maternity benefits.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">How do retirement fund contributions reduce my tax?</div>
            <div className="faq-answer">
              Contributions to an approved retirement annuity (RA), pension fund, or provident fund are tax deductible
              up to 27.5% of the higher of your taxable income or remuneration, capped at R350 000 per year.
              This reduces your taxable income, and therefore your PAYE — effectively making the government
              co-fund your retirement savings.
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
