import Link from 'next/link'
import { TOOLS, CATEGORIES, ToolCategory } from '@/lib/tools-registry'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import AdSlot from '@/components/layout/AdSlot'

export const metadata: Metadata = {
  title: 'ToolsKit — Free SA Financial Calculators & Online Tools',
  description: 'Free South African financial calculators: bond calculator, PAYE/UIF calculator, VAT calculator, compound interest, and more. Plus text tools, QR generators, and everyday calculators.',
}

const CATEGORY_ORDER: ToolCategory[] = ['document', 'universal-financial', 'everyday', 'text', 'sa-financial']

export default function HomePage() {
  const toolsByCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    meta: CATEGORIES[cat],
    tools: TOOLS.filter(t => t.category === cat),
  }))

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h1>
          Free tools for <span>smarter decisions</span>
        </h1>
        <p>
          Online PDF and document utilities, universal financial calculators, and everyday tools.
          Everything runs in your browser — private, fast, and free.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">{TOOLS.length}+</div>
            <div className="hero-stat-label">Free tools</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">2025/26</div>
            <div className="hero-stat-label">SARS tax year</div>
          </div>
        </div>
      </section>

      {/* Ad banner */}
      <div style={{ maxWidth: 1280, margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      {/* Tool Sections by Category */}
      {toolsByCategory.map(({ cat, meta, tools }) => (
        <section key={cat} id={cat} className="section">
          <div className="section-header">
            <div>
              <div className="section-title">
                <span
                  className="category-dot"
                  style={{ background: meta.color }}
                />
                {meta.label}
              </div>
              <p className="section-subtitle">{meta.description}</p>
            </div>
          </div>

          <div className="tools-grid">
            {tools.map(tool => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="tool-card"
                aria-label={`Open ${tool.name}`}
              >
                {tool.featured && <span className="featured-badge">Popular</span>}
                <div className={`tool-card-icon badge-${tool.color || 'teal'}`}>{tool.icon}</div>
                <h2 className="tool-card-name">{tool.name}</h2>
                <p className="tool-card-desc">{tool.description}</p>
                <div className="tool-card-arrow">
                  Open tool <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="email-cta">
          <h3>Get notified about SA tax & rate changes</h3>
          <p>When SARS updates tax tables or SARB changes the repo rate, we&apos;ll update our calculators and let you know.</p>
          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 480, margin: '0 auto', justifyContent: 'center' }}>
            <Link href="/tools/bond-calculator-south-africa" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
              Try Bond Calculator
            </Link>
            <Link href="/tools/paye-calculator-south-africa" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              Try PAYE Calculator
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
