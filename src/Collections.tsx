import { useState } from "react"

import { demoPetitionPayment, formatPaymentAmount as currency } from "./demoPetitionPayment"

const entries = [
  demoPetitionPayment,
  { receipt: "DEMO-002", date: "2026-09-08", service: "Change of First Name", amount: 3000, status: "Verified" },
  { receipt: "DEMO-003", date: "2026-10-12", service: "Correction of Sex", amount: 3000, status: "Verified" },
  { receipt: "DEMO-004", date: "2026-10-15", service: "Correction of Clerical or Typographical Error", amount: 0, status: "Waived" },
]

const feeTypeColors = new Map([
  ["Correction of Clerical or Typographical Error", "#8f4938"],
  ["Change of First Name", "#62508a"],
  ["Correction of Sex", "#945c14"],
])
const monthColors = ["#23686a", "#3e6096"]
const monthName = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric", timeZone: "UTC" })
const monthNumbers = new Map(entries.map(({ date }) => [monthName.format(new Date(date)), Number(date.slice(5, 7)) - 1]))

function barGradient(color: string, direction: "to top" | "to right") {
  return `linear-gradient(${direction}, ${color}, color-mix(in srgb, ${color} 68%, white))`
}

function CollectionBreakdown({ title, totals, monthly = false }: { title: string; totals: Map<string, number>; monthly?: boolean }) {
  const maximum = Math.max(1, ...totals.values())
  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="civily-section-underline civily-section-underline-light font-bold text-primary-dark">{title}</h2>
      {totals.size === 0 ? (
        <p className="mt-3 text-sm text-muted">No verified payments match these filters.</p>
      ) : monthly ? (
        <div className="mt-4 overflow-x-auto">
          <ul className="flex min-w-full gap-3" style={{ width: `${totals.size * 7}rem` }}>
            {Array.from(totals, ([label, amount], index) => (
              <li key={label} className="flex min-w-0 flex-1 flex-col items-center text-center text-xs">
                <strong className="tabular-nums text-primary-dark">{currency(amount)}</strong>
                <div className="mt-1 flex h-28 w-full items-end justify-center border-b border-line" aria-hidden="true">
                  <div className="w-3/5 max-w-16 rounded-t-md" style={{ backgroundImage: barGradient(monthColors[(monthNumbers.get(label) ?? index) % monthColors.length], "to top"), height: `${amount / maximum * 100}%` }} />
                </div>
                <span className="mt-2 text-muted">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {Array.from(totals, ([label, amount]) => (
            <li key={label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{label}</span>
                <strong className="whitespace-nowrap tabular-nums">{currency(amount)}</strong>
              </div>
              <div aria-hidden="true" className="mt-1 h-2 overflow-hidden rounded-full bg-section">
                <div className="h-full rounded-full" style={{ backgroundImage: barGradient(feeTypeColors.get(label) ?? "#62508a", "to right"), width: `${(amount / maximum) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Collections() {
  const [service, setService] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const matching = entries.filter(entry =>
    (!service || entry.service === service) &&
    (!from || entry.date >= from) &&
    (!to || entry.date <= to),
  )
  const verified = matching.filter(entry => entry.status === "Verified")
  const waivedCount = matching.length - verified.length
  const total = verified.reduce((sum, entry) => sum + entry.amount, 0)
  const byMonth = new Map<string, number>()
  const byService = new Map<string, number>()
  for (const entry of verified) {
    const month = monthName.format(new Date(entry.date))
    byMonth.set(month, (byMonth.get(month) ?? 0) + entry.amount)
    byService.set(entry.service, (byService.get(entry.service) ?? 0) + entry.amount)
  }

  const exportCsv = () => {
    const rows = [
      ["Receipt reference", "Date", "Fee item", "Status", "Amount collected (PHP)"],
      ...matching.map(entry => [entry.receipt, entry.date, entry.service, entry.status, entry.amount.toFixed(2)]),
    ]
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "civily-demo-collections.csv"
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-primary-dark">Service Fee Collections</h1>
      <p className="mt-1 text-sm text-muted">Review sample collections by service and receipt date. All amounts and receipt references are for the demo.</p>
      <div className="mt-5 grid gap-4 rounded-xl border border-line bg-white p-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">Service
          <select className="rounded-lg border border-line p-2 text-sm" value={service} onChange={event => setService(event.target.value)}>
            <option value="">All services</option>
            {Array.from(new Set(entries.map(entry => entry.service)), name => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">From
          <input type="date" className="rounded-lg border border-line p-2 text-sm" value={from} onChange={event => setFrom(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-medium">To
          <input type="date" className="rounded-lg border border-line p-2 text-sm" value={to} onChange={event => setTo(event.target.value)} />
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4"><p className="text-sm text-muted">Total collected</p><p className="mt-1 text-2xl font-bold text-primary-dark">{currency(total)}</p></div>
        <div className="rounded-xl border border-line bg-white p-4"><p className="text-sm text-muted">Verified payments</p><p className="mt-1 text-2xl font-bold text-primary-dark">{verified.length}</p></div>
        <div className="rounded-xl border border-line bg-white p-4"><p className="text-sm text-muted">Fee waivers</p><p className="mt-1 text-2xl font-bold text-primary-dark">{waivedCount}</p></div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CollectionBreakdown title="Verified collections by month" totals={byMonth} monthly />
        <CollectionBreakdown title="Verified collections by fee type" totals={byService} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-primary-dark">Collection records</h2>
        <button type="button" onClick={exportCsv} disabled={!matching.length} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">Export filtered CSV</button>
      </div>
      <div className="mt-3 overflow-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-soft"><tr>{["Receipt reference", "Receipt date", "Service", "Status", "Amount collected"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {matching.map(entry => <tr key={entry.receipt}>
              <td className="p-3 font-medium">{entry.receipt}</td><td className="p-3 whitespace-nowrap">{entry.date}</td><td className="p-3">{entry.service}</td><td className="p-3">{entry.status}</td><td className="p-3">{entry.status === "Waived" ? "—" : currency(entry.amount)}</td>
            </tr>)}
            {!matching.length && <tr><td className="p-4 text-muted" colSpan={5}>No receipts match the selected filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
