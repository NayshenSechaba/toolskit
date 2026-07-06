import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { TOOLS, CATEGORIES, ToolCategory } from '@/lib/tools-registry'

const SA_TOOLS = TOOLS.filter(t => t.category === 'sa-financial')
const EVERYDAY_TOOLS = TOOLS.filter(t => t.category === 'everyday')
const TEXT_TOOLS = TOOLS.filter(t => t.category === 'text')

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Wrench size={18} />
              ToolsKit
            </div>
            <p className="footer-desc">
              Free South African financial calculators and online tools.
              All calculations run in your browser — no data sent to any server.
            </p>
          </div>

          <div>
            <div className="footer-col-title">SA Financial</div>
            <ul className="footer-links">
              {SA_TOOLS.map(tool => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Tools</div>
            <ul className="footer-links">
              {[...EVERYDAY_TOOLS, ...TEXT_TOOLS].map(tool => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ToolsKit. All calculations are indicative only — consult a professional for financial decisions.</p>
          <p>Built for South Africa 🇿🇦</p>
        </div>
      </div>
    </footer>
  )
}
