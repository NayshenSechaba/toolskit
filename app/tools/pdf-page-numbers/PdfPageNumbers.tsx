'use client'

import { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { FileText, Hash, AlertCircle, CheckCircle } from 'lucide-react'

export default function PdfPageNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [position, setPosition] = useState<'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left'>('bottom-right')
  const [format, setFormat] = useState<'number' | 'pageN' | 'pageNofM'>('pageNofM')
  const [fontSize, setFontSize] = useState(10)
  const [skipFirstPage, setSkipFirstPage] = useState(false)
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

  const handleAddPageNumbers = async () => {
    if (!file || !pdfBuffer || !pdfPageCount) return

    setProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const totalPages = pages.length

      const startIdx = skipFirstPage ? 1 : 0

      for (let i = startIdx; i < totalPages; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()

        // Page number text label
        // Adjust page counter displayed if we skipped the first page
        const displayPageNum = skipFirstPage ? i : i + 1
        const displayTotal = skipFirstPage ? totalPages - 1 : totalPages

        let label = `${displayPageNum}`
        if (format === 'pageN') {
          label = `Page ${displayPageNum}`
        } else if (format === 'pageNofM') {
          label = `Page ${displayPageNum} of ${displayTotal}`
        }

        const labelWidth = font.widthOfTextAtSize(label, fontSize)
        const labelHeight = font.heightAtSize(fontSize)

        let x = width - labelWidth - 40 // default bottom-right
        let y = 30 // default bottom

        if (position === 'bottom-center') {
          x = width / 2 - labelWidth / 2
        } else if (position === 'bottom-left') {
          x = 40
        } else if (position === 'top-right') {
          x = width - labelWidth - 40
          y = height - labelHeight - 30
        } else if (position === 'top-center') {
          x = width / 2 - labelWidth / 2
          y = height - labelHeight - 30
        } else if (position === 'top-left') {
          x = 40
          y = height - labelHeight - 30
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font: font,
          color: rgb(0.3, 0.3, 0.3), // neutral dark-gray
        })
      }

      const numberedBytes = await pdfDoc.save()
      const blob = new Blob([numberedBytes as any], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `numbered_${file.name}`
      link.click()
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('An error occurred while adding page numbers.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Add Page Numbers</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🔢</span>
        <h1>Add PDF Page Numbers</h1>
        <p>Stamps page numbers onto your PDF documents automatically. Safe client-side execution.</p>
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
          onClick={() => document.getElementById('numbers-file-input')?.click()}
          >
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
              Drag and drop a PDF file here, or click to browse
            </p>
            <input
              id="numbers-file-input"
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
                {/* Position selector */}
                <div className="field">
                  <label className="label" htmlFor="num-pos">Position</label>
                  <select
                    id="num-pos"
                    className="select"
                    value={position}
                    onChange={e => setPosition(e.target.value as any)}
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>

                {/* Format Selector */}
                <div className="field">
                  <label className="label" htmlFor="num-format">Format</label>
                  <select
                    id="num-format"
                    className="select"
                    value={format}
                    onChange={e => setFormat(e.target.value as any)}
                  >
                    <option value="number">Simple Number (e.g. &quot;1&quot;)</option>
                    <option value="pageN">Page Label (e.g. &quot;Page 1&quot;)</option>
                    <option value="pageNofM">Page of Total (e.g. &quot;Page 1 of 10&quot;)</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="field">
                  <label className="label" htmlFor="num-size">Font Size</label>
                  <select
                    id="num-size"
                    className="select"
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                  >
                    <option value={8}>8 px</option>
                    <option value={9}>9 px</option>
                    <option value={10}>10 px</option>
                    <option value={11}>11 px</option>
                    <option value={12}>12 px</option>
                    <option value={14}>14 px</option>
                  </select>
                </div>

                {/* Skip Cover Page Checkbox */}
                <div className="field" style={{ justifyContent: 'center' }}>
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={skipFirstPage}
                      onChange={e => setSkipFirstPage(e.target.checked)}
                      aria-label="Skip first page"
                    />
                    <span>Skip numbering on cover (first) page</span>
                  </label>
                </div>
              </div>
            )}

            <button
              id="page-numbers-submit-btn"
              className="btn btn-primary btn-full"
              onClick={handleAddPageNumbers}
              disabled={processing || pdfPageCount === null}
            >
              <Hash size={16} style={{ marginRight: '0.25rem' }} />
              {processing ? 'Numbering PDF…' : 'Number and Download PDF'}
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
            <span>Page numbering complete! Download triggered.</span>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>🔒 Private Processing:</strong> We do not upload your files. All operations are run on your device.
      </div>

      <EmailCta source="pdf-page-numbers" />
    </div>
  )
}
