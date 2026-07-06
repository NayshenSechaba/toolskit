'use client'

import { useState, useRef } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import EmailCta from '@/components/EmailCta'
import AdSlot from '@/components/layout/AdSlot'
import Link from 'next/link'
import { FileText, ArrowLeft, ArrowRight, RotateCw, Trash2, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

// Set up the PDFjs worker using unpkg CDN matching the npm installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.370'}/build/pdf.worker.min.js`

interface VisualPage {
  id: string
  originalIndex: number
  thumbnailUrl: string
  rotation: number // 0, 90, 180, 270
}

export default function PdfOrganizeClient() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [pages, setPages] = useState<VisualPage[]>([])
  const [rendering, setRendering] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setRendering(true)
    setPages([])

    try {
      const buffer = await selectedFile.arrayBuffer()
      setPdfBuffer(buffer)

      // Load PDF using pdfjs to extract thumbnails
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
      const pdf = await loadingTask.promise
      const pageCount = pdf.numPages

      const extractedPages: VisualPage[] = []

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.25 }) // small thumbnail size

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height

        if (context) {
          await page.render({ canvasContext: context, canvas: canvas, viewport }).promise
          const thumbnailUrl = canvas.toDataURL()
          extractedPages.push({
            id: Math.random().toString(36).substring(2, 9),
            originalIndex: i - 1, // 0-indexed
            thumbnailUrl,
            rotation: 0,
          })
        }
      }

      setPages(extractedPages)
    } catch (err) {
      console.error(err)
      setError('Could not render PDF thumbnails. The file might be encrypted or corrupted.')
    } finally {
      setRendering(false)
    }
  }

  const handleRotate = (id: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, rotation: (p.rotation + 90) % 360 }
      }
      return p
    }))
  }

  const handleDelete = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id))
  }

  const handleMoveLeft = (index: number) => {
    if (index === 0) return
    setPages(prev => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index - 1]
      next[index - 1] = temp
      return next
    })
  }

  const handleMoveRight = (index: number) => {
    if (index === pages.length - 1) return
    setPages(prev => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index + 1]
      next[index + 1] = temp
      return next
    })
  }

  const handleSave = async () => {
    if (!file || !pdfBuffer || pages.length === 0) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const srcDoc = await PDFDocument.load(pdfBuffer)
      const destDoc = await PDFDocument.create()

      for (const visualPage of pages) {
        // Copy page from source document
        const [copiedPage] = await destDoc.copyPages(srcDoc, [visualPage.originalIndex])
        
        // Rotate page based on cumulative rotation edits
        if (visualPage.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle
          copiedPage.setRotation(degrees(currentRotation + visualPage.rotation))
        }

        destDoc.addPage(copiedPage)
      }

      const savedBytes = await destDoc.save()
      const blob = new Blob([savedBytes as any], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `organized_${file.name}`
      link.click()
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('An error occurred while compiling your organized PDF.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tool-shell">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Organize PDF</span>
      </nav>

      <div className="tool-header">
        <span className="tool-icon-large">🗂️</span>
        <h1>Organize PDF</h1>
        <p>Visually sort, re-order, rotate, or delete pages in your PDF document. Processed 100% locally.</p>
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
          onClick={() => fileInputRef.current?.click()}
          >
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
              Drag and drop a PDF file here, or click to browse
            </p>
            <input
              ref={fileInputRef}
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
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {pages.length} pages ready
                  </div>
                </div>
              </div>
              <button className="copy-btn" onClick={() => { setFile(null); setPages([]); setSuccess(false) }}>
                Change File
              </button>
            </div>

            {rendering && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Generating page previews…</span>
              </div>
            )}

            {pages.length > 0 && (
              <div>
                {/* Visual grid of thumbnails */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '1.5rem 1rem',
                  marginBottom: '2rem',
                }}>
                  {pages.map((p, index) => (
                    <div key={p.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'white',
                      border: '1.5px solid var(--surface-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                    }}>
                      {/* Page number badge */}
                      <span style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '-5px',
                        background: 'var(--primary)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        zIndex: 10,
                      }}>
                        Page {index + 1}
                      </span>

                      {/* Original page source ref */}
                      <span style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-5px',
                        background: 'var(--text-secondary)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        zIndex: 10,
                        opacity: 0.8,
                      }} title="Original page index">
                        Orig: {p.originalIndex + 1}
                      </span>

                      {/* Thumbnail wrapper with rotation */}
                      <div style={{
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        background: 'var(--surface-alt)',
                        borderRadius: '4px',
                        margin: '0.25rem 0 0.5rem',
                      }}>
                        <img
                          src={p.thumbnailUrl}
                          alt={`Thumbnail of page ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: `rotate(${p.rotation}deg)`,
                            transition: 'transform 0.15s ease',
                          }}
                        />
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2px', marginTop: 'auto' }}>
                        <button
                          className="copy-btn"
                          onClick={() => handleRotate(p.id)}
                          style={{ flex: 1, padding: '0.25rem 0', display: 'flex', justifyContent: 'center' }}
                          title="Rotate 90° Clockwise"
                        >
                          <RotateCw size={13} />
                        </button>
                        <button
                          className="copy-btn"
                          onClick={() => handleDelete(p.id)}
                          style={{ flex: 1, padding: '0.25rem 0', display: 'flex', justifyContent: 'center', color: 'var(--red)', borderColor: 'rgba(220,38,38,0.2)' }}
                          title="Delete Page"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Navigation buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2px', marginTop: '4px' }}>
                        <button
                          className="copy-btn"
                          onClick={() => handleMoveLeft(index)}
                          disabled={index === 0}
                          style={{ flex: 1, padding: '0.25rem 0', display: 'flex', justifyContent: 'center' }}
                        >
                          <ArrowLeft size={13} />
                        </button>
                        <button
                          className="copy-btn"
                          onClick={() => handleMoveRight(index)}
                          disabled={index === pages.length - 1}
                          style={{ flex: 1, padding: '0.25rem 0', display: 'flex', justifyContent: 'center' }}
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  id="organize-pdf-submit-btn"
                  className="btn btn-primary btn-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} style={{ marginRight: '0.25rem' }} />
                  {saving ? 'Compiling PDF…' : 'Save and Download PDF'}
                </button>
              </div>
            )}
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
            <span>PDF organized and downloaded successfully!</span>
          </div>
        )}
      </div>

      <div className="info-box">
        <strong>🔒 High Security:</strong> Rendering thumbnails and modifying page indexes is performed on your device.
      </div>

      <EmailCta source="pdf-organize" />

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
