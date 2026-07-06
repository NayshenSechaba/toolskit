export type ToolCategory = 'sa-financial' | 'everyday' | 'text' | 'document'

export interface Tool {
  slug: string
  name: string
  description: string
  category: ToolCategory
  icon: string
  keywords: string[]
  featured?: boolean
}

export const TOOLS: Tool[] = [
  // SA Financial Calculators
  {
    slug: 'bond-calculator-south-africa',
    name: 'Bond / Home Loan Calculator',
    description: 'Calculate monthly repayments, total interest, and amortisation schedule for SA home loans. Includes bond registration costs and transfer duty.',
    category: 'sa-financial',
    icon: '🏠',
    keywords: ['bond calculator', 'home loan calculator south africa', 'mortgage calculator sa', 'amortisation calculator'],
    featured: true,
  },
  {
    slug: 'paye-calculator-south-africa',
    name: 'PAYE / UIF / SDL Calculator',
    description: 'Calculate your South African income tax (PAYE), UIF, and SDL based on your gross salary and the current SARS tax tables.',
    category: 'sa-financial',
    icon: '💼',
    keywords: ['paye calculator south africa', 'salary tax calculator sa', 'income tax calculator sars', 'uif calculator'],
    featured: true,
  },
  {
    slug: 'vat-calculator-south-africa',
    name: 'VAT Calculator',
    description: 'Instantly calculate VAT inclusive and exclusive amounts at the South African VAT rate of 15%.',
    category: 'sa-financial',
    icon: '🧾',
    keywords: ['vat calculator south africa', 'vat inclusive calculator', 'vat exclusive calculator', '15% vat'],
    featured: true,
  },
  {
    slug: 'compound-interest-calculator',
    name: 'Compound Interest & Savings Calculator',
    description: 'Project your savings growth with regular contributions, compounding frequency, and different interest rates.',
    category: 'sa-financial',
    icon: '📈',
    keywords: ['compound interest calculator', 'savings calculator south africa', 'investment growth calculator'],
    featured: true,
  },
  {
    slug: 'debt-payoff-calculator',
    name: 'Debt Snowball vs Avalanche Calculator',
    description: 'Compare the debt snowball and avalanche methods to find the fastest, cheapest way to pay off your debts.',
    category: 'sa-financial',
    icon: '❄️',
    keywords: ['debt snowball calculator', 'debt avalanche calculator', 'debt payoff calculator', 'debt free calculator'],
  },
  // Everyday Calculators
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages, percentage changes, percentage of a total, and more — instantly.',
    category: 'everyday',
    icon: '%',
    keywords: ['percentage calculator', 'percent calculator', 'percentage change', 'what is x percent of y'],
    featured: true,
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Calculate your Body Mass Index (BMI) using metric or imperial measurements and understand what it means.',
    category: 'everyday',
    icon: '⚖️',
    keywords: ['bmi calculator', 'body mass index calculator', 'bmi calculator metric'],
  },
  {
    slug: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tip amounts and split the bill between any number of people.',
    category: 'everyday',
    icon: '🍽️',
    keywords: ['tip calculator', 'bill split calculator', 'restaurant tip calculator'],
  },
  // Text & Productivity Tools
  {
    slug: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, secure passwords with custom length and character options. All generated locally — nothing sent to any server.',
    category: 'text',
    icon: '🔐',
    keywords: ['password generator', 'strong password generator', 'secure password generator', 'random password'],
    featured: true,
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs. Estimate reading time for any text.',
    category: 'text',
    icon: '📝',
    keywords: ['word counter', 'character counter', 'word count tool', 'reading time calculator'],
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes instantly from any URL or text. Download as PNG for free.',
    category: 'text',
    icon: '📱',
    keywords: ['qr code generator', 'free qr code', 'qr code maker', 'generate qr code'],
    featured: true,
  },
]

export const CATEGORIES: Record<ToolCategory, { label: string; description: string; color: string }> = {
  'sa-financial': {
    label: 'SA Financial',
    description: 'South Africa-specific financial calculators built with local tax tables and rates',
    color: '#2563EB',
  },
  'everyday': {
    label: 'Everyday Calculators',
    description: 'Quick, useful calculators for daily life',
    color: '#059669',
  },
  'text': {
    label: 'Text & Productivity',
    description: 'Tools to work smarter with text and content',
    color: '#7C3AED',
  },
  'document': {
    label: 'Document Tools',
    description: 'Process and convert your documents and files',
    color: '#DC2626',
  },
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category)
}

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((t) => t.featured)
}
