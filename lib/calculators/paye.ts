// PAYE / UIF / SDL Calculator — South Africa 2025/26 Tax Year

export interface PayeInputs {
  grossSalary: number
  period: 'monthly' | 'annual'
  age: number
  retirementContribution: number // monthly
  medicalAidMembers: number // number of members (including main member)
}

export interface PayeResults {
  annualGross: number
  annualTaxableIncome: number
  annualTax: number
  annualRebate: number
  annualMedicalCredit: number
  annualNetTax: number
  monthlyGross: number
  monthlyPaye: number
  monthlyUif: number
  monthlyNetSalary: number
  effectiveTaxRate: number
  marginalTaxRate: number
}

// 2025/26 Tax brackets (SARS)
const TAX_BRACKETS = [
  { from: 0, to: 237100, rate: 0.18, base: 0 },
  { from: 237101, to: 370500, rate: 0.26, base: 42678 },
  { from: 370501, to: 512800, rate: 0.31, base: 77362 },
  { from: 512801, to: 673000, rate: 0.36, base: 121475 },
  { from: 673001, to: 857900, rate: 0.39, base: 179147 },
  { from: 857901, to: 1817000, rate: 0.41, base: 251258 },
  { from: 1817001, to: Infinity, rate: 0.45, base: 644489 },
]

// 2025/26 Rebates
const PRIMARY_REBATE = 17235
const SECONDARY_REBATE = 9444 // age 65-74
const TERTIARY_REBATE = 3145 // age 75+

// Medical tax credits 2025/26
const MEDICAL_CREDIT_MAIN = 364 // per month per main member + first dependent
const MEDICAL_CREDIT_ADDITIONAL = 246 // per month per additional dependent

// UIF: 1% of gross (employee contribution, max monthly salary R17 712)
const UIF_CAP = 17712

export function calculatePaye(inputs: PayeInputs): PayeResults {
  const { grossSalary, period, age, retirementContribution, medicalAidMembers } = inputs

  const monthlyGross = period === 'monthly' ? grossSalary : grossSalary / 12
  const annualGross = monthlyGross * 12

  // Retirement deduction (limited to 27.5% of taxable income or R350 000 pa)
  const annualRetirement = retirementContribution * 12
  const retirementDeductionLimit = Math.min(annualGross * 0.275, 350000)
  const retirementDeduction = Math.min(annualRetirement, retirementDeductionLimit)

  const annualTaxableIncome = Math.max(0, annualGross - retirementDeduction)

  // Calculate tax from brackets
  let annualTax = 0
  let marginalRate = TAX_BRACKETS[0].rate
  for (const bracket of TAX_BRACKETS) {
    if (annualTaxableIncome > bracket.from) {
      marginalRate = bracket.rate
      const taxableInBracket = Math.min(annualTaxableIncome, bracket.to) - bracket.from
      annualTax = bracket.base + taxableInBracket * bracket.rate
    }
  }

  // Rebates
  let annualRebate = PRIMARY_REBATE
  if (age >= 65) annualRebate += SECONDARY_REBATE
  if (age >= 75) annualRebate += TERTIARY_REBATE

  // Medical aid tax credit
  const mainAndFirstDependent = Math.min(medicalAidMembers, 2) * MEDICAL_CREDIT_MAIN
  const additionalDependents = Math.max(0, medicalAidMembers - 2) * MEDICAL_CREDIT_ADDITIONAL
  const monthlyMedicalCredit = mainAndFirstDependent > 0
    ? MEDICAL_CREDIT_MAIN + Math.max(0, medicalAidMembers - 1) * (medicalAidMembers === 1 ? 0 : MEDICAL_CREDIT_ADDITIONAL)
    : 0

  // Simpler: 364 for first 2 members, 246 per additional
  const monthlyMedCredit =
    medicalAidMembers === 0 ? 0
    : medicalAidMembers === 1 ? 364
    : 728 + (medicalAidMembers - 2) * 246
  const annualMedicalCredit = monthlyMedCredit * 12

  const annualNetTax = Math.max(0, annualTax - annualRebate - annualMedicalCredit)
  const monthlyPaye = annualNetTax / 12

  // UIF: 1% employee contribution
  const uifBase = Math.min(monthlyGross, UIF_CAP)
  const monthlyUif = uifBase * 0.01

  const monthlyNetSalary = monthlyGross - monthlyPaye - monthlyUif

  const effectiveTaxRate = annualGross > 0 ? (annualNetTax / annualGross) * 100 : 0

  return {
    annualGross,
    annualTaxableIncome,
    annualTax,
    annualRebate,
    annualMedicalCredit,
    annualNetTax,
    monthlyGross,
    monthlyPaye,
    monthlyUif,
    monthlyNetSalary,
    effectiveTaxRate,
    marginalTaxRate: marginalRate * 100,
  }
}
