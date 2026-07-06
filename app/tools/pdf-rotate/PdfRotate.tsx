'use client'

import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { FileText, RotateCw, AlertCircle, CheckCircle } from 'lucide-react'

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [rotationAngle, setRotationAngle] = useState(90) // 90, 180, 270
  const [pageSelection, setPageSelection] = useState<'all' | 'odd' | 'even' | 'custom'>('all')
  const [customRange, setCustomRange] = useState('')
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
      const pageCount = pdf.getPageCount()
      setPdfPageCount(pageCount)
      setCustomRange(`1-${pageCount}`)
    } catch (err) {
      console.error(err)
      setError('Could not read PDF. The file might be encrypted or corrupted.')
    }
  }

  const parsePagesToRotate = (maxPages: number): number[] => {
    const pages = new Set<number>()

    if (pageSelection === 'all') {
      for (let i = 0; i < maxPages; i++) pages.add(i)
    } else if (pageSelection === 'odd') {
      for (let i = 0; i < maxPages; i++) {
        if ((i + 1) % 2 !== 0) pages.add(i)
      }
    } else if (pageSelection === 'even') {
      for (let i = 0; i < maxPages; i++) {
        if ((i + 1) % 2 === 0) pages.add(i)
      }
    } else if (pageSelection === 'custom') {
      const parts = customRange.split(',')
      for (const part of parts) {
        const cleanPart = part.trim()
        if (cleanPart.includes('-')) {
          const [startStr, endStr] = cleanPart.split('-')
          const start = parseInt(startStr)
          const end = parseInt(endStr)
          if (!isNaN(start) && !isNaN(end)) {
            const from = Math.min(start, end)
            const to = Math.max(start, end)
            for (let i = from; i <= to; i++) {
              if (i >= 1 && i <= maxPages) pages.add(i - 1)
            }
          }
        } else {
          const pageNum = parseInt(cleanPart)
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
            pages.add(pageNum - 1)
          }
        }
      }
    }

    return Array.from(pages)
  }

  const handleRotate = async () => {
    if (!file || !pdfBuffer || !pdfPageCount) return

    setProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const pagesToRotate = parsePagesToRotate(pdfPageCount)

      if (pagesToRotate.length === 0) {
        setError('No valid pages selected to rotate.')
        setProcessing(false)
        return
      }

      for (const pageIdx of pagesToRotate) {
        const page = pdfDoc.getPage(pageIdx)
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rotationAngle))
      }

      const rotatedBytes = await pdfDoc.save()
      const blob = new Blob([rotatedBytes as any], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `rotated_${file.name}`
      link.click()
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('An error occurred while rotating the PDF.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Rotate PDF</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🔄</span>
        <h1>Rotate PDF Pages</h1>
        <p>Rotate pages of your PDF document clockwise by 90, 180, or 270 degrees. Safe and 100% local.</p>
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
          onClick={() => document.getElementById('rotate-file-input')?.click()}
          >
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
              Drag and drop a PDF file here, or click to browse
            </p>
            <input
              id="rotate-file-input"
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
                {/* Angle selection */}
                <div className="field">
                  <label className="label">Rotation Angle</label>
                  <div className="toggle-group" style={{ marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className={`toggle-btn ${rotationAngle === 90 ? 'active' : ''}`}
                      onClick={() => setRotationAngle(90)}
                    >
                      90° CW
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${rotationAngle === 180 ? 'active' : ''}`}
                      onClick={() => setRotationAngle(180)}
                    >
                      180°
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${rotationAngle === 270 ? 'active' : ''}`}
                      onClick={() => setRotationAngle(270)}
                    >
                      270° CW
                    </button>
                  </div>
                </div>

                {/* Page selection */}
                <div className="field">
                  <label className="label">Which Pages to Rotate</label>
                  <div className="toggle-group" style={{ marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className={`toggle-btn ${pageSelection === 'all' ? 'active' : ''}`}
                      onClick={() => setPageSelection('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${pageSelection === 'odd' ? 'active' : ''}`}
                      onClick={() => setPageSelection('odd')}
                    >
                      Odd
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${pageSelection === 'even' ? 'active' : ''}`}
                      onClick={() => setPageSelection('even')}
                    >
                      Even
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${pageSelection === 'custom' ? 'active' : ''}`}
                      onClick={() => setPageSelection('custom')}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {pageSelection === 'custom' && (
                  <div className="field field-full">
                    <label className="label" htmlFor="custom-pages">Custom Page Range</label>
                    <input
                      id="custom-pages"
                      className="input"
                      value={customRange}
                      onChange={e => setCustomRange(e.target.value)}
                      placeholder="e.g. 1-3, 5"
                    />
                    <span className="text-muted">Enter page numbers and/or ranges separated by commas (up to {pdfPageCount})</span>
                  </div>
                )}
              </div>
            )}

            <button
              id="rotate-pdf-submit-btn"
              className="btn btn-primary btn-full"
              onClick={handleRotate}
              disabled={processing || pdfPageCount === null}
            >
              <RotateCw size={16} style={{ marginRight: '0.25rem' }} />
              {processing ? 'Rotating PDF…' : 'Rotate and Download PDF'}
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
            <span>PDF rotated and downloaded successfully!</span>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>🔒 Privacy First:</strong> All operations are done entirely in your browser. No files are uploaded to any server.
      </div>

      <EmailCta source="pdf-rotate" />
    </div>
  )
}
