'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Wrench } from 'lucide-react'
import { Tool, ToolCategory, CATEGORIES } from '@/lib/tools-registry'

interface HomePageClientProps {
  initialTools: Tool[]
}

export default function HomePageClient({ initialTools }: HomePageClientProps) {
  const [activeFilter, setActiveFilter] = useState<ToolCategory | 'all'>('all')

  // Inline calculator state
  const [percentVal, setPercentVal] = useState('15')
  const [amountVal, setAmountVal] = useState('200')

  const calcResult = (() => {
    const p = parseFloat(percentVal)
    const a = parseFloat(amountVal)
    if (isNaN(p) || isNaN(a)) return '0'
    const res = (p / 100) * a
    return Number(res.toFixed(2)).toString() // format clean decimal
  })()

  const filteredTools = activeFilter === 'all' 
    ? initialTools 
    : initialTools.filter(t => t.category === activeFilter)

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h1>
          Free tools for <span>smarter decisions</span>
        </h1>
        <p>
          Online PDF and document utilities, universal financial calculators, and word tools.
          Everything runs in your browser — private, fast, and free.
        </p>
        
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">{initialTools.length}</div>
            <div className="hero-stat-label">Total utilities</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">100%</div>
            <div className="hero-stat-label">Client-side & private</div>
          </div>
        </div>
      </section>

      {/* Category filters */}
      <div className="section" style={{ paddingBottom: '1rem', paddingTop: '2.5rem' }}>
        <div className="category-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            All Tools
          </button>
          {(Object.keys(CATEGORIES) as ToolCategory[]).map(catKey => (
            <button 
              key={catKey}
              onClick={() => setActiveFilter(catKey)} 
              className={`btn ${activeFilter === catKey ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {CATEGORIES[catKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="section" style={{ paddingTop: '1rem' }}>
        <div className="tools-grid">
          {filteredTools.map(tool => {
            // Check if this is the Percentage Calculator tool to show it inline
            const isPercentageCalc = tool.slug === 'percentage-calculator'

            if (isPercentageCalc && (activeFilter === 'all' || activeFilter === 'calculator')) {
              return (
                <div
                  key={tool.slug}
                  className="tool-card cat-calculator featured-card featured-calculator-card"
                  style={{ cursor: 'default' }}
                >
                  <span className="tool-badge">Calculator</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div className="tool-card-icon">%</div>
                    <div>
                      <h2 className="tool-card-name" style={{ fontSize: '1.25rem' }}>
                        <Link href={`/tools/${tool.slug}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover-underline">
                          {tool.name}
                        </Link>
                      </h2>
                      <p className="tool-card-desc" style={{ marginTop: '0.25rem' }}>{tool.description}</p>
                    </div>
                  </div>

                  {/* Inline interactive calculation */}
                  <div 
                    onClick={e => e.stopPropagation()} 
                    style={{ 
                      background: 'rgba(255,255,255,0.5)', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      margin: '0.5rem 0',
                      border: '1px solid rgba(186,117,23,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.9rem', fontWeight: 600 }}>
                      <span>What is</span>
                      <input
                        type="number"
                        value={percentVal}
                        onChange={e => setPercentVal(e.target.value)}
                        style={{ 
                          width: '60px', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          border: '1px solid #FAF8F4',
                          textAlign: 'center',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                        aria-label="Percentage value"
                      />
                      <span>% of</span>
                      <input
                        type="number"
                        value={amountVal}
                        onChange={e => setAmountVal(e.target.value)}
                        style={{ 
                          width: '90px', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          border: '1px solid #FAF8F4',
                          textAlign: 'center',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                        aria-label="Total value"
                      />
                      <span>?</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Result:</span>
                      <span 
                        style={{ 
                          fontSize: '1.75rem', 
                          fontWeight: 500, 
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#412402'
                        }}
                      >
                        {calcResult}
                      </span>
                    </div>
                  </div>

                  <div className="tool-card-arrow">
                    <Link href={`/tools/${tool.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Open full calculator <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={`tool-card cat-${tool.category} ${tool.featured ? 'featured-card' : ''}`}
                aria-label={`Open ${tool.name}`}
              >
                <span className="tool-badge">
                  {tool.category === 'pdf' ? 'PDF' : tool.category === 'word' ? 'Word' : tool.category === 'excel' ? 'Excel' : 'Calculator'}
                </span>
                <div className="tool-card-icon">{tool.icon}</div>
                <h2 className="tool-card-name">{tool.name}</h2>
                <p className="tool-card-desc">{tool.description}</p>
                <div className="tool-card-arrow">
                  Open tool <ArrowRight size={13} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="section" style={{ paddingTop: '2rem' }}>
        <div className="email-cta" style={{ background: '#2C2C2A', color: '#FAF8F4', borderRadius: '12px', border: 'none' }}>
          <h3>Get notified about tax & rate changes</h3>
          <p style={{ color: '#FAF8F4', opacity: 0.85 }}>We update our calculators immediately when tax rates change. Subscribing is free.</p>
          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 480, margin: '0 auto', justifyContent: 'center' }}>
            <Link href="/tools/bond-calculator-south-africa" className="btn" style={{ background: '#FAF8F4', color: '#2C2C2A', fontWeight: 700 }}>
              Try Bond Calculator
            </Link>
            <Link href="/tools/paye-calculator-south-africa" className="btn btn-secondary" style={{ color: '#FAF8F4', borderColor: 'rgba(250, 248, 244, 0.4)' }}>
              Try PAYE Calculator
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
