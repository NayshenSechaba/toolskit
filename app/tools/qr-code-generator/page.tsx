'use client'

import { useState, useEffect, useRef } from 'react'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { Download, RefreshCw } from 'lucide-react'

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState('https://pdfcalculate.com')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  async function generateQr(value: string) {
    if (!value.trim()) { setQrDataUrl(null); return }
    setGenerating(true)
    try {
      const QRCode = (await import('qrcode')).default
      const url = await QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        color: { dark: color, light: bgColor },
        errorCorrectionLevel: 'M',
      })
      setQrDataUrl(url)
    } catch {
      setQrDataUrl(null)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => generateQr(text), 300)
    return () => clearTimeout(t)
  }, [text, size, color, bgColor])

  function download() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>QR Code Generator</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">📱</span>
        <h1>Free QR Code Generator</h1>
        <p>Generate QR codes for any URL or text instantly. Download as PNG for free. No signup required.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        {/* Controls */}
        <div className="calc-card" style={{ margin: 0 }}>
          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <label className="label" htmlFor="qr-text">URL or Text</label>
            <textarea
              id="qr-text"
              className="textarea-tool"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter a URL, phone number, email, or any text…"
              aria-label="Text to encode in QR code"
            />
          </div>

          <div className="calc-grid">
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label" htmlFor="qr-size">Size</label>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{size}px</span>
              </div>
              <input
                id="qr-size"
                type="range"
                className="range-slider"
                min={128}
                max={512}
                step={64}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="qr-color">QR Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  id="qr-color"
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: 40, height: 40, border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 2 }}
                  aria-label="QR code foreground color"
                />
                <span className="input" style={{ flex: 1, cursor: 'default', fontSize: '0.85rem' }}>{color}</span>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="qr-bg">Background</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  id="qr-bg"
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  style={{ width: 40, height: 40, border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 2 }}
                  aria-label="QR code background color"
                />
                <span className="input" style={{ flex: 1, cursor: 'default', fontSize: '0.85rem' }}>{bgColor}</span>
              </div>
            </div>
          </div>

          <button
            id="download-qr-btn"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1.25rem' }}
            onClick={download}
            disabled={!qrDataUrl}
            aria-label="Download QR code as PNG"
          >
            <Download size={16} />
            Download PNG
          </button>
        </div>

        {/* QR Preview */}
        <div className="qr-display" style={{ minWidth: 200 }}>
          {generating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" />
              <span style={{ fontSize: '0.8rem' }}>Generating…</span>
            </div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="Generated QR code" width={Math.min(size, 256)} height={Math.min(size, 256)} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              Enter text above to generate a QR code
            </div>
          )}
        </div>
      </div>

      <div className="info-box" style={{ marginTop: '1.5rem' }}>
        <strong>Tip:</strong> For best scan results, keep a high contrast between the QR color and background.
        Black on white is the most reliable combination, especially for print.
      </div>

      <EmailCta
        source="qr-code-generator"
        headline="Get digital tools tips & updates"
        subtext="We send occasional tips on digital productivity tools. No spam."
      />

      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-item">
          <div className="faq-question">What can I encode in a QR code?</div>
          <div className="faq-answer">
            Almost anything: website URLs, plain text, phone numbers (prefix with tel:), email addresses
            (prefix with mailto:), SMS (prefix with sms:), Wi-Fi credentials, vCard contacts, and more.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How do I scan a QR code?</div>
          <div className="faq-answer">
            On modern smartphones (iOS 11+ and Android 8+), simply open your camera app and point it at the QR code.
            The phone will automatically detect the code and show a notification to open the link.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Are the QR codes generated here free to use commercially?</div>
          <div className="faq-answer">
            Yes, completely free with no restrictions. QR codes are an open standard — there are no licensing fees.
            The codes you generate here are yours to use for personal or commercial purposes.
          </div>
        </div>
      </section>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
