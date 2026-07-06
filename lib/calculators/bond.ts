// Bond / Home Loan Calculator for South Africa

export interface BondInputs {
  purchasePrice: number
  deposit: number
  interestRate: number // annual %
  termYears: number
  includeBondCosts: boolean
}

export interface BondResults {
  loanAmount: number
  monthlyRepayment: number
  totalRepayment: number
  totalInterest: number
  bondRegistrationCost: number
  transferDuty: number
  initiationFee: number
  totalUpfrontCosts: number
  amortisation: AmortisationRow[]
}

export interface AmortisationRow {
  month: number
  year: number
  openingBalance: number
  principal: number
  interest: number
  closingBalance: number
}

// Transfer duty rates (2024/25 tax year, South Africa)
export function calculateTransferDuty(purchasePrice: number): number {
  if (purchasePrice <= 1100000) return 0
  if (purchasePrice <= 1512500) return (purchasePrice - 1100000) * 0.03
  if (purchasePrice <= 2117500) return 12375 + (purchasePrice - 1512500) * 0.06
  if (purchasePrice <= 2722500) return 48675 + (purchasePrice - 2117500) * 0.08
  if (purchasePrice <= 12100000) return 97475 + (purchasePrice - 2722500) * 0.11
  return 1128600 + (purchasePrice - 12100000) * 0.13
}

// Bond registration costs (approximate, based on tariff tables)
export function calculateBondRegistrationCost(loanAmount: number): number {
  // Deeds office + conveyancer fees (approximate sliding scale)
  if (loanAmount <= 100000) return 6400
  if (loanAmount <= 200000) return 7800
  if (loanAmount <= 300000) return 9200
  if (loanAmount <= 400000) return 10800
  if (loanAmount <= 500000) return 12200
  if (loanAmount <= 750000) return 15400
  if (loanAmount <= 1000000) return 19200
  if (loanAmount <= 1500000) return 24800
  if (loanAmount <= 2000000) return 30800
  return Math.round(30800 + (loanAmount - 2000000) * 0.012)
}

export function calculateBond(inputs: BondInputs): BondResults {
  const { purchasePrice, deposit, interestRate, termYears, includeBondCosts } = inputs
  const loanAmount = purchasePrice - deposit
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12

  // Monthly repayment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRepayment =
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)

  const totalRepayment = monthlyRepayment * numPayments
  const totalInterest = totalRepayment - loanAmount

  const transferDuty = includeBondCosts ? calculateTransferDuty(purchasePrice) : 0
  const bondRegistrationCost = includeBondCosts ? calculateBondRegistrationCost(loanAmount) : 0
  const initiationFee = includeBondCosts ? Math.min(6000, loanAmount * 0.01) + 1207.5 : 0 // VAT incl
  const totalUpfrontCosts = transferDuty + bondRegistrationCost + initiationFee

  // Amortisation schedule (yearly summary)
  const amortisation: AmortisationRow[] = []
  let balance = loanAmount
  let month = 0

  for (let year = 1; year <= termYears; year++) {
    const openingBalance = balance
    let yearlyPrincipal = 0
    let yearlyInterest = 0

    for (let m = 0; m < 12; m++) {
      month++
      if (month > numPayments) break
      const interestPmt = balance * monthlyRate
      const principalPmt = monthlyRepayment - interestPmt
      yearlyInterest += interestPmt
      yearlyPrincipal += principalPmt
      balance -= principalPmt
    }

    amortisation.push({
      month,
      year,
      openingBalance,
      principal: yearlyPrincipal,
      interest: yearlyInterest,
      closingBalance: Math.max(0, balance),
    })

    if (balance <= 0) break
  }

  return {
    loanAmount,
    monthlyRepayment,
    totalRepayment,
    totalInterest,
    bondRegistrationCost,
    transferDuty,
    initiationFee,
    totalUpfrontCosts,
    amortisation,
  }
}
