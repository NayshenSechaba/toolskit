'use client'

import { useState, useCallback } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'

function analyseText(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return null

  const words = trimmed.split(/\s+/).filter(Boolean)
  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const readingTimeMin = Math.ceil(words.length / 200) // avg 200 wpm
  const speakingTimeMin = Math.ceil(words.length / 130) // avg 130 wpm speaking

  return {
    words: words.length,
    chars,
    charsNoSpaces,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    readingTime: readingTimeMin < 1 ? '< 1 min' : `${readingTimeMin} min`,
    speakingTime: speakingTimeMin < 1 ? '< 1 min' : `${speakingTimeMin} min`,
  }
}

export default function WordCounterPage() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const stats = analyseText(text)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Word Counter</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">📝</span>
        <h1>Word Counter & Text Analyser</h1>
        <p>Count words, characters, sentences, and paragraphs. Estimate reading and speaking time. Works offline.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div className="calc-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label className="label" htmlFor="word-counter-input">Your Text</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy} aria-label="Copy text">
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="copy-btn" onClick={() => setText('')} aria-label="Clear text">
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        <textarea
          id="word-counter-input"
          className="textarea-tool"
          style={{ minHeight: '250px' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          aria-label="Text to analyse"
        />

        {/* Live stats bar */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '1rem',
          padding: '0.875rem 1rem',
          background: 'var(--surface-alt)',
          borderRadius: 'var(--radius-sm)',
          flexWrap: 'wrap',
        }}>
          {[
            ['Words', stats?.words ?? 0],
            ['Characters', stats?.chars ?? 0],
            ['No-space chars', stats?.charsNoSpaces ?? 0],
            ['Sentences', stats?.sentences ?? 0],
            ['Paragraphs', stats?.paragraphs ?? 0],
          ].map(([label, value]) => (
            <div key={label as string} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em' }}>
                {value.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats && (
        <div className="results-card" style={{ marginTop: '1rem' }}>
          <div className="results-title">📊 Time Estimates</div>
          <div className="results-grid">
            <div className="result-item">
              <div className="result-item-label">Reading Time</div>
              <div className="result-item-value primary">{stats.readingTime}</div>
            </div>
            <div className="result-item">
              <div className="result-item-label">Speaking Time</div>
              <div className="result-item-value">{stats.speakingTime}</div>
            </div>
          </div>
        </div>
      )}

      <div className="info-box" style={{ marginTop: '1rem' }}>
        <strong>Reading time</strong> assumes an average reading speed of 200 words per minute.{' '}
        <strong>Speaking time</strong> assumes 130 words per minute, typical for presentations.
        Average adult reading speed is 200–250 wpm.
      </div>

      <EmailCta
        source="word-counter"
        headline="Get productivity tips & tool updates"
        subtext="We send occasional tips on writing and digital tools. Unsubscribe any time."
      />

      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-item">
          <div className="faq-question">What counts as a word?</div>
          <div className="faq-answer">
            We split text on whitespace — so any sequence of non-whitespace characters counts as one word.
            Hyphenated words like &ldquo;well-known&rdquo; count as one word. Numbers count as words too.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How accurate is the reading time estimate?</div>
          <div className="faq-answer">
            The estimate uses 200 words per minute, which is the widely cited average for adult silent reading.
            Actual speed varies significantly — fast readers can exceed 400 wpm, while dense technical text
            may slow readers to 100 wpm or less.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Is my text stored anywhere?</div>
          <div className="faq-answer">
            No. All processing happens entirely in your browser. Your text never leaves your device.
            You can use this tool with sensitive documents without any privacy concerns.
          </div>
        </div>
      </section>
    </div>
  )
}
