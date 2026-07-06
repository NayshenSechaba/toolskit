'use client'

import { useState } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { FileText, Stamp, AlertCircle, CheckCircle } from 'lucide-react'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return { r: isNaN(r) ? 0.5 : r, g: isNaN(g) ? 0.5 : g, b: isNaN(b) ? 0.5 : b }
}

export default function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState('#EF4444') // Red
  const [opacity, setOpacity] = useState(0.3)
  const [rotationAngle, setRotationAngle] = useState(45) // degrees
  const [position, setPosition] = useState<'center' | 'top' | 'bottom'>('center')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const selectedFile = e.target.files[0]
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF file.')
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(false)
    setPdfPageCount(null)

    try {
      const buffer = await selectedFile.arrayBuffer()
      setPdfBuffer(buffer)
      const pdf = await PDFDocument.load(buffer)
      setPdfPageCount(pdf.getPageCount())
    } catch (err) {
      console.error(err)
      setError('Could not read PDF. The file might be encrypted or corrupted.')
    }
  }

  const handleWatermark = async () => {
    if (!file || !pdfBuffer || !pdfPageCount) return
    if (!text.trim()) {
      setError('Please enter a watermark text.')
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const pages = pdfDoc.getPages()
      const { r, g, b } = hexToRgb(color)

      for (const page of pages) {
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        const textHeight = font.heightAtSize(fontSize)

        let x = 0
        let y = 0

        if (position === 'center') {
          // Adjust for angle rotation offset approx
          const rad = (rotationAngle * Math.PI) / 180
          const offsetW = Math.abs(Math.cos(rad) * textWidth) / 2
          const offsetH = Math.abs(Math.sin(rad) * textWidth) / 2
          x = width / 2 - offsetW
          y = height / 2 - offsetH
        } else if (position === 'top') {
          x = width / 2 - textWidth / 2
          y = height - textHeight - 40
        } else if (position === 'bottom') {
          x = width / 2 - textWidth / 2
          y = 40
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: font,
          color: rgb(r, g, b),
          opacity: opacity,
          rotate: degrees(rotationAngle),
        })
      }

      const watermarkedBytes = await pdfDoc.save()
      const blob = new Blob([watermarkedBytes as any], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `watermarked_${file.name}`
      link.click()
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('An error occurred while adding the watermark.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Watermark PDF</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🔏</span>
        <h1>Watermark PDF</h1>
        <p>Stamp a text watermark onto all pages of your PDF. Secure, instant local processing.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      <div className="calc-card">
        {!file ? (
          <div style={{
            border: '2px dashed var(--surface-border)',
            borderRadius: 'var(--radius)',
            padding: '2.5rem',
            textAlign: 'center',
            background: 'var(--surface-alt)',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('watermark-file-input')?.click()}
          >
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
              Drag and drop a PDF file here, or click to browse
            </p>
            <input
              id="watermark-file-input"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface-alt)',
              border: '1.5px solid var(--surface-border)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {pdfPageCount !== null ? `${pdfPageCount} pages` : 'Reading...'}
                  </div>
                </div>
              </div>
              <button className="copy-btn" onClick={() => { setFile(null); setPdfPageCount(null); setSuccess(false) }}>
                Change File
              </button>
            </div>

            {pdfPageCount !== null && (
              <div className="calc-grid" style={{ marginBottom: '1.5rem' }}>
                {/* Watermark text */}
                <div className="field field-full">
                  <label className="label" htmlFor="wm-text">Watermark Text</label>
                  <input
                    id="wm-text"
                    className="input"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL"
                  />
                </div>

                {/* Font Size */}
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="label" htmlFor="wm-size">Font Size</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{fontSize}px</span>
                  </div>
                  <input
                    id="wm-size"
                    type="range"
                    className="range-slider"
                    min={12}
                    max={120}
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                  />
                </div>

                {/* Rotation Angle */}
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="label" htmlFor="wm-angle">Rotation (Degrees)</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{rotationAngle}°</span>
                  </div>
                  <input
                    id="wm-angle"
                    type="range"
                    className="range-slider"
                    min={-90}
                    max={90}
                    value={rotationAngle}
                    onChange={e => setRotationAngle(Number(e.target.value))}
                    disabled={position !== 'center'}
                  />
                  {position !== 'center' && <span className="text-muted" style={{ fontSize: '0.75rem' }}>Rotation requires center position</span>}
                </div>

                {/* Opacity */}
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="label" htmlFor="wm-opacity">Opacity</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    id="wm-opacity"
                    type="range"
                    className="range-slider"
                    min={10}
                    max={100}
                    step={5}
                    value={opacity * 100}
                    onChange={e => setOpacity(Number(e.target.value) / 100)}
                  />
                </div>

                {/* Color Picker */}
                <div className="field">
                  <label className="label" htmlFor="wm-color">Watermark Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      id="wm-color"
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      style={{ width: 42, height: 42, border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 2 }}
                    />
                    <span className="input" style={{ cursor: 'default', fontSize: '0.85rem' }}>{color}</span>
                  </div>
                </div>

                {/* Position preset */}
                <div className="field field-full">
                  <label className="label">Position</label>
                  <div className="toggle-group" style={{ maxWidth: '350px', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className={`toggle-btn ${position === 'center' ? 'active' : ''}`}
                      onClick={() => setPosition('center')}
                    >
                      Diagonal Center
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${position === 'top' ? 'active' : ''}`}
                      onClick={() => { setPosition('top'); setRotationAngle(0) }}
                    >
                      Top Center
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${position === 'bottom' ? 'active' : ''}`}
                      onClick={() => { setPosition('bottom'); setRotationAngle(0) }}
                    >
                      Bottom Center
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              id="watermark-pdf-submit-btn"
              className="btn btn-primary btn-full"
              onClick={handleWatermark}
              disabled={processing || pdfPageCount === null}
            >
              <Stamp size={16} style={{ marginRight: '0.25rem' }} />
              {processing ? 'Applying Watermark…' : 'Watermark and Download PDF'}
            </button>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem', color: '#B91C1C', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', gap: '0.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem', color: '#15803D', fontSize: '0.85rem' }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Watermark stamped successfully! Download triggered.</span>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>🔒 Privacy First:</strong> Stamping is processed inside your browser engine. Files are never sent over the web.
      </div>

      <EmailCta source="pdf-watermark" />
    </div>
  )
}
