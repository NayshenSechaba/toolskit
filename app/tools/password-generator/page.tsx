'use client'

import { useState, useCallback, useEffect } from 'react'
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'

function generatePassword(length: number, opts: {
  upper: boolean, lower: boolean, numbers: boolean, symbols: boolean
}): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = ''
  if (opts.upper) charset += upper
  if (opts.lower) charset += lower
  if (opts.numbers) charset += numbers
  if (opts.symbols) charset += symbols
  if (!charset) charset = lower + numbers

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => charset[x % charset.length]).join('')
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '#E2E8F0' }
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score: (score / 6) * 100, label: 'Weak', color: '#EF4444' }
  if (score <= 4) return { score: (score / 6) * 100, label: 'Fair', color: '#F59E0B' }
  if (score <= 5) return { score: (score / 6) * 100, label: 'Strong', color: '#10B981' }
  return { score: 100, label: 'Very Strong', color: '#059669' }
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPw, setShowPw] = useState(true)
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])

  const generate = useCallback(() => {
    const pws = Array.from({ length: count }, () => generatePassword(length, opts))
    setPasswords(pws)
    setPassword(pws[0])
    setCopied(false)
  }, [length, opts, count])

  useEffect(() => { generate() }, [generate])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = getStrength(password)

  const toggle = (key: keyof typeof opts) =>
    setOpts(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Password Generator</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🔐</span>
        <h1>Secure Password Generator</h1>
        <p>Generate strong, random passwords instantly. Everything runs in your browser — nothing is sent to any server.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div className="calc-card">
        {/* Password display */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="label">Generated Password</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="copy-btn"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPw ? 'Hide' : 'Show'}
              </button>
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={() => copy(password)}
                aria-label="Copy password"
              >
                <Copy size={13} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div
            className="password-display"
            role="textbox"
            aria-readonly="true"
            aria-label="Generated password"
          >
            {showPw ? password : '•'.repeat(password.length)}
          </div>

          {/* Strength bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div className="strength-bar" style={{ flex: 1 }}>
              <div
                className="strength-fill"
                style={{ width: `${strength.score}%`, background: strength.color }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: strength.color, minWidth: 80 }}>
              {strength.label}
            </span>
          </div>
        </div>

        <hr className="divider" />

        <div className="calc-grid">
          {/* Length */}
          <div className="field field-full">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="label" htmlFor="pw-length">Password Length</label>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{length}</span>
            </div>
            <input
              id="pw-length"
              type="range"
              className="range-slider"
              min={8}
              max={64}
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              style={{ '--pct': `${((length - 8) / 56) * 100}%` } as React.CSSProperties}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>8</span><span>64</span>
            </div>
          </div>

          {/* Character options */}
          <div className="field">
            <label className="label">Character Types</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              {([
                ['upper', 'Uppercase (A–Z)'],
                ['lower', 'Lowercase (a–z)'],
                ['numbers', 'Numbers (0–9)'],
                ['symbols', 'Symbols (!@#…)'],
              ] as const).map(([key, label]) => (
                <label key={key} className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={opts[key]}
                    onChange={() => toggle(key)}
                    aria-label={label}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="field">
            <label className="label" htmlFor="pw-count">How many passwords?</label>
            <select
              id="pw-count"
              className="select"
              value={count}
              onChange={e => { setCount(Number(e.target.value)); }}
            >
              {[1, 5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <button
            id="generate-password-btn"
            className="btn btn-primary btn-full"
            onClick={generate}
            aria-label="Generate new password"
          >
            <RefreshCw size={16} />
            Generate New Password{count > 1 ? 's' : ''}
          </button>
        </div>

        {/* Multiple passwords */}
        {count > 1 && passwords.length > 1 && (
          <div style={{ marginTop: '1.25rem' }}>
            <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>All Generated Passwords</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {passwords.map((pw, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.875rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ wordBreak: 'break-all' }}>{showPw ? pw : '•'.repeat(pw.length)}</span>
                  <button className="copy-btn" onClick={() => copy(pw)} aria-label={`Copy password ${i + 1}`}>
                    <Copy size={12} /> Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>100% private</strong> — All passwords are generated using your browser&apos;s built-in{' '}
        <code>crypto.getRandomValues()</code> API. Nothing is sent to any server. Close the tab and the passwords
        are gone forever.
      </div>

      <EmailCta
        source="password-generator"
        headline="Protect your accounts — get security tips"
        subtext="We send occasional tips on digital security, password managers, and staying safe online."
      />

      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-item">
          <div className="faq-question">How long should my password be?</div>
          <div className="faq-answer">
            Security experts recommend a minimum of 12–16 characters. Longer is always better.
            A 16-character random password with mixed characters would take trillions of years to brute-force,
            even with modern hardware.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Should I use a password manager?</div>
          <div className="faq-answer">
            Yes — absolutely. A password manager (like Bitwarden, 1Password, or KeePass) lets you use a different,
            complex password for every account without having to memorise them. Use this generator to create
            the passwords and save them in your manager.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Are the generated passwords truly random?</div>
          <div className="faq-answer">
            Yes. We use the browser&apos;s <code>crypto.getRandomValues()</code> API, which is a cryptographically
            secure random number generator. This is the same standard used by banks and security software.
            It is far more random than a typical software random number generator.
          </div>
        </div>
      </section>
    </div>
  )
}
