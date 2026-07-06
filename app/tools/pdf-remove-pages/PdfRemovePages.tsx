'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { FileText, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

export default function PdfRemovePages() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [pagesToRemoveInput, setPagesToRemoveInput] = useState('')
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

  const parsePagesToRemove = (maxPages: number): number[] => {
    const pages = new Set<number>()
    const parts = pagesToRemoveInput.split(',')

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

    return Array.from(pages)
  }

  const handleRemove = async () => {
    if (!file || !pdfBuffer || !pdfPageCount) return

    setProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const pagesToRemove = parsePagesToRemove(pdfPageCount)

      if (pagesToRemove.length === 0) {
        setError('No valid page numbers entered to remove.')
        setProcessing(false)
        return
      }

      if (pagesToRemove.length >= pdfPageCount) {
        setError('Cannot remove all pages from a PDF. You must leave at least one page.')
        setProcessing(false)
        return
      }

      // Sort indices in descending order so removal doesn't shift remaining target page indices
      pagesToRemove.sort((a, b) => b - a)

      for (const index of pagesToRemove) {
        pdfDoc.removePage(index)
      }

      const modifiedBytes = await pdfDoc.save()
      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `pages_removed_${file.name}`
      link.click()
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('An error occurred while removing pages from the PDF.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Remove PDF Pages</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🗑️</span>
        <h1>Remove PDF Pages</h1>
        <p>Delete unwanted pages from your PDF document easily. Fast, local execution keeps your data safe.</p>
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
          onClick={() => document.getElementById('remove-file-input')?.click()}
          >
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
              Drag and drop a PDF file here, or click to browse
            </p>
            <input
              id="remove-file-input"
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
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label className="label" htmlFor="remove-pages-input">Page Numbers to Remove</label>
                <div className="input-wrap">
                  <input
                    id="remove-pages-input"
                    className="input"
                    value={pagesToRemoveInput}
                    onChange={e => setPagesToRemoveInput(e.target.value)}
                    placeholder="e.g. 2, 4, 6-8"
                    aria-label="Pages to delete"
                  />
                </div>
                <span className="text-muted">
                  Use comma separated list or ranges (e.g. &quot;1, 3, 5-7&quot;) to remove those pages (total {pdfPageCount} pages)
                </span>
              </div>
            )}

            <button
              id="remove-pages-submit-btn"
              className="btn btn-primary btn-full"
              onClick={handleRemove}
              disabled={processing || pdfPageCount === null || !pagesToRemoveInput.trim()}
            >
              <Trash2 size={16} style={{ marginRight: '0.25rem' }} />
              {processing ? 'Removing pages…' : 'Remove Selected Pages'}
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
            <span>Pages deleted and new PDF downloaded successfully!</span>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>🔒 Security check:</strong> This tool runs client-side. Your files remain confidential on your computer.
      </div>

      <EmailCta source="pdf-remove-pages" />
    </div>
  )
}
