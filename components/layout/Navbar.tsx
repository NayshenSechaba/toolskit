'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Wrench } from 'lucide-react'
import { CATEGORIES } from '@/lib/tools-registry'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="logo">
          <Wrench size={20} />
          PDFCalculate
        </Link>

        <nav>
          <ul className="nav-links">
            <li><Link href="/#pdf" className="nav-link">PDF Tools</Link></li>
            <li><Link href="/#word" className="nav-link">Word Tools</Link></li>
            <li><Link href="/#excel" className="nav-link">Excel Tools</Link></li>
            <li><Link href="/#calculator" className="nav-link">Calculators</Link></li>
          </ul>
        </nav>

        <button
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.75rem', display: 'none' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  )
}
