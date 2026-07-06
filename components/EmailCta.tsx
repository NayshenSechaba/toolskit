'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

interface EmailCtaProps {
  source: string
  headline?: string
  subtext?: string
}

export default function EmailCta({
  source,
  headline = 'Stay updated with SA tax & rate changes',
  subtext = 'We\'ll notify you when SARS updates tax tables or SARB changes interest rates. No spam, ever.',
}: EmailCtaProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('loading')
    const { error } = await supabase
      .from('subscribers')
      .upsert({ email: email.toLowerCase().trim(), source }, { onConflict: 'email' })

    if (error) {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="email-cta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle size={32} strokeWidth={2} />
        <div>
          <h3 style={{ margin: 0 }}>You&apos;re in! 🎉</h3>
          <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>We&apos;ll let you know about any SA tax or rate updates.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="email-cta">
      <h3>{headline}</h3>
      <p>{subtext}</p>
      <form className="email-form" onSubmit={handleSubmit}>
        <input
          id={`email-cta-${source}`}
          type="email"
          className="email-input"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          className="email-submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Saving…' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>{errorMsg}</p>
      )}
    </div>
  )
}
