import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { TOOLS, CATEGORIES, ToolCategory } from '@/lib/tools-registry'

const PDF_TOOLS = TOOLS.filter(t => t.category === 'pdf')
const WORD_TOOLS = TOOLS.filter(t => t.category === 'word')
const EXCEL_TOOLS = TOOLS.filter(t => t.category === 'excel')
const CALC_TOOLS = TOOLS.filter(t => t.category === 'calculator')

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Wrench size={18} />
              PDFCalculate
            </div>
            <p className="footer-desc">
              Free online PDF utilities, financial calculators, and word tools.
              All calculations run in your browser — private and serverless.
            </p>
          </div>

          <div>
            <div className="footer-col-title">PDF Tools</div>
            <ul className="footer-links">
              {PDF_TOOLS.map(tool => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Word Tools</div>
            <ul className="footer-links">
              {WORD_TOOLS.map(tool => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Excel Tools</div>
            <ul className="footer-links">
              {EXCEL_TOOLS.map(tool => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Calculators</div>
            <ul className="footer-links">
              {CALC_TOOLS.map(tool => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PDFCalculate. All calculations are indicative only — consult a professional for financial decisions.</p>
        </div>
      </div>
    </footer>
  )
}
