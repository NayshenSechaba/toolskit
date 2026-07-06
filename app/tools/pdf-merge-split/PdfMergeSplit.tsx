'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { FileText, ArrowUp, ArrowDown, Trash2, Plus, Download, AlertCircle, CheckCircle } from 'lucide-react'

interface MergeFile {
  file: File
  id: string
}

export default function PdfMergeSplit() {
  const [activeTab, setActiveTab] = useState<'merge' | 'split'>('merge')
  
  // Merge state
  const [mergeFiles, setMergeFiles] = useState<MergeFile[]>([])
  const [merging, setMerging] = useState(false)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const [mergeSuccess, setMergeSuccess] = useState(false)

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [splitMode, setSplitMode] = useState<'range' | 'single'>('range')
  const [pageRange, setPageRange] = useState('1-2')
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [splitError, setSplitError] = useState<string | null>(null)
  const [splitSuccess, setSplitSuccess] = useState(false)

  // Helper to read file as ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  // Handle PDF select for merging
  const handleMergeFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles: MergeFile[] = []
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i]
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        newFiles.push({
          file,
          id: Math.random().toString(36).substring(2, 9),
        })
      }
    }
    setMergeFiles(prev => [...prev, ...newFiles])
    setMergeSuccess(false)
    setMergeError(null)
  }

  // Remove file from merge list
  const removeMergeFile = (id: string) => {
    setMergeFiles(prev => prev.filter(f => f.id !== id))
  }

  // Move file up in list
  const moveMergeFileUp = (index: number) => {
    if (index === 0) return
    setMergeFiles(prev => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index - 1]
      next[index - 1] = temp
      return next
    })
  }

  // Move file down in list
  const moveMergeFileDown = (index: number) => {
    setMergeFiles(prev => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index + 1]
      next[index + 1] = temp
      return next
    })
  }

  // Run PDF Merge logic
  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      setMergeError('Please select at least 2 PDF files to merge.')
      return
    }

    setMerging(true)
    setMergeError(null)
    setMergeSuccess(false)

    try {
      const mergedPdf = await PDFDocument.create()

      for (const mergeFile of mergeFiles) {
        const buffer = await readFileAsArrayBuffer(mergeFile.file)
        const pdf = await PDFDocument.load(buffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'merged_document.pdf'
      link.click()
      setMergeSuccess(true)
    } catch (err) {
      console.error(err)
      setMergeError('An error occurred while merging your PDF files. Please ensure they are not corrupted or password-protected.')
    } finally {
      setMerging(false)
    }
  }

  // Handle PDF select for splitting
  const handleSplitFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setSplitError('Please select a valid PDF file.')
      return
    }

    setSplitFile(file)
    setSplitError(null)
    setSplitSuccess(false)
    setPdfPageCount(null)

    try {
      const buffer = await readFileAsArrayBuffer(file)
      setPdfBuffer(buffer)
      const pdf = await PDFDocument.load(buffer)
      const pageCount = pdf.getPageCount()
      setPdfPageCount(pageCount)
      setPageRange(`1-${Math.min(pageCount, 2)}`)
    } catch (err) {
      console.error(err)
      setSplitError('Could not read PDF page information. The file might be encrypted or corrupted.')
    }
  }

  // Parse page range input (e.g. "1-3, 5")
  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>()
    const parts = rangeStr.split(',')
    
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
            if (i >= 1 && i <= maxPages) {
              pages.add(i - 1) // convert to 0-indexed
            }
          }
        }
      } else {
        const pageNum = parseInt(cleanPart)
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.add(pageNum - 1) // convert to 0-indexed
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b)
  }

  // Run PDF Split/Extract logic
  const handleSplit = async () => {
    if (!splitFile || !pdfBuffer || !pdfPageCount) {
      setSplitError('Please select a PDF file first.')
      return
    }

    setSplitting(true)
    setSplitError(null)
    setSplitSuccess(false)

    try {
      const srcPdf = await PDFDocument.load(pdfBuffer)

      if (splitMode === 'range') {
        const targetPages = parsePageRange(pageRange, pdfPageCount)
        if (targetPages.length === 0) {
          setSplitError('Invalid page range specified. Please use format like "1-3" or "1, 3, 5".')
          setSplitting(false)
          return
        }

        const newPdf = await PDFDocument.create()
        const copiedPages = await newPdf.copyPages(srcPdf, targetPages)
        copiedPages.forEach((page) => newPdf.addPage(page))

        const newPdfBytes = await newPdf.save()
        const blob = new Blob([newPdfBytes as any], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `extracted_pages_${splitFile.name}`
        link.click()
        setSplitSuccess(true)
      } else {
        // Split to individual pages - downloads all pages as individual PDFs
        for (let i = 0; i < pdfPageCount; i++) {
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(srcPdf, [i])
          newPdf.addPage(copiedPage)
          const newPdfBytes = await newPdf.save()
          
          const blob = new Blob([newPdfBytes as any], { type: 'application/pdf' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `page_${i + 1}_of_${splitFile.name}`
          link.click()
          // Small delay to prevent browser blockages on multiple downloads
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        setSplitSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setSplitError('An error occurred while splitting the PDF.')
    } finally {
      setSplitting(false)
    }
  }

  return (
    <div className="tool-shell">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>PDF Merge & Split</span>
      </nav>

      {/* Header */}
      <div className="tool-header">
        <span className="tool-icon-large">📄</span>
        <h1>Free PDF Merge & Split</h1>
        <p>
          Combine multiple PDF documents into one, or extract select pages from a PDF.
          Processed locally in your browser — your files are never uploaded to any server.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AdSlot size="banner" />
      </div>

      {/* Tabs */}
      <div className="toggle-group" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <button
          className={`toggle-btn ${activeTab === 'merge' ? 'active' : ''}`}
          onClick={() => setActiveTab('merge')}
        >
          Merge PDF
        </button>
        <button
          className={`toggle-btn ${activeTab === 'split' ? 'active' : ''}`}
          onClick={() => setActiveTab('split')}
        >
          Split PDF
        </button>
      </div>

      {/* Merge PDF Panel */}
      {activeTab === 'merge' && (
        <div>
          <div className="calc-card">
            <h2 className="label" style={{ marginBottom: '0.75rem' }}>Select PDF Files to Combine</h2>
            
            <div style={{
              border: '2px dashed var(--surface-border)',
              borderRadius: 'var(--radius)',
              padding: '2.5rem',
              textAlign: 'center',
              background: 'var(--surface-alt)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'border-color 0.2s',
            }}
            onClick={() => document.getElementById('merge-file-input')?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              if (e.dataTransfer.files) {
                const newFiles: MergeFile[] = []
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                  const file = e.dataTransfer.files[i]
                  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                    newFiles.push({
                      file,
                      id: Math.random().toString(36).substring(2, 9),
                    })
                  }
                }
                setMergeFiles(prev => [...prev, ...newFiles])
                setMergeSuccess(false)
                setMergeError(null)
              }
            }}
            >
              <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                Drag and drop PDF files here, or click to browse
              </p>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Supports selecting multiple files</span>
              <input
                id="merge-file-input"
                type="file"
                multiple
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleMergeFilesSelect}
              />
            </div>

            {/* Merge files list */}
            {mergeFiles.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 className="label" style={{ marginBottom: '0.5rem' }}>Files to Merge ({mergeFiles.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {mergeFiles.map((mFile, index) => (
                    <div key={mFile.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'white',
                      border: '1.5px solid var(--surface-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <span style={{ fontSize: '1.25rem' }}>📄</span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mFile.file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {(mFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <button
                          className="copy-btn"
                          onClick={() => moveMergeFileUp(index)}
                          disabled={index === 0}
                          style={{ padding: '0.3rem 0.5rem' }}
                          aria-label="Move file up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="copy-btn"
                          onClick={() => moveMergeFileDown(index)}
                          disabled={index === mergeFiles.length - 1}
                          style={{ padding: '0.3rem 0.5rem' }}
                          aria-label="Move file down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          className="copy-btn"
                          onClick={() => removeMergeFile(mFile.id)}
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--red)', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                          aria-label="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merge Action Button */}
                <button
                  id="merge-pdf-btn"
                  className="btn btn-primary btn-full"
                  style={{ marginTop: '1.5rem' }}
                  onClick={handleMerge}
                  disabled={merging}
                >
                  {merging ? 'Processing PDFs…' : 'Merge PDFs'}
                </button>
              </div>
            )}

            {/* Alerts */}
            {mergeError && (
              <div style={{ display: 'flex', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem', color: '#B91C1C', fontSize: '0.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{mergeError}</span>
              </div>
            )}

            {mergeSuccess && (
              <div style={{ display: 'flex', gap: '0.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem', color: '#15803D', fontSize: '0.85rem' }}>
                <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>PDF files merged and downloaded successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Split PDF Panel */}
      {activeTab === 'split' && (
        <div>
          <div className="calc-card">
            <h2 className="label" style={{ marginBottom: '0.75rem' }}>Select PDF File to Split</h2>
            
            {!splitFile ? (
              <div style={{
                border: '2px dashed var(--surface-border)',
                borderRadius: 'var(--radius)',
                padding: '2.5rem',
                textAlign: 'center',
                background: 'var(--surface-alt)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => document.getElementById('split-file-input')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0]
                  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                    handleSplitFileSelect({
                      target: { files: e.dataTransfer.files }
                    } as unknown as React.ChangeEvent<HTMLInputElement>)
                  }
                }
              }}
              >
                <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                  Drag and drop a PDF file here, or click to browse
                </p>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Upload one PDF to extract pages</span>
                <input
                  id="split-file-input"
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleSplitFileSelect}
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
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{splitFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(splitFile.size / 1024 / 1024).toFixed(2)} MB • {pdfPageCount !== null ? `${pdfPageCount} pages` : 'Reading details…'}
                      </div>
                    </div>
                  </div>
                  <button className="copy-btn" onClick={() => { setSplitFile(null); setPdfPageCount(null); setSplitSuccess(false) }}>
                    Change File
                  </button>
                </div>

                {pdfPageCount !== null && (
                  <div className="calc-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="field field-full">
                      <label className="label">Split Mode</label>
                      <div className="toggle-group" style={{ maxWidth: '350px', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          className={`toggle-btn ${splitMode === 'range' ? 'active' : ''}`}
                          onClick={() => setSplitMode('range')}
                        >
                          Extract Page Range
                        </button>
                        <button
                          type="button"
                          className={`toggle-btn ${splitMode === 'single' ? 'active' : ''}`}
                          onClick={() => setSplitMode('single')}
                        >
                          Split all pages
                        </button>
                      </div>
                    </div>

                    {splitMode === 'range' && (
                      <div className="field">
                        <label className="label" htmlFor="split-range">Page Range to Extract</label>
                        <div className="input-wrap">
                          <input
                            id="split-range"
                            className="input"
                            value={pageRange}
                            onChange={e => setPageRange(e.target.value)}
                            placeholder="e.g. 1-3, 5"
                            aria-label="Pages to extract"
                          />
                        </div>
                        <span className="text-muted">
                          Enter comma-separated pages or ranges (up to {pdfPageCount} pages)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  id="split-pdf-btn"
                  className="btn btn-primary btn-full"
                  onClick={handleSplit}
                  disabled={splitting || pdfPageCount === null}
                >
                  {splitting ? 'Processing PDF…' : splitMode === 'range' ? 'Extract Selected Pages' : 'Download All Pages Separately'}
                </button>
              </div>
            )}

            {/* Alerts */}
            {splitError && (
              <div style={{ display: 'flex', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem', color: '#B91C1C', fontSize: '0.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{splitError}</span>
              </div>
            )}

            {splitSuccess && (
              <div style={{ display: 'flex', gap: '0.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem', color: '#15803D', fontSize: '0.85rem' }}>
                <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>PDF split complete! Downloaded successfully.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        <strong>🔒 Private & Secure</strong> — Your PDF documents never leave your browser. All merging and page extraction
        happens on your device using client-side JavaScript. This ensures sensitive documents (like bank statements
        or tax invoices) remain completely confidential.
      </div>

      <EmailCta source="pdf-merge-split" headline="Get tool updates & tax compliance tips" />

      {/* FAQ */}
      <section className="faq-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-item">
          <div className="faq-question">How does client-side PDF processing work?</div>
          <div className="faq-answer">
            We use a library called <code>pdf-lib</code> that runs natively inside your browser. When you select files,
            your browser reads their binary data locally, modifies or compiles them into a new file, and triggers a download.
            Since no server is involved, it is faster and completely private.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Is there a file size limit?</div>
          <div className="faq-answer">
            There is no strict size limit, but because all processing uses your device's memory (RAM), very large PDFs
            (e.g., above 100MB or thousands of pages) might slow down or crash your browser tab. For typical documents,
            contracts, and statements, it works instantly.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Can I split password-protected PDFs?</div>
          <div className="faq-answer">
            No, password-protected (encrypted) PDFs cannot be read or split without decrypting them first. You must decrypt
            the file before using this tool.
          </div>
        </div>
      </section>
    </div>
  )
}
