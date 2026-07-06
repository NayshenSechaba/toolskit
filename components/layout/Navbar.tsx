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
          ToolsKit
          <span className="logo-badge">Free</span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li><Link href="/#sa-financial" className="nav-link">🏦 SA Financial</Link></li>
            <li><Link href="/#everyday" className="nav-link">🧮 Calculators</Link></li>
            <li><Link href="/#text" className="nav-link">📝 Text Tools</Link></li>
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
