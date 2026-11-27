type DemoPayment = {
  reference: string
  receipt: string
  date: string
  service: string
  amount: number
  status: "Verified" | "Waived"
}

export const demoPetitionPayment: DemoPayment = {
  reference: "CCE-000128-2026",
  receipt: "DEMO-001",
  date: "2026-09-04",
  service: "Correction of Clerical or Typographical Error",
  amount: 1000,
  status: "Verified",
}

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
export const formatPaymentAmount = (amount: number) => currency.format(amount)
