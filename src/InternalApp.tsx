import Collections from "./Collections"
import daetSeal from "./assets/daet-seal.png"
import psaLogo from "./assets/psa-logo.png"
import maogmangDaet from "./assets/maogmang-daet.png"
import { createPortal } from "react-dom"
import { createContext, FormEvent, ReactNode, useContext, useEffect, useRef, useState } from "react"

type Role = "staff" | "admin"
const DemoStatusContext = createContext<(reference: string, stage: string) => boolean>(() => false)
const manilaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" })
const activityDate = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })
const demoStoreKey = "civily-staff-demo-v1"

type DemoWorkspace = {
  records: string[][]
  accounts: string[][]
  activity: string[][]
  nextNumber: number
}
export type View = "sms" | "collections" | "dashboard" | "records" | "monitoring" | "public" | "samples" | "account" | "record" | "users" | "roles" | "audit" | "settings" | "backup"
type IconName = "download" | "audit" | "backup" | "bell" | "check" | "chevron" | "clock" | "dashboard" | "document" | "filter" | "folder" | "info" | "logout" | "menu" | "pin" | "roles" | "samples" | "search" | "settings" | "shield" | "status" | "user" | "users" | "x"
type RecordFilterState = {
  query: string
  type: string
  stage: string
  psa: string
  outcome: string
  clientAction: string
  recordStatus: string
  lastUpdated: string
  archive: string
  updatedFrom: string
  updatedTo: string
  dateFrom: string
  dateTo: string
  sort: string
}

function Icon({
  name,
  className = "size-5",
}: {
  name: IconName
  className?: string
}) {
  const paths = {
    audit: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    download: <path d="M12 4v11m-4-4 4 4 4-4M5 15v4h14v-4" />,
    backup: (
      <>
        <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8" />
        <path d="M4 4v4h4M12 8v4l3 2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h4M9 13h6M9 17h4" />
      </>
    ),
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
    folder: <path d="M3 6h7l2 2h9v11H3z" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    roles: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M17 9l2 2 3-3" />
      </>
    ),
    samples: (
      <>
        <path d="M7 3h10v14H7z" />
        <path d="M4 7v14h10M10 7h4M10 11h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    status: (
      <>
        <circle cx="6" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="6" cy="19" r="2" />
        <path d="M8 5h10M8 12h10M8 19h10" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  className = "",
  type = "button",
  disabled = false,
  onClick,
  ariaLabel,
  expanded,
}: {
  children: ReactNode
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
  expanded?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={expanded}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

function Heading({
  level,
  children,
  className = "",
}: {
  level: 1 | 2 | 3
  children: ReactNode
  className?: string
}) {
  return (
    <div role="heading" aria-level={level} className={className}>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  )
}

const demoStaffPassword = "CIVILyst-demo"

function Login({ accounts, onSignIn }: { accounts: string[][]; onSignIn: (email: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const demoAccounts = accounts.filter(account => account[3] === "Active")

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = email.trim().toLowerCase()
    const account = demoAccounts.find(item => item[1].toLowerCase() === address)
    if (!account || password !== demoStaffPassword) {
      setError("The email or demo password is incorrect. Check your details and try again.")
      return
    }
    onSignIn(account[1])
  }

  return (
    <div className="civily-page civily-admin-background min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <header className="mx-auto mb-2 flex max-w-5xl justify-start">
        <a href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
          <Icon name="chevron" className="size-4 rotate-180" /> Back to public site
        </a>
      </header>
      <main className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-panel md:grid-cols-[0.85fr_1.15fr]">
        <section className="civily-hero relative isolate flex flex-col justify-center px-6 py-8 text-[#fff7ec] sm:px-10 md:py-12">
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <div className="flex shrink-0 items-center gap-1.5">
              {([[daetSeal, "Municipality of Daet"], [psaLogo, "Philippine Statistics Authority"], [maogmangDaet, "Maogmang Daet"]] as const).map(([src, label]) => (
                <img key={label} src={src} alt={label} width={40} height={40} className="size-9 rounded-full bg-white object-contain p-0.5 ring-1 ring-white/35 sm:size-10" />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">CIVILyst</p>
              <p className="mt-1 text-xs leading-snug text-[#f3ddc7]">Municipal Civil Registrar’s Office · Daet</p>
            </div>
          </div>
          <h1 className="civily-section-underline text-3xl font-bold tracking-tight sm:text-4xl">Staff Portal</h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#f3ddc7] sm:text-base">
            Access the MCR Daet workspace for petition encoding, status updates, and office administration.
          </p>
        </section>
        <section aria-labelledby="staff-sign-in-title" className="min-w-0 px-6 py-8 sm:px-10 md:py-12">
          <h2 id="staff-sign-in-title" className="text-2xl font-bold tracking-tight text-primary-dark">Sign in to CIVILyst</h2>
          <p className="mt-2 text-sm text-muted">Use your assigned staff account.</p>
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Staff email
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={event => { setEmail(event.target.value); setError("") }}
                className="h-12 w-full rounded-lg border border-line px-3.5 text-base font-normal focus:outline-2 focus:outline-primary"
              />
            </label>
            <div>
              <label htmlFor="staff-password" className="mb-2 block text-sm font-semibold text-ink">Password</label>
              <div className="flex min-h-12 items-center rounded-lg border border-line focus-within:outline-2 focus-within:outline-primary">
                <input
                  id="staff-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={event => { setPassword(event.target.value); setError("") }}
                  className="min-h-12 min-w-0 flex-1 rounded-l-lg px-3.5 text-base outline-none"
                />
                <button type="button" aria-controls="staff-password" onClick={() => setShowPassword(visible => !visible)} className="min-h-11 shrink-0 rounded-md px-3 text-sm font-semibold text-primary hover:bg-section focus-visible:outline-2 focus-visible:outline-primary">
                  {showPassword ? "Hide" : "Show"}<span className="sr-only"> password</span>
                </button>
              </div>
            </div>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
            <Button type="submit" className="min-h-12 w-full rounded-lg bg-primary px-4 text-sm text-white hover:bg-primary-dark">Sign in</Button>
          </form>

        </section>
      </main>
      <details className="mx-auto mt-3 max-w-5xl px-2 text-sm">
        <summary className="w-fit cursor-pointer rounded-sm py-2 font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary">Demo sign-in details</summary>
        <p className="mt-1 text-muted">Use sample credentials in this preview. All demo accounts use <code className="font-semibold text-primary-dark">{demoStaffPassword}</code>.</p>
        <ul className="mt-3 grid max-h-40 gap-2 overflow-y-auto">
          {demoAccounts.map(account => (
            <li key={account[1]}>
              <button type="button" onClick={() => { setEmail(account[1]); setPassword(""); setError("") }} className="w-full rounded-lg border border-line px-3 py-2 text-left hover:bg-section focus-visible:outline-2 focus-visible:outline-primary">
                <span className="block font-semibold text-primary-dark">{account[0]} · {account[2]}</span>
                <span className="block break-all text-xs text-muted">{account[1]}</span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

const petitions = [
  [
    "CCE-2026-0048",
    "CIV-2026-0048",
    "Maria S. Reyes",
    "Date of Birth",
    "Awaiting PSA Action",
    "Sep 27, 2026",
  ],
  [
    "CCE-2026-0042",
    "CIV-2026-0042",
    "Jose D. Cruz",
    "Clerical Error",
    "For Annotation",
    "Sep 26, 2026",
  ],
  [
    "CCE-2026-0039",
    "CIV-2026-0039",
    "Ana P. Santos",
    "Change of First Name",
    "MCR Evaluation",
    "Sep 24, 2026",
  ],
  [
    "CCE-2026-0036",
    "CIV-2026-0036",
    "Luis T. Ramos",
    "Correction of Sex",
    "Client Action Required",
    "Sep 23, 2026",
  ],
]

export function Dashboard({
  role,
  userName,
  openRecord,
  openAdvanced,
  onSearch,
  live,
}: {
  role: Role
  userName: string
  openRecord: (reference: string) => void
  openAdvanced: () => void
  onSearch: (query: string) => void
  live?: { records: string[][]; activities: string[][] }
}) {
  const [query, setQuery] = useState("")
  const [attentionFilter, setAttentionFilter] = useState("")
  const firstName = userName.split(/\s+/)[0]
  const greeting =
    new Date().getHours() < 12 ? "Good morning" : "Good afternoon"
  const date = new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date())
  const records = live?.records ?? petitions
  const count = (statuses: string[]) => String(records.filter(row => statuses.includes(row[4])).length)
  const summary: [string, string, IconName, string, string][] = [
    [live ? String(records.length) : "256", "Total petition records", "folder", "bg-[#f2e8dc] text-[#674730]", "border-[#b99879]"],
    [live ? count(["MCR Decision", "Posting Period"]) : "18", "Awaiting MCR action", "status", "bg-[#f4ebdf] text-[#704d31]", "border-[#c1a180]"],
    [live ? count(["Transmitted to PSA"]) : "31", "Transmitted to PSA", "status", "bg-[#ebf2ee] text-[#3e6552]", "border-[#8ba799]"],
    [live ? count(["Awaiting PSA Action", "Awaiting PSA Result"]) : "24", "Awaiting PSA result", "clock", "bg-[#efebe5] text-[#62564a]", "border-[#ac9c8b]"],
    [live ? count(["Action Required", "Client Action Required"]) : "12", "Requires attention", "bell", "bg-[#fbefd7] text-[#805018]", "border-[#c99c52]"],
  ]
  const attentionStatuses = Array.from(new Set(records.map(row => row[4])))
  const attentionRows = records
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !attentionFilter || row[4] === attentionFilter)
  const activity = live?.activities ?? [
    [
      "Status updated",
      "CCE-2026-0048 moved to Awaiting PSA Action",
      "10:42 AM",
      "status",
      "bg-civic-soft text-civic",
    ],
    [
      "Petition recorded",
      "CCE-2026-0051 was officially accepted",
      "9:18 AM",
      "document",
      "bg-soft text-primary",
    ],
    [
      "PSA result recorded",
      "PSA result added to CCE-2026-0042",
      "Yesterday",
      "check",
      "bg-sage-soft text-sage",
    ],
    [
      "Client action marked",
      "Additional clearance requested for CCE-2026-0036",
      "Yesterday",
      "bell",
      "bg-warning text-warning-text",
    ],
  ]
  return (
    <>
      <div className="civily-services-surface civily-admin-dashboard-banner flex flex-col justify-between gap-3 rounded-2xl sm:flex-row sm:items-start">
        <div>
          <p className="civily-admin-banner-copy text-xs font-semibold uppercase tracking-wide">
            {role === "admin" ? "Office Operations" : "My Workspace"}
          </p>
          <Heading
            level={1}
            className="civily-admin-banner-title mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {role === "admin" ? "Operations Dashboard" : "Personnel Dashboard"}
          </Heading>
          <p className="civily-admin-banner-copy mt-2 text-sm font-semibold">
            {greeting}, {firstName}
          </p>
          <p className="civily-admin-banner-copy mt-1 text-sm">
            Review petition activity and cases that need attention.
          </p>
        </div>
        <div className="flex w-fit shrink-0 items-center gap-2 self-end rounded-lg border border-[#efd4b2]/40 bg-[#f2e3d3] px-3 py-2 text-xs font-semibold text-primary-dark sm:self-start">
          <Icon name="clock" className="size-4 text-civic" />
          {date}
        </div>
      </div>

      <dl aria-label="Petition summary" className="mt-5 grid gap-3 sm:grid-cols-2 min-[1100px]:grid-cols-3 2xl:grid-cols-5">
        {summary.map(([value, label, icon, iconTone, accent]) => (
          <div key={label} className={`civily-admin-panel rounded-xl border border-line border-t-2 bg-[#fffcf8] p-3.5 ${accent}`}>
            <dt className="flex items-center gap-2.5 text-sm leading-snug font-medium text-ink">
              <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-lg ${iconTone}`}>
                <Icon name={icon} className="size-4" />
              </span>
              <span>{label}</span>
            </dt>
            <dd className="mt-2 pl-[2.625rem] text-2xl leading-none font-bold tracking-tight text-primary-dark tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="civily-admin-panel mt-5 rounded-xl border border-line bg-[#fffcf7] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
          <div>
            <Heading level={2} className="text-xl font-bold tracking-tight text-primary-dark">
              Find a Petition
            </Heading>
            <p className="mt-1 text-sm text-muted">
              Search by CCE number, transaction number, petitioner, or document owner.
            </p>
          </div>
          <Button onClick={openAdvanced} className="min-h-10 gap-1.5 px-2 text-sm text-primary hover:bg-section">
            Advanced Search &amp; Filters <Icon name="chevron" className="size-3.5" />
          </Button>
        </div>
        <form
          className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(query.trim())
          }}
        >
          <label className="civily-search-field flex-1">
            <Icon name="search" className="size-4 shrink-0" />
            <input
              aria-label="Search petition records"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter a name or reference number"
            />
          </label>
          <Button type="submit" className="h-11 shrink-0 bg-primary px-5 text-sm text-white hover:bg-primary-dark">
            Search Records
          </Button>
        </form>
      </section>

      <section className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="border-b border-line p-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <Heading level={2} className="font-bold text-primary-dark">
                {live ? "Recent Petition Records" : "Petitions Requiring Attention"}
              </Heading>
              <p className="mt-1 text-xs text-muted">
                {live ? "Review the latest cases or filter by stage." : "Operational records that may require review or follow-up."}
              </p>
            </div>
            <div className="w-full lg:w-52">
              <FilterSelect
                label="Filter by status"
                value={attentionFilter}
                onChange={setAttentionFilter}
                options={attentionStatuses}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-5xl text-left text-xs">
            <thead className="border-b border-line bg-cool text-muted">
              <tr>
                {[
                  "CCE No.",
                  "Transaction No.",
                  "Document Owner",
                  "Petition Type",
                  "Current Stage",
                  "Days in Stage / Last Update",
                  "Action",
                ].map((item) => (
                  <th
                    key={item}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attentionRows.map(({ row, index: rowIndex }) => {
                return (
                  <tr key={row[1]} className="hover:bg-cool/70">
                    {row.slice(0, 4).map((cell) => (
                      <td key={cell} className="px-3 py-3">
                        {cell}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <StatusBadge status={row[4]} />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">
                        {!live && ["4 days", "7 days", "2 days", "1 day"][rowIndex]}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted">{row[5]}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        onClick={() => openRecord(live ? row[1] : row[0])}
                        className="whitespace-nowrap text-primary hover:underline"
                      >
                        View record <Icon name="chevron" className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3 text-right">
          <Button
            onClick={openAdvanced}
            className="text-xs text-primary hover:underline"
          >
            Open Petition Records{" "}
            <Icon name="chevron" className="size-3.5" />
          </Button>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-line bg-white p-4 shadow-panel">
        <div className="flex items-center justify-between">
          <Heading level={2} className="font-bold text-primary-dark">
            Recent Activity
          </Heading>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Latest petition updates
          </span>
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {activity.map(([title, detail, time, icon, style], index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-line bg-cool/50 p-3"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg ${style}`}
              >
                <Icon name={icon as IconName} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">{title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{detail}</p>
              </div>
              <span className="shrink-0 text-[10px] text-muted">{time}</span>
            </div>
          ))}
        </div>
      </section>

      {role === "admin" && !live && (
        <section className="mt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Super Admin
            </p>
            <Heading
              level={2}
              className="mt-1 text-lg font-bold text-primary-dark"
            >
              System Administration
            </Heading>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              [
                "Service Fee Collections",
                "Review sample payments recorded from Treasury receipts",
                "document",
                "bg-civic-soft text-civic",
              ],
              [
                "Audit Activity",
                "Review read-only system activity",
                "audit",
                "bg-soft text-primary",
              ],
              [
                "Backup Status",
                "Review backup and recovery status",
                "backup",
                "bg-sage-soft text-sage",
              ],
            ].map(([title, detail, icon, style]) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-panel"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg ${style}`}
                >
                  <Icon name={icon as IconName} className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-primary-dark">{title}</p>
                  <p className="mt-1 text-xs text-muted">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function UpdateStatusPanel({ close, reference = "CCE-2026-0048" }: { close: () => void; reference?: string }) {
  const updateStatus = useContext(DemoStatusContext)
  const [saveError, setSaveError] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stage, setStage] = useState("PSA Action / Result")
  if (saved)
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-5">
        <div className="w-full max-w-md rounded border border-line bg-white p-6 shadow-lg">
          <span className="mb-4 grid size-10 place-items-center rounded-full bg-green-100 text-green-700">
            <Icon name="check" />
          </span>
          <Heading level={2} className="text-lg font-bold text-primary-dark">
            Status updated successfully
          </Heading>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The new milestone has been recorded in the petition activity
            history.
          </p>
          <Button
            onClick={close}
            className="mt-5 bg-primary px-5 py-2.5 text-sm text-white"
          >
            Return to record
          </Button>
        </div>
      </div>
    )
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-3 sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="update-petition-title" className="max-h-full min-h-0 w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-line bg-white shadow-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              {reference}
            </p>
            <h2 id="update-petition-title" className="text-lg font-bold text-primary-dark">
              Update Petition Status
            </h2>
          </div>
          <Button
            onClick={close}
            className="size-9 border border-line text-muted"
          >
            <Icon name="x" />
          </Button>
        </div>
        <div className="space-y-5 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">New Stage</span>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="h-11 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option>PSA Action / Result</option>
              <option>Endorsement for Annotation</option>
              <option>Annotation Processing</option>
              <option>Case Completion</option>
              <option>Requires Client Action</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Outcome, when applicable
            </span>
            <select className="h-11 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-primary">
              <option>Select outcome</option>
              <option>Granted</option>
              <option>Denied</option>
              <option>Affirmed</option>
              <option>Impugned</option>
              <option>Motion for Reconsideration</option>
              <option>Appeal</option>
            </select>
          </label>
          <Field
            label="Effective Date"
            type="date"
            value="2026-09-30"
            onChange={() => undefined}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Internal Note
            </span>
            <textarea
              rows={4}
              className="w-full rounded border border-line p-3 text-sm outline-none focus:border-primary"
              placeholder="Visible only to authorized personnel"
            />
            <span className="mt-1 block text-xs text-muted">
              This note will never appear on the public tracking portal.
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Client-Visible Instruction, when applicable
            </span>
            <textarea
              rows={3}
              className="w-full rounded border border-line p-3 text-sm outline-none focus:border-primary"
              placeholder="Use plain language and include only approved information"
            />
          </label>
          {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}
          {confirming && (
            <div className="rounded border border-warning-line bg-warning p-4 text-sm">
              <strong className="block text-warning-text">
                Confirm important status change
              </strong>
              <p className="mt-1 text-muted">
                This will add “{stage}” to the official case timeline. Verify
                the effective date and client-visible information before saving.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button
              onClick={close}
              className="border border-line px-4 py-2.5 text-sm text-muted"
            >
              Cancel
            </Button>
            {confirming ? (
              <Button
                onClick={() => {
                  if (updateStatus(reference, stage)) setSaved(true)
                  else setSaveError("Select a different stage for an available petition record.")
                }}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Confirm and Save
              </Button>
            ) : (
              <Button
                onClick={() => setConfirming(true)}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Review Update
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PetitionRecord({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState("Overview")
  const [updating, setUpdating] = useState(false)
  const tabs = [
    "Overview",
    "Petitioner",
    "Document Owner",
    "Progress",
    "Physical Record",
    "Activity History",
  ]
  const milestones = [
    [
      "Official Acceptance and Intake Recording",
      "September 4, 2026",
      "Granted",
    ],
    ["Notice Posting", "September 14, 2026", "Completed"],
    ["MCR Evaluation and Decision", "September 19, 2026", "Granted"],
    ["Transmittal to PSA", "September 23, 2026", "Completed"],
    ["Awaiting PSA Processing", "Current stage", "In Progress"],
    ["PSA Action / Result", "Pending", ""],
    ["Endorsement for Annotation", "Pending", ""],
    ["Annotation Processing and Case Completion", "Pending", ""],
  ]
  return (
    <div>
      {updating && <UpdateStatusPanel close={() => setUpdating(false)} />}
      <Button
        onClick={onBack}
        className="mb-4 text-sm text-primary hover:underline"
      >
        <span className="rotate-180">
          <Icon name="chevron" className="size-4" />
        </span>
        Back to dashboard
      </Button>
      <div className="rounded border border-line bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-line bg-section p-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Petition Record
            </p>
            <Heading
              level={1}
              className="mt-1 text-xl font-bold text-primary-dark"
            >
              CCE-2026-0048
            </Heading>
            <p className="mt-1 text-sm text-muted">
              Transaction No. CIV-2026-0048 · Correction of Date of Birth
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs text-muted">Current Status</p>
              <p className="font-bold text-primary">Awaiting PSA Action</p>
            </div>
            <Button
              onClick={() => setUpdating(true)}
              className="bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary-dark"
            >
              Update Status
            </Button>
          </div>
        </div>
        <div className="flex overflow-x-auto border-b border-line">
          {tabs.map((item) => (
            <Button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-none border-r border-line px-4 py-3 text-xs ${
                tab === item
                  ? "border-b-2 border-b-primary bg-white text-primary"
                  : "text-muted hover:bg-section"
              }`}
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="p-5">
          {tab === "Overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <RecordSection
                title="Case Information"
                items={[
                  ["Filing Date", "September 4, 2026"],
                  ["Petition Type", "Correction of Date of Birth"],
                  ["Legal Basis", "RA 10172"],
                ]}
              />
              <RecordSection
                title="Petitioner"
                items={[
                  ["Name", "Elena M. Reyes"],
                  ["Relationship", "Mother"],
                  ["Contact", "09•• ••• ••24"],
                ]}
              />
              <RecordSection
                title="Document Owner"
                items={[
                  ["Name", "Maria S. Reyes"],
                  ["Document", "Certificate of Live Birth"],
                  ["Registry No.", "2002-1847"],
                ]}
              />
            </div>
          )}
          {tab === "Petitioner" && (
            <RecordSection
              title="Petitioner Information"
              items={[
                ["Full Name", "Elena M. Reyes"],
                ["Relationship to Document Owner", "Mother"],
                ["Address", "Daet, Camarines Norte"],
                ["Contact Number", "09•• ••• ••24"],
                ["Email", "e••••@example.com"],
              ]}
            />
          )}
          {tab === "Document Owner" && (
            <RecordSection
              title="Document Owner Information"
              items={[
                ["Full Name", "Maria S. Reyes"],
                ["Date of Birth", "January ••, 2002"],
                ["Document Type", "Certificate of Live Birth"],
                ["Registry Number", "2002-1847"],
                ["Petition Type", "Correction of Date of Birth"],
              ]}
            />
          )}
          {tab === "Progress" && (
            <div className="max-w-3xl">
              <Heading
                level={2}
                className="mb-5 border-b-2 border-primary pb-2 text-sm font-bold uppercase text-primary-dark"
              >
                Internal Petition Timeline
              </Heading>
              {milestones.map(([title, date, outcome], index) => (
                <div key={title} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < milestones.length - 1 && (
                    <span
                      className={`absolute left-3 top-6 h-full w-px ${
                        index < 4 ? "bg-primary" : "bg-line"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border ${
                      index < 4
                        ? "border-primary bg-primary text-white"
                        : index === 4
                          ? "border-primary bg-white text-primary"
                          : "border-line bg-white text-muted"
                    }`}
                  >
                    {index < 4 ? (
                      <Icon name="check" className="size-3.5" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        index === 4 ? "text-primary" : ""
                      }`}
                    >
                      {title}
                    </p>
                    <p className="mt-1 text-xs text-muted">{date}</p>
                    {outcome && (
                      <span className="mt-2 inline-block rounded border border-line bg-section px-2 py-1 text-[10px] font-bold uppercase text-muted">
                        {outcome}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "Physical Record" && (
            <div className="max-w-3xl">
              <Heading
                level={2}
                className="border-b-2 border-primary pb-2 text-sm font-bold uppercase text-primary-dark"
              >
                Physical Archive Location
              </Heading>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  ["Storage Box / Archive", "BOX-04"],
                  ["Folder Identifier", "FOLDER-2026-048"],
                  ["CCE Number", "CCE-2026-0048"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-2 border-primary bg-soft p-4"
                  >
                    <p className="text-xs font-semibold text-muted">{label}</p>
                    <p className="mt-2 text-lg font-bold text-primary-dark">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Activity History" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-2xl text-left text-xs">
                <thead className="bg-section text-muted">
                  <tr>
                    {["Date / Time", "User", "Action", "Details"].map(
                      (item) => (
                        <th key={item} className="px-3 py-3">
                          {item}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="px-3 py-3">Sep 23, 2026 · 10:42 AM</td>
                    <td className="px-3 py-3">J. Dela Cruz</td>
                    <td className="px-3 py-3 font-semibold">Status Updated</td>
                    <td className="px-3 py-3">Transmitted to PSA</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3">Sep 19, 2026 · 2:18 PM</td>
                    <td className="px-3 py-3">M. Santos</td>
                    <td className="px-3 py-3 font-semibold">
                      Decision Recorded
                    </td>
                    <td className="px-3 py-3">Granted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FullPetitionRecord({
  onBack,
  role,
}: {
  onBack: () => void
  role: Role
}) {
  const [tab, setTab] = useState("Overview")
  const [updating, setUpdating] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const tabs = [
    "Overview",
    "Parties",
    "Progress",
    "Physical Record",
    "Activity History",
  ]
  const milestones = [
    [
      "Official Acceptance and Intake Recording",
      "September 4, 2026",
      "Accepted",
      "Maria Santos",
      "Petition accepted and recorded",
      "complete",
    ],
    [
      "Notice Posting",
      "September 14, 2026",
      "Completed",
      "Maria Santos",
      "Notice posting completed",
      "complete",
    ],
    [
      "MCR Evaluation and Decision",
      "September 19, 2026",
      "Granted",
      "Roberto Cruz",
      "Decision granted",
      "complete",
    ],
    [
      "Transmittal to PSA",
      "September 23, 2026",
      "Transmitted",
      "Maria Santos",
      "Transmitted to PSA",
      "psa",
    ],
    [
      "Awaiting PSA Processing",
      "September 23, 2026",
      "In Progress",
      "System",
      "Awaiting PSA Action",
      "current",
    ],
    ["PSA Action / Result", "Pending", "", "", "", "pending"],
    ["Endorsement for Annotation", "Pending", "", "", "", "pending"],
    ["Annotation Processing and Completion", "Pending", "", "", "", "pending"],
  ]
  return (
    <div>
      {updating && <UpdateStatusPanel close={() => setUpdating(false)} />}
      {editingLocation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary-dark/50 px-5">
          <div className="w-full max-w-lg rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Heading
                level={2}
                className="text-lg font-bold text-primary-dark"
              >
                Edit Physical Location
              </Heading>
              <Button
                onClick={() => setEditingLocation(false)}
                className="size-9 border border-line text-muted"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field
                label="Storage Location"
                value="MCR Records Room"
                onChange={() => undefined}
              />
              <Field
                label="Box Number"
                value="BOX-04"
                onChange={() => undefined}
              />
              <Field
                label="Folder Identifier"
                value="FOLDER-2026-048"
                onChange={() => undefined}
              />
              <Field
                label="CCE Number"
                value="CCE-2026-0048"
                onChange={() => undefined}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button
                onClick={() => setEditingLocation(false)}
                className="border border-line px-4 py-2.5 text-sm text-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setEditingLocation(false)}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Save Location
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 text-xs text-muted">
        <Button
          onClick={onBack}
          className="rounded-none text-xs text-primary hover:underline"
        >
          Petition Records
        </Button>
        <Icon name="chevron" className="size-3" />
        <span>CCE-2026-0048</span>
      </div>

      <section className="overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="border-b border-line bg-gradient-to-r from-soft/70 via-white to-civic-soft/40 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Petition Record
              </p>
              <Heading
                level={1}
                className="mt-1 text-2xl font-bold text-primary-dark sm:text-3xl"
              >
                CCE-2026-0048
              </Heading>
              <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">Transaction</p>
                  <p className="mt-1 font-semibold">CIV-2026-0048</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Petition Type</p>
                  <p className="mt-1 font-semibold">
                    Correction of Date of Birth
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Current Stage</p>
                  <div className="mt-1">
                    <StatusBadge status="Awaiting PSA Action" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.print()}
                className="border border-line bg-white px-4 py-2.5 text-sm text-muted hover:bg-page"
              >
                <Icon name="document" className="size-4" />
                Print Record Summary
              </Button>
              <div className="relative">
                <Button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="border border-line bg-white px-4 py-2.5 text-sm text-muted hover:bg-page"
                >
                  More Actions <Icon name="chevron" className="size-3.5" />
                </Button>
                {moreOpen && (
                  <div className="absolute right-0 top-12 z-20 w-52 rounded-lg border border-line bg-white p-2 shadow-lg">
                    <Button className="w-full justify-start px-3 py-2 text-xs text-muted hover:bg-cool">
                      Export Activity History
                    </Button>
                    <Button className="w-full justify-start px-3 py-2 text-xs text-muted hover:bg-cool">
                      Copy Transaction Number
                    </Button>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setUpdating(true)}
                className="bg-gradient-to-r from-primary to-primary-medium px-5 py-2.5 text-sm text-white shadow-sm"
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
        <nav
          className="flex overflow-x-auto border-b border-line bg-white"
          aria-label="Petition record sections"
        >
          {tabs.map((item) => (
            <Button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-none border-b-2 px-5 py-3.5 text-xs ${
                tab === item
                  ? "border-primary bg-soft/40 text-primary"
                  : "border-transparent text-muted hover:bg-cool"
              }`}
            >
              {item}
            </Button>
          ))}
        </nav>

        <div className="p-5 sm:p-6">
          {tab === "Overview" && (
            <div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["CCE Number", "CCE-2026-0048"],
                  ["Transaction Reference", "CIV-2026-0048"],
                  ["Petition Type", "Correction of Date of Birth"],
                  ["Legal Basis", "Republic Act No. 10172"],
                  ["Filing Date", "September 4, 2026"],
                  ["Current Stage", "Awaiting PSA Action"],
                  ["Last Updated", "September 23, 2026 · 10:42 AM"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-line bg-cool/55 p-4"
                  >
                    <p className="text-xs font-semibold text-muted">{label}</p>
                    <p className="mt-1.5 text-sm font-bold text-primary-dark">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {role === "admin" && (
                <div className="mt-6 rounded-lg border border-civic/20 bg-civic-soft p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-civic">
                    Administrative Metadata
                  </p>
                  <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                    <p>
                      <span className="text-muted">Record Created By:</span>
                      <br />
                      <strong>Maria Santos</strong>
                    </p>
                    <p>
                      <span className="text-muted">Record Created:</span>
                      <br />
                      <strong>September 4, 2026 · 9:14 AM</strong>
                    </p>
                    <p>
                      <span className="text-muted">Access Classification:</span>
                      <br />
                      <strong>Authorized MCR Personnel</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "Parties" && (
            <div>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wide text-civic">
                  Case Parties
                </p>
                <Heading
                  level={2}
                  className="mt-1 text-xl font-bold text-primary-dark"
                >
                  Petitioner and Document Owner
                </Heading>
                <p className="mt-1 text-sm text-muted">
                  These individuals may be different people and are recorded
                  separately.
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-primary/20 bg-white">
                  <div className="flex items-center gap-3 bg-soft/70 px-5 py-4">
                    <span className="grid size-9 place-items-center rounded-lg bg-white text-primary shadow-sm">
                      <Icon name="user" className="size-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Petitioner
                      </p>
                      <p className="text-sm font-bold text-primary-dark">
                        Elena M. Reyes
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <RecordSection
                      title="Petitioner Information"
                      items={[
                        ["Full Name", "Elena M. Reyes"],
                        ["Relationship to Document Owner", "Mother"],
                        ["Address", "Daet, Camarines Norte"],
                        ["Contact Number", "09•• ••• ••24"],
                        ["Email", "e••••@example.com"],
                      ]}
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-civic/20 bg-white">
                  <div className="flex items-center gap-3 bg-civic-soft px-5 py-4">
                    <span className="grid size-9 place-items-center rounded-lg bg-white text-civic shadow-sm">
                      <Icon name="document" className="size-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-civic">
                        Document Owner
                      </p>
                      <p className="text-sm font-bold text-primary-dark">
                        Maria S. Reyes
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <RecordSection
                      title="Document Owner Information"
                      items={[
                        ["Full Name", "Maria S. Reyes"],
                        ["Date of Birth", "January ••, 2002"],
                        ["Document Type", "Certificate of Live Birth"],
                        ["Registry Number", "2002-1847"],
                        ["Petition Type", "Correction of Date of Birth"],
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "Progress" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-civic">
                  Case Workflow
                </p>
                <Heading
                  level={2}
                  className="mt-1 text-xl font-bold text-primary-dark"
                >
                  Detailed Petition Timeline
                </Heading>
              </div>
              {milestones.map(
                (
                  [stage, date, outcome, recordedBy, clientStatus, status],
                  index,
                ) => {
                  const completed = status === "complete"
                  const psa = status === "psa"
                  const current = status === "current"
                  return (
                    <div
                      key={stage}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {index < milestones.length - 1 && (
                        <span
                          className={`absolute left-4 top-8 h-full w-0.5 ${
                            completed ? "bg-sage" : psa ? "bg-civic" : "bg-line"
                          }`}
                        />
                      )}
                      <span
                        className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 ${
                          completed
                            ? "border-sage bg-sage text-white"
                            : psa
                              ? "border-civic bg-civic text-white"
                              : current
                                ? "border-primary bg-white text-primary ring-4 ring-soft"
                                : "border-line bg-white text-muted"
                        }`}
                      >
                        {completed || psa ? (
                          <Icon name="check" className="size-4" />
                        ) : (
                          <span className="size-2 rounded-full bg-current" />
                        )}
                      </span>
                      <div
                        className={`w-full ${
                          current
                            ? "rounded-lg border border-primary/20 bg-soft/50 p-4 -mt-1"
                            : "pt-1"
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                current ? "text-primary" : "text-ink"
                              }`}
                            >
                              {stage}
                            </p>
                            <p className="mt-1 text-xs text-muted">{date}</p>
                          </div>
                          {outcome && <StatusBadge status={outcome} />}
                        </div>
                        {recordedBy && (
                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                            <p>
                              <span className="text-muted">Recorded by:</span>{" "}
                              <strong>{recordedBy}</strong>
                            </p>
                            {clientStatus && (
                              <p>
                                <span className="text-muted">
                                  Client-visible:
                                </span>{" "}
                                <strong>{clientStatus}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                },
              )}
              <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-sage" />
                  Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-primary" />
                  Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-civic" />
                  PSA Information
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-gold" />
                  Client Action Required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-line" />
                  Upcoming
                </span>
              </div>
            </div>
          )}

          {tab === "Physical Record" && (
            <div>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-civic">
                    Archive Retrieval
                  </p>
                  <Heading
                    level={2}
                    className="mt-1 text-xl font-bold text-primary-dark"
                  >
                    Physical Record Location
                  </Heading>
                  <p className="mt-1 text-sm text-muted">
                    Use these identifiers to locate the physical petition
                    folder.
                  </p>
                </div>
                <Button
                  onClick={() => setEditingLocation(true)}
                  className="w-fit border border-primary px-4 py-2.5 text-sm text-primary hover:bg-soft"
                >
                  Edit Physical Location
                </Button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Storage Location", "MCR Records Room", "pin"],
                  ["Box Number", "BOX-04", "folder"],
                  ["Folder Identifier", "FOLDER-2026-048", "document"],
                  ["CCE Number", "CCE-2026-0048", "status"],
                ].map(([label, value, icon]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-primary/20 bg-soft/55 p-5"
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-white text-primary shadow-sm">
                      <Icon name={icon as IconName} className="size-5" />
                    </span>
                    <p className="mt-4 text-xs font-semibold text-muted">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary-dark">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Activity History" && (
            <div>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wide text-civic">
                  Internal History
                </p>
                <Heading
                  level={2}
                  className="mt-1 text-xl font-bold text-primary-dark"
                >
                  Activity History
                </Heading>
                <p className="mt-1 text-sm text-muted">
                  Chronological record of authorized changes to this petition.
                </p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-4xl text-left text-xs">
                  <thead className="bg-cool text-muted">
                    <tr>
                      {[
                        "Date / Time",
                        "Personnel",
                        "Action",
                        "Previous Value",
                        "New Value / Details",
                      ].map((item) => (
                        <th key={item} className="px-4 py-3 font-semibold">
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    <tr>
                      <td className="whitespace-nowrap px-4 py-3">
                        Sep 23, 2026 · 10:42 AM
                      </td>
                      <td className="px-4 py-3">Maria Santos</td>
                      <td className="px-4 py-3 font-semibold">
                        Status Updated
                      </td>
                      <td className="px-4 py-3 text-muted">
                        MCR Decision — Granted
                      </td>
                      <td className="px-4 py-3">Transmitted to PSA</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-3">
                        Sep 19, 2026 · 2:18 PM
                      </td>
                      <td className="px-4 py-3">Roberto Cruz</td>
                      <td className="px-4 py-3 font-semibold">
                        Decision Recorded
                      </td>
                      <td className="px-4 py-3 text-muted">Under Evaluation</td>
                      <td className="px-4 py-3">Granted</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-3">
                        Sep 4, 2026 · 9:14 AM
                      </td>
                      <td className="px-4 py-3">Maria Santos</td>
                      <td className="px-4 py-3 font-semibold">
                        Petition Recorded
                      </td>
                      <td className="px-4 py-3 text-muted">—</td>
                      <td className="px-4 py-3">
                        Officially accepted and assigned CCE-2026-0048
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function RecordSection({ title, items }: { title: string; items: string[][] }) {
  return (
    <section>
      <Heading
        level={2}
        className="border-b-2 border-primary pb-2 text-sm font-bold uppercase text-primary-dark"
      >
        {title}
      </Heading>
      <dl className="mt-2 divide-y divide-line">
        {items.map(([label, value]) => (
          <div key={label} className="py-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const initialDemoAccounts = [
    [
      "Maria Santos",
      "msantos@mcr.gov.ph",
      "Personnel",
      "Active",
      "Today · 8:04 AM",
      "Jan 12, 2026",
    ],
    [
      "Roberto Cruz",
      "rcruz@mcr.gov.ph",
      "MCR Supervisor",
      "Active",
      "Yesterday · 4:52 PM",
      "Jan 12, 2026",
    ],
    [
      "Ana Villanueva",
      "avillanueva@mcr.gov.ph",
      "Personnel",
      "Inactive",
      "Aug 29, 2026",
      "Mar 4, 2026",
    ],
    [
      "Juan Dela Cruz",
      "jdelacruz@mcr.gov.ph",
      "Super Admin",
      "Active",
      "Today · 7:48 AM",
      "Dec 18, 2025",
    ],
  ]

function UserAccounts({ accounts, onCreate }: { accounts: string[][]; onCreate: (name: string, email: string) => string }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [createError, setCreateError] = useState("")
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [lastLoginFilter, setLastLoginFilter] = useState("")
  const [menuOpen, setMenuOpen] = useState("")
  const [modal, setModal] = useState<{ type: string; name: string; email: string } | null>(null)
  const visibleAccounts = accounts.filter((account) => {
    const textMatch =
      !query ||
      `${account[0]} ${account[1]} ${account[2]}`
        .toLowerCase()
        .includes(query.toLowerCase())
    const loginMatch =
      !lastLoginFilter ||
      (lastLoginFilter === "Today" && account[4].startsWith("Today")) ||
      (lastLoginFilter === "Last 7 Days" &&
        (account[4].startsWith("Today") ||
          account[4].startsWith("Yesterday"))) ||
      (lastLoginFilter === "More than 30 Days" &&
        !account[4].startsWith("Today") &&
        !account[4].startsWith("Yesterday")) ||
      lastLoginFilter === "Last 30 Days"
    return (
      textMatch &&
      (!roleFilter || account[2] === roleFilter) &&
      (!statusFilter || account[3] === statusFilter) &&
      loginMatch
    )
  })
  const sensitive =
    modal && ["role", "deactivate", "reset"].includes(modal.type)
  return (
    <div>
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary-dark/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-civic">
                  {modal.type === "add"
                    ? "Personnel Account"
                    : "Account Administration"}
                </p>
                <Heading
                  level={2}
                  className="text-lg font-bold text-primary-dark"
                >
                  {modal.type === "add"
                    ? "Add Personnel Account"
                    : modal.type === "view"
                      ? modal.name
                      : modal.type === "role"
                        ? "Edit Role / Permissions"
                        : modal.type === "deactivate"
                          ? "Confirm Account Deactivation"
                          : "Credential Reset Workflow"}
                </Heading>
              </div>
              <Button
                onClick={() => setModal(null)}
                className="size-9 border border-line text-muted"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="p-5">
              {modal.type === "add" && (
                <div className="space-y-4">
                  <Field
                    label="Personnel Name"
                    value={name}
                    onChange={setName}
                    placeholder="Enter full name"
                  />
                  <Field
                    label="Username / Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Personnel email address"
                  />
                  <p className="text-sm font-medium">Account role: Personnel</p>
                  {createError && <p role="alert" className="text-sm text-red-700">{createError}</p>}
                  <div className="rounded-lg border border-civic/20 bg-civic-soft p-3 text-xs leading-relaxed text-civic">
                    This creates a browser-local demo account. Use sample names and email addresses.
                  </div>
                </div>
              )}
              {modal.type === "view" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Personnel Name", modal.name],
                    [
                      "Username / Email",
                      accounts.find(
                        (account) => account[1] === modal.email,
                      )?.[1] ?? "",
                    ],
                    [
                      "Role",
                      accounts.find(
                        (account) => account[1] === modal.email,
                      )?.[2] ?? "",
                    ],
                    [
                      "Account Status",
                      accounts.find(
                        (account) => account[1] === modal.email,
                      )?.[3] ?? "",
                    ],
                    [
                      "Last Login",
                      accounts.find(
                        (account) => account[1] === modal.email,
                      )?.[4] ?? "",
                    ],
                    [
                      "Date Created",
                      accounts.find(
                        (account) => account[1] === modal.email,
                      )?.[5] ?? "",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-line bg-cool p-3"
                    >
                      <p className="text-xs text-muted">{label}</p>
                      <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {modal.type === "role" && (
                <div>
                  <p className="text-sm leading-relaxed text-muted">
                    Change the permitted role for{" "}
                    <strong className="text-ink">{modal.name}</strong>. Updated
                    permissions will apply to the user’s next authorized
                    session.
                  </p>
                  <div className="mt-4">
                    <FilterSelect
                      label="Assigned Role"
                      value={
                        accounts.find(
                          (account) => account[1] === modal.email,
                        )?.[2] ?? "Personnel"
                      }
                      onChange={() => undefined}
                      options={["Personnel", "MCR Supervisor", "Super Admin"]}
                    />
                  </div>
                </div>
              )}
              {modal.type === "deactivate" && (
                <div className="rounded-lg border border-gold/40 bg-warning p-4">
                  <p className="text-sm font-semibold text-warning-text">
                    Deactivate access for {modal.name}?
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    The account will no longer be able to sign in. Existing
                    petition and audit history will be retained.
                  </p>
                </div>
              )}
              {modal.type === "reset" && (
                <div>
                  <div className="rounded-lg border border-civic/20 bg-civic-soft p-4">
                    <p className="text-sm font-semibold text-civic">
                      Start secure credential reset?
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      CIVILyst will invalidate the current credential and begin
                      an authorized reset workflow for {modal.name}. Existing
                      passwords cannot be viewed or retrieved.
                    </p>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-error">
                    No password will be displayed to the administrator.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button
                onClick={() => setModal(null)}
                className="border border-line px-4 py-2.5 text-sm text-muted"
              >
                Cancel
              </Button>
              {modal.type !== "view" && (
                <Button
                  onClick={() => {
                    if (modal.type === "add") {
                      const error = onCreate(name, email)
                      setCreateError(error)
                      if (error) return
                    }
                    setModal(null)
                  }}
                  className={`px-4 py-2.5 text-sm text-white ${
                    sensitive
                      ? "bg-primary"
                      : "bg-gradient-to-r from-primary to-primary-medium"
                  }`}
                >
                  {modal.type === "add"
                    ? "Create Account"
                    : modal.type === "role"
                      ? "Confirm Role Change"
                      : modal.type === "deactivate"
                        ? "Confirm Deactivation"
                        : "Start Credential Reset"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-civic">
            Administration
          </p>
          <Heading level={1} className="text-2xl font-bold text-primary-dark">
            Personnel Accounts
          </Heading>
          <p className="mt-1 text-sm text-muted">
            Manage authorized CIVILyst personnel accounts and account access.
          </p>
        </div>
        <Button
          onClick={() => {
            setName("")
            setEmail("")
            setCreateError("")
            setModal({ type: "add", name: "", email: "" })
          }}
          className="bg-gradient-to-r from-primary to-primary-medium px-4 py-2.5 text-sm text-white shadow-sm"
        >
          <Icon name="users" className="size-4" />
          Add Personnel Account
        </Button>
      </div>
      <section className="mt-5 civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="p-4">
          <label className="civily-search-field">
            <Icon name="search" className="size-4 shrink-0" />
            <input
              aria-label="Search personnel accounts"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, username / email, or account role…"
            />
          </label>
        </div>
        <div className="grid gap-3 border-t border-line bg-cool/60 p-4 sm:grid-cols-3">
          <FilterSelect
            label="Role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={["Personnel", "MCR Supervisor", "Super Admin"]}
          />
          <FilterSelect
            label="Account Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["Active", "Inactive"]}
          />
          <FilterSelect
            label="Last Login"
            value={lastLoginFilter}
            onChange={setLastLoginFilter}
            options={[
              "Today",
              "Last 7 Days",
              "Last 30 Days",
              "More than 30 Days",
            ]}
          />
        </div>
      </section>
      <div className="mt-5 overflow-x-auto civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-bold text-primary-dark">
            {visibleAccounts.length} personnel accounts
          </p>
          <p className="text-xs text-muted">
            Passwords are never displayed or retrievable.
          </p>
        </div>
        <table className="w-full min-w-5xl text-left text-sm">
          <thead className="border-b border-line bg-cool">
            <tr>
              {[
                "Personnel Name",
                "Username / Email",
                "Role",
                "Account Status",
                "Last Login",
                "Date Created",
                "Action",
              ].map((item) => (
                <th
                  key={item}
                  className="px-4 py-3 text-xs font-semibold text-muted"
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleAccounts.map((account) => (
              <tr key={account[1]} className="hover:bg-cool/60">
                <td className="px-4 py-3 font-semibold text-primary-dark">
                  {account[0]}
                </td>
                <td className="px-4 py-3 text-muted">{account[1]}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-civic/20 bg-civic-soft px-2.5 py-1 text-[10px] font-bold text-civic">
                    {account[2]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                      account[3] === "Active"
                        ? "border-sage/25 bg-sage-soft text-sage"
                        : "border-line bg-cool text-muted"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {account[3]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{account[4]}</td>
                <td className="whitespace-nowrap px-4 py-3">{account[5]}</td>
                <td className="relative px-4 py-3">
                  <Button
                    onClick={() =>
                      setMenuOpen(menuOpen === account[1] ? "" : account[1])
                    }
                    className="border border-line px-3 py-1.5 text-xs text-primary hover:bg-soft"
                  >
                    Manage <Icon name="chevron" className="size-3" />
                  </Button>
                  {menuOpen === account[1] && (
                    <div className="absolute right-4 top-12 z-20 w-56 rounded-lg border border-line bg-white p-2 shadow-xl">
                      <Button
                        onClick={() => {
                          setModal({ type: "view", name: account[0], email: account[1] })
                          setMenuOpen("")
                        }}
                        className="w-full justify-start px-3 py-2 text-xs text-ink hover:bg-cool"
                      >
                        <Icon name="user" className="size-4 text-civic" />
                        View Account
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between border-t border-line px-4 py-3 text-xs text-muted">
          <span>
            Showing 1–{visibleAccounts.length} of {visibleAccounts.length}{" "}
            accounts
          </span>
          <div className="flex gap-1">
            <Button className="border border-line px-3 py-1.5">Previous</Button>
            <Button className="bg-primary px-3 py-1.5 text-white">1</Button>
            <Button className="border border-line px-3 py-1.5">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RolesPermissions() {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState<Record<string, boolean>>({
    "Physical Record Location": true,
    "Public Service Information": true,
    "Document Samples": true,
  })
  const permissions = [
    [
      "Petition Records",
      "View and manage accepted petition records.",
      "required",
      "inherited",
    ],
    [
      "Record Search",
      "Search authorized petition and party information.",
      "required",
      "inherited",
    ],
    [
      "Status Updates",
      "Record milestones, outcomes, and approved client instructions.",
      "required",
      "inherited",
    ],
    [
      "Physical Record Location",
      "View and update archive box and folder identifiers.",
      "configurable",
      "inherited",
    ],
    [
      "Public Service Information",
      "Maintain public requirements and service guidance.",
      "configurable",
      "inherited",
    ],
    [
      "Document Samples",
      "Maintain fictional public document examples.",
      "configurable",
      "inherited",
    ],
    [
      "Personnel Accounts",
      "Create, activate, and manage authorized accounts.",
      "none",
      "admin",
    ],
    [
      "Audit Logs",
      "Review read-only security and record activity.",
      "none",
      "admin",
    ],
    [
      "System Settings",
      "Manage protected CIVILyst system configuration.",
      "none",
      "admin",
    ],
    [
      "Backup & Recovery",
      "Review and operate protected recovery controls.",
      "none",
      "admin",
    ],
  ]
  const save = () => {
    if (Object.values(config).some(Boolean)) setConfirming(true)
    else setEditing(false)
  }
  return (
    <div>
      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary-dark/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warning-text">
                  Administrative Confirmation
                </p>
                <Heading
                  level={2}
                  className="text-lg font-bold text-primary-dark"
                >
                  Confirm Permission Changes
                </Heading>
              </div>
              <Button
                onClick={() => setConfirming(false)}
                className="size-9 border border-line text-muted"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="p-5">
              <div className="rounded-lg border border-gold/40 bg-warning p-4">
                <p className="text-sm font-bold text-warning-text">
                  Review before granting expanded access
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Permission changes may allow Personnel accounts to modify
                  public information or physical archive locations.
                  Administrative functions remain restricted to Super Admin.
                </p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                System-required and inherited permissions cannot be removed from
                this page.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button
                onClick={() => setConfirming(false)}
                className="border border-line px-4 py-2.5 text-sm text-muted"
              >
                Review Again
              </Button>
              <Button
                onClick={() => {
                  setConfirming(false)
                  setEditing(false)
                  setSaved(true)
                }}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Confirm Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-civic">
            Administration
          </p>
          <Heading
            level={1}
            className="mt-1 text-2xl font-bold text-primary-dark"
          >
            Roles & Permissions
          </Heading>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
            Review what Personnel and Super Admin accounts can access.
            System-required permissions are applied automatically and cannot be
            removed.
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setEditing(false)}
              className="border border-line bg-white px-4 py-2.5 text-sm text-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              className="bg-gradient-to-r from-primary to-primary-medium px-4 py-2.5 text-sm text-white"
            >
              Review Changes
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              setEditing(true)
              setSaved(false)
            }}
            className="border border-primary bg-white px-4 py-2.5 text-sm text-primary hover:bg-soft"
          >
            <Icon name="roles" className="size-4" />
            Edit Configurable Permissions
          </Button>
        )}
      </div>
      {saved && (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-sage/25 bg-sage-soft p-4 text-sm text-sage">
          <span className="grid size-7 place-items-center rounded-full bg-white">
            <Icon name="check" className="size-4" />
          </span>
          <strong>Permission settings were updated successfully.</strong>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-civic-soft text-civic">
              <Icon name="user" className="size-5" />
            </span>
            <div>
              <Heading level={2} className="font-bold text-primary-dark">
                Personnel
              </Heading>
              <p className="text-xs text-muted">
                Daily petition operations and permitted public-information tasks
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/20 bg-soft/50 p-4 shadow-panel">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-white text-primary shadow-sm">
              <Icon name="shield" className="size-5" />
            </span>
            <div>
              <Heading level={2} className="font-bold text-primary-dark">
                Super Admin
              </Heading>
              <p className="text-xs text-muted">
                All Personnel permissions plus protected administration
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="border-b border-line bg-cool px-4 py-3">
          <Heading level={2} className="font-bold text-primary-dark">
            Permission Matrix
          </Heading>
          <p className="mt-1 text-xs text-muted">
            Only permissions marked configurable can be changed for the
            Personnel role.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="border-b border-line bg-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-muted">
                  Permission Group
                </th>
                <th className="w-44 px-4 py-3 text-center text-xs font-semibold text-muted">
                  Personnel
                </th>
                <th className="w-44 px-4 py-3 text-center text-xs font-semibold text-muted">
                  Super Admin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {permissions.map(([name, description, personnel, admin]) => (
                <tr key={name} className="hover:bg-cool/50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-primary-dark">{name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {description}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {personnel === "required" ? (
                      <PermissionState
                        label="System Required"
                        tone="required"
                      />
                    ) : personnel === "configurable" ? (
                      <PermissionToggle
                        label={name}
                        enabled={config[name]}
                        editable={editing}
                        onChange={() =>
                          setConfig({ ...config, [name]: !config[name] })
                        }
                      />
                    ) : (
                      <PermissionState label="Not Permitted" tone="none" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {admin === "inherited" ? (
                      <PermissionState label="Inherited" tone="inherited" />
                    ) : (
                      <PermissionState label="Admin Required" tone="admin" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-civic/20 bg-civic-soft p-4">
          <p className="text-xs font-bold text-civic">System Required</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Core access needed for the role to perform its intended operational
            function.
          </p>
        </div>
        <div className="rounded-lg border border-sage/20 bg-sage-soft p-4">
          <p className="text-xs font-bold text-sage">Inherited</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Super Admin automatically receives the corresponding Personnel
            permission.
          </p>
        </div>
        <div className="rounded-lg border border-gold/35 bg-warning p-4">
          <p className="text-xs font-bold text-warning-text">
            Administrative Access
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Protected functions are always restricted to authorized Super Admin
            accounts.
          </p>
        </div>
      </div>
    </div>
  )
}

function PermissionState({
  label,
  tone,
}: {
  label: string
  tone: "required" | "inherited" | "admin" | "none"
}) {
  const style =
    tone === "required"
      ? "bg-civic-soft text-civic"
      : tone === "inherited"
        ? "bg-sage-soft text-sage"
        : tone === "admin"
          ? "bg-soft text-primary"
          : "bg-cool text-muted"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${style}`}
    >
      {tone !== "none" ? (
        <Icon name="check" className="size-3.5" />
      ) : (
        <Icon name="x" className="size-3.5" />
      )}
      {label}
    </span>
  )
}

function PermissionToggle({
  label,
  enabled,
  editable,
  onChange,
}: {
  label: string
  enabled: boolean
  editable: boolean
  onChange: () => void
}) {
  return (
    <Button
      onClick={() => editable && onChange()}
      className={`mx-auto gap-2 px-2 py-1 text-[10px] ${
        editable ? "cursor-pointer" : "cursor-default"
      } ${enabled ? "text-sage" : "text-muted"}`}
    >
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          enabled ? "bg-sage" : "bg-line"
        } ${editable ? "ring-2 ring-offset-2 ring-civic/15" : ""}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-[1.125rem]" : "left-0.5"
          }`}
        />
      </span>
      <span className="sr-only">{label}</span>
      {enabled ? "Allowed" : "Not Allowed"}
    </Button>
  )
}

function SystemSettings() {
  const [dialog, setDialog] = useState<string | null>(null)
  const [saved, setSaved] = useState("")
  const confirm = () => {
    setSaved(dialog ?? "")
    setDialog(null)
  }
  return (
    <div>
      {dialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary-dark/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warning-text">
                  Confirm Settings Change
                </p>
                <Heading
                  level={2}
                  className="text-lg font-bold text-primary-dark"
                >
                  Save {dialog}
                </Heading>
              </div>
              <Button
                onClick={() => setDialog(null)}
                className="size-9 border border-line text-muted"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="p-5">
              <div className="rounded-lg border border-gold/40 bg-warning p-4">
                <p className="text-sm font-bold text-warning-text">
                  Review this change before continuing
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Changes to {dialog.toLowerCase()} may affect public
                  information, personnel workflows, or how status information
                  appears to clients.
                </p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Sensitive credentials and secret configuration values are stored
                securely and will not be displayed.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button
                onClick={() => setDialog(null)}
                className="border border-line px-4 py-2.5 text-sm text-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={confirm}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Confirm and Save
              </Button>
            </div>
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-civic">
          Administration
        </p>
        <Heading
          level={1}
          className="mt-1 text-2xl font-bold text-primary-dark"
        >
          System Settings
        </Heading>
        <p className="mt-1 text-sm text-muted">
          Manage CIVILyst identity, public information, status display,
          messaging, and security configuration.
        </p>
      </div>
      {saved && (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-sage/25 bg-sage-soft p-4 text-sm text-sage">
          <span className="grid size-7 place-items-center rounded-full bg-white">
            <Icon name="check" className="size-4" />
          </span>
          <strong>{saved} saved successfully.</strong>
        </div>
      )}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <SettingsCard
          icon="settings"
          title="System Identity"
          description="Names used within the protected personnel application."
          onSave={() => setDialog("System Identity")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="System Name"
              value="CIVILyst"
              onChange={() => undefined}
            />
            <Field
              label="Office Short Name"
              value="MCR Daet"
              onChange={() => undefined}
            />
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              System Description
            </span>
            <textarea
              rows={3}
              defaultValue="Petition Tracking & Transaction Monitoring System"
              className="w-full rounded border border-line bg-white p-3 text-sm outline-none focus:border-civic"
            />
          </label>
        </SettingsCard>
        <SettingsCard
          icon="document"
          title="Public Portal Information"
          description="Official contact and service information displayed to citizens."
          onSave={() => setDialog("Public Portal Information")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Office Name"
              value="Municipal Civil Registrar's Office"
              onChange={() => undefined}
            />
            <Field
              label="Office Hours"
              value="Monday–Friday, 8:00 AM–5:00 PM"
              onChange={() => undefined}
            />
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Public Service Advisory
            </span>
            <textarea
              rows={3}
              defaultValue="Confirm documentary requirements and applicable fees with MCR Daet before filing."
              className="w-full rounded border border-line bg-white p-3 text-sm outline-none focus:border-civic"
            />
          </label>
        </SettingsCard>
        <SettingsCard
          icon="status"
          title="Status Display Configuration"
          description="Control approved petition information shown on the public tracking result."
          onSave={() => setDialog("Status Display Configuration")}
        >
          <div className="space-y-3">
            {[
              ["Show service type", true],
              ["Show last recorded update", true],
              ["Show approved client instructions", true],
              ["Show responsible personnel name", false],
            ].map(([label, enabled]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-lg border border-line bg-cool p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{String(label)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {enabled
                      ? "Enabled for approved public display"
                      : "Hidden from the public portal"}
                  </p>
                </div>
                <span
                  className={`relative h-5 w-9 rounded-full ${
                    enabled ? "bg-sage" : "bg-line"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm ${
                      enabled ? "left-[1.125rem]" : "left-0.5"
                    }`}
                  />
                </span>
              </div>
            ))}
          </div>
        </SettingsCard>
        <SettingsCard
          icon="bell"
          title="SMS Configuration"
          description="Review messaging availability without exposing provider credentials."
          onSave={() => setDialog("SMS Configuration")}
        >
          <div className="flex items-center justify-between rounded-lg border border-civic/20 bg-civic-soft p-4">
            <div>
              <p className="text-sm font-bold text-civic">
                Provider Connection
              </p>
              <p className="mt-1 text-xs text-muted">
                Configuration values are stored securely and masked.
              </p>
            </div>
            <span className="rounded-full border border-gold/40 bg-warning px-2.5 py-1 text-[10px] font-bold text-warning-text">
              NOT CONFIGURED
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line p-3">
              <p className="text-xs text-muted">Sender Name</p>
              <p className="mt-1 text-sm font-semibold">Not configured</p>
            </div>
            <div className="rounded-lg border border-line p-3">
              <p className="text-xs text-muted">API Credential</p>
              <p className="mt-1 text-sm font-semibold">••••••••••••</p>
            </div>
          </div>
        </SettingsCard>
        <section className="overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel xl:col-span-2">
          <div className="flex items-start gap-3 border-b border-line bg-cool px-5 py-4">
            <span className="grid size-10 place-items-center rounded-lg bg-sage-soft text-sage">
              <Icon name="shield" className="size-5" />
            </span>
            <div>
              <Heading level={2} className="font-bold text-primary-dark">
                Security-Related Configuration Status
              </Heading>
              <p className="mt-1 text-xs text-muted">
                Protected status indicators only. Secret values are never
                displayed.
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["HTTPS", "Enabled", "sage"],
              ["Rate Limiting", "Enabled", "sage"],
              ["Session Timeout", "30 minutes", "civic"],
              ["Credential Storage", "Securely hashed", "sage"],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="rounded-lg border border-line bg-cool/60 p-4"
              >
                <p className="text-xs text-muted">{label}</p>
                <p
                  className={`mt-2 flex items-center gap-2 text-sm font-bold ${
                    tone === "sage" ? "text-sage" : "text-civic"
                  }`}
                >
                  <span className="size-2 rounded-full bg-current" />
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-line px-5 py-4">
            <Button
              onClick={() => setDialog("Security Configuration")}
              className="border border-primary px-4 py-2.5 text-sm text-primary hover:bg-soft"
            >
              Review Security Settings
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

function SettingsCard({
  icon,
  title,
  description,
  children,
  onSave,
}: {
  icon: IconName
  title: string
  description: string
  children: ReactNode
  onSave: () => void
}) {
  return (
    <section className="overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
      <div className="flex items-start gap-3 border-b border-line bg-cool px-5 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-civic-soft text-civic">
          <Icon name={icon} className="size-5" />
        </span>
        <div>
          <Heading level={2} className="font-bold text-primary-dark">
            {title}
          </Heading>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
      <div className="flex justify-end border-t border-line px-5 py-4">
        <Button
          onClick={onSave}
          className="bg-primary px-4 py-2.5 text-sm text-white"
        >
          Save Changes
        </Button>
      </div>
    </section>
  )
}

function BackupRecovery() {
  const [action, setAction] = useState<string | null>(null)
  const [completed, setCompleted] = useState("")
  const sensitive =
    action === "Restore from Backup" || action === "Start Restore Test"
  return (
    <div>
      {action && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary-dark/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    sensitive ? "text-warning-text" : "text-civic"
                  }`}
                >
                  {sensitive
                    ? "Sensitive Recovery Operation"
                    : "Administrative Confirmation"}
                </p>
                <Heading
                  level={2}
                  className="text-lg font-bold text-primary-dark"
                >
                  {action}
                </Heading>
              </div>
              <Button
                onClick={() => setAction(null)}
                className="size-9 border border-line text-muted"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="p-5">
              <div
                className={`rounded-lg border p-4 ${
                  sensitive
                    ? "border-gold/40 bg-warning"
                    : "border-civic/20 bg-civic-soft"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    sensitive ? "text-warning-text" : "text-civic"
                  }`}
                >
                  {sensitive
                    ? "Confirm this recovery action"
                    : "Confirm administrative action"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {action === "Restore from Backup"
                    ? "Restoring data may replace current system information. Verify the selected backup and ensure office operations are coordinated before continuing."
                    : action === "Start Restore Test"
                      ? "A controlled restore test verifies recoverability without replacing the active production records."
                      : "A new protected system backup will be requested. Existing retained backups will not be modified."}
                </p>
              </div>
              {sensitive && (
                <label className="mt-4 flex items-start gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                  />
                  I understand this is a protected recovery operation.
                </label>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button
                onClick={() => setAction(null)}
                className="border border-line px-4 py-2.5 text-sm text-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setCompleted(action)
                  setAction(null)
                }}
                className={`border px-4 py-2.5 text-sm ${
                  sensitive
                    ? "border-gold bg-warning text-warning-text"
                    : "border-primary bg-primary text-white"
                }`}
              >
                Confirm {action}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-civic">
          Administration
        </p>
        <Heading
          level={1}
          className="mt-1 text-2xl font-bold text-primary-dark"
        >
          Backup & Recovery
        </Heading>
        <p className="mt-1 text-sm text-muted">
          Monitor protected backups and initiate controlled recovery operations.
        </p>
      </div>
      {completed && (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-sage/25 bg-sage-soft p-4 text-sm text-sage">
          <span className="grid size-7 place-items-center rounded-full bg-white">
            <Icon name="check" className="size-4" />
          </span>
          <strong>{completed} request was recorded successfully.</strong>
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "Latest Backup",
            "Sep 30, 2026 · 2:00 AM",
            "backup",
            "bg-civic-soft text-civic",
          ],
          ["Backup Status", "Successful", "check", "bg-sage-soft text-sage"],
          [
            "Backup Schedule",
            "Daily · 2:00 AM",
            "clock",
            "bg-soft text-primary",
          ],
          [
            "Retention Information",
            "30 daily backup sets",
            "folder",
            "bg-civic-soft text-civic",
          ],
          [
            "Last Restore Test",
            "Sep 1, 2026 · Successful",
            "shield",
            "bg-sage-soft text-sage",
          ],
        ].map(([label, value, icon, style]) => (
          <div
            key={label}
            className="rounded-xl border border-line bg-white p-4 shadow-panel"
          >
            <span
              className={`grid size-10 place-items-center rounded-lg ${style}`}
            >
              <Icon name={icon as IconName} className="size-5" />
            </span>
            <p className="mt-4 text-xs font-semibold text-muted">{label}</p>
            <p className="mt-1 text-sm font-bold text-primary-dark">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="border-b border-line bg-cool px-5 py-4">
          <Heading level={2} className="font-bold text-primary-dark">
            Backup Administration
          </Heading>
          <p className="mt-1 text-xs text-muted">
            Backup data and credentials remain protected. Only status and
            approved operational details are shown.
          </p>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          <div className="rounded-xl border border-civic/20 bg-civic-soft p-5">
            <span className="grid size-10 place-items-center rounded-lg bg-white text-civic shadow-sm">
              <Icon name="backup" className="size-5" />
            </span>
            <Heading level={3} className="mt-4 font-bold text-primary-dark">
              Create Protected Backup
            </Heading>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Request a new backup without changing retained recovery sets.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => setAction("Run Manual Backup")}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Run Manual Backup
              </Button>
              <Button className="border border-civic px-4 py-2.5 text-sm text-civic">
                Configure Schedule
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-gold/40 bg-warning/60 p-5">
            <span className="grid size-10 place-items-center rounded-lg bg-white text-warning-text shadow-sm">
              <Icon name="shield" className="size-5" />
            </span>
            <Heading level={3} className="mt-4 font-bold text-primary-dark">
              Recovery Operations
            </Heading>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Recovery actions require explicit confirmation and should be
              coordinated before use.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => setAction("Start Restore Test")}
                className="border border-gold bg-white px-4 py-2.5 text-sm text-warning-text"
              >
                Start Restore Test
              </Button>
              <Button
                onClick={() => setAction("Restore from Backup")}
                className="border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700"
              >
                Restore from Backup
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-5 flex gap-3 rounded-lg border border-gold/35 bg-warning p-4">
        <Icon name="info" className="size-5 shrink-0 text-warning-text" />
        <div>
          <p className="text-sm font-bold text-warning-text">
            Recovery operations are sensitive
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Do not begin a restore while personnel are actively updating
            records. Confirm the backup selection and coordinate the operation
            with authorized system support.
          </p>
        </div>
      </div>
    </div>
  )
}

export function AuditLog({ activity }: { activity: string[][] }) {
  const [query, setQuery] = useState("")
  const [userFilter, setUserFilter] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [recordFilter, setRecordFilter] = useState("")
  const [resultFilter, setResultFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sort, setSort] = useState("Newest First")
  const [detail, setDetail] = useState<string[] | null>(null)
  const logs = [...activity]
  if (sort === "Oldest First") logs.reverse()
  if (sort === "User A–Z") logs.sort((a, b) => a[1].localeCompare(b[1]))
  if (sort === "Action Type") logs.sort((a, b) => a[4].localeCompare(b[4]))
  const active = [
    ["user", userFilter, setUserFilter],
    ["module", moduleFilter, setModuleFilter],
    ["action", actionFilter, setActionFilter],
    ["record", recordFilter, setRecordFilter],
    ["result", resultFilter, setResultFilter],
    ["from", dateFrom, setDateFrom],
    ["to", dateTo, setDateTo],
  ].filter(([, value]) => value) as [string, string, (value: string) => void][]
  const visibleLogs = logs.filter((log) => {
    const keyword =
      !query ||
      `${log[1]} ${log[4]} ${log[5]} ${log[10]}`
        .toLowerCase()
        .includes(query.toLowerCase())
    return (
      keyword &&
      (!userFilter || log[1] === userFilter) &&
      (!moduleFilter || log[3] === moduleFilter) &&
      (!actionFilter || log[4] === actionFilter) &&
      (!recordFilter ||
        log[5].toLowerCase().includes(recordFilter.toLowerCase())) &&
      (!resultFilter || log[7] === resultFilter) &&
      (!dateFrom || log[8] >= dateFrom) &&
      (!dateTo || log[8] <= dateTo)
    )
  })
  const clear = () => {
    setQuery("")
    setUserFilter("")
    setModuleFilter("")
    setActionFilter("")
    setRecordFilter("")
    setResultFilter("")
    setDateFrom("")
    setDateTo("")
  }
  return (
    <div>
      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary-dark/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-civic">
                  Read-Only Audit Entry
                </p>
                <Heading
                  level={2}
                  className="text-lg font-bold text-primary-dark"
                >
                  Audit Details
                </Heading>
              </div>
              <Button
                onClick={() => setDetail(null)}
                className="size-9 border border-line text-muted"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Timestamp", detail[0]],
                  ["User", `${detail[1]} · ${detail[2]}`],
                  ["Account email", detail[10]],
                  ["Action", detail[4]],
                  ["Affected Record", detail[5]],
                  ["Module", detail[3]],
                  ["Result", detail[7]],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-line bg-cool p-3"
                  >
                    <p className="text-xs text-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-primary-dark">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-civic/20 bg-civic-soft p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-civic">
                  Relevant Change Summary
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {detail[6]}
                </p>
              </div>
              <div className="mt-4 flex gap-2 text-xs text-muted">
                <Icon name="shield" className="size-4 shrink-0 text-civic" />
                This audit entry is permanent and read-only. It cannot be
                edited, deleted, or modified.
              </div>
            </div>
            <div className="flex justify-end border-t border-line px-5 py-4">
              <Button
                onClick={() => setDetail(null)}
                className="bg-primary px-4 py-2.5 text-sm text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-civic">
          Administration
        </p>
        <Heading
          level={1}
          className="mt-1 text-2xl font-bold text-primary-dark"
        >
          Audit Logs
        </Heading>
        <p className="mt-1 text-sm text-muted">
          Review recorded system and personnel activity.
        </p>
      </div>
      <div className="mt-5 flex gap-3 rounded-lg border border-civic/20 bg-civic-soft p-4 text-sm text-civic">
        <Icon name="shield" className="size-5 shrink-0" />
        <div>
          <strong>Read-only system history</strong>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Demo entries are stored in this browser and can be reviewed here.
          </p>
        </div>
      </div>
      <section className="mt-5 civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="p-4">
          <label className="civily-search-field">
            <Icon name="search" className="size-4 shrink-0" />
            <input
              aria-label="Search audit logs"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search user, CCE number, transaction number, or action…"
            />
          </label>
        </div>
        <div className="grid gap-3 border-t border-line bg-cool/60 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <FilterSelect
            label="User"
            value={userFilter}
            onChange={setUserFilter}
            options={Array.from(new Set(activity.map(log => log[1]))).sort()}
          />
          <FilterSelect
            label="Module"
            value={moduleFilter}
            onChange={setModuleFilter}
            options={Array.from(new Set(activity.map(log => log[3]))).sort()}
          />
          <FilterSelect
            label="Action Type"
            value={actionFilter}
            onChange={setActionFilter}
            options={Array.from(new Set(activity.map(log => log[4]))).sort()}
          />
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Record
            </span>
            <input
              value={recordFilter}
              onChange={(event) => setRecordFilter(event.target.value)}
              placeholder="CCE or transaction number"
              className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
            />
          </label>
          <FilterSelect
            label="Result / Status"
            value={resultFilter}
            onChange={setResultFilter}
            options={["Successful", "Failed"]}
          />
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Date Range
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                aria-label="Date from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="h-10 rounded border border-line bg-white px-2 text-xs outline-none focus:border-civic"
              />
              <input
                aria-label="Date to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-10 rounded border border-line bg-white px-2 text-xs outline-none focus:border-civic"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
          <Button
            onClick={clear}
            className="border border-line px-4 py-2 text-xs text-muted"
          >
            Clear All
          </Button>
          <Button className="bg-primary px-4 py-2 text-xs text-white">
            Apply Filters
          </Button>
        </div>
      </section>
      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">
            Active filters:
          </span>
          {active.map(([key, value, setter]) => (
            <Button
              key={key}
              onClick={() => setter("")}
              className="border border-civic/20 bg-civic-soft px-2.5 py-1.5 text-xs text-civic"
            >
              {value}
              <Icon name="x" className="size-3" />
            </Button>
          ))}
        </div>
      )}
      <div className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="flex flex-col justify-between gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-sm font-bold text-primary-dark">
            {visibleLogs.length} audit entries
          </p>
          <label className="flex items-center gap-2 text-xs text-muted">
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded border border-line bg-white px-2 py-1.5"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>User A–Z</option>
              <option>Action Type</option>
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-6xl text-left text-xs">
            <thead className="sticky top-0 bg-cool">
              <tr>
                {[
                  "Date & Time",
                  "User",
                  "Role",
                  "Module",
                  "Action",
                  "Record",
                  "Details",
                  "Result",
                  "",
                ].map((item, index) => (
                  <th
                    key={`${item}-${index}`}
                    className="whitespace-nowrap px-3 py-3 font-semibold text-muted"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleLogs.map((log) => (
                <tr key={log[9]} className="hover:bg-cool/60">
                  <td className="whitespace-nowrap px-3 py-3">{log[0]}</td>
                  <td className="px-3 py-3 font-semibold text-primary-dark">
                    {log[1]}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full border border-line bg-cool px-2 py-1 text-[10px] font-semibold text-muted">
                      {log[2]}
                    </span>
                  </td>
                  <td className="px-3 py-3">{log[3]}</td>
                  <td className="px-3 py-3 font-semibold">{log[4]}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log[5]}</td>
                  <td className="max-w-xs truncate px-3 py-3 text-muted">
                    {log[6]}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold ${
                        log[7] === "Successful"
                          ? "border-sage/25 bg-sage-soft text-sage"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {log[7]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Button
                      onClick={() => setDetail(log)}
                      className="whitespace-nowrap text-primary hover:underline"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted sm:flex-row">
          <span>Showing 1–{visibleLogs.length} of 248 audit entries</span>
          <div className="flex items-center gap-1">
            <Button className="border border-line px-3 py-1.5">Previous</Button>
            <Button className="bg-primary px-3 py-1.5 text-white">1</Button>
            <Button className="border border-line px-3 py-1.5">2</Button>
            <Button className="border border-line px-3 py-1.5">3</Button>
            <Button className="border border-line px-3 py-1.5">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase()
  const style =
    lower.includes("client") || lower.includes("attention")
      ? "border-gold/50 bg-warning text-warning-text"
      : lower.includes("psa")
        ? "border-civic/25 bg-civic-soft text-civic"
        : lower.includes("annotation") || lower.includes("completed")
          ? "border-sage/25 bg-sage-soft text-sage"
          : lower.includes("denied") || lower.includes("impugned")
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-primary/20 bg-soft text-primary"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-warning px-0.5 text-ink">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  )
}

function AdvancedRecordSearch({
  filters,
  setFilters,
  openRecord,
}: {
  filters: RecordFilterState
  setFilters: (filters: RecordFilterState) => void
  openRecord: () => void
}) {
  type SearchState = "initial" | "loading" | "results" | "empty" | "invalid" | "broad"
  const hasCriteria = Object.entries(filters).some(
    ([key, value]) => key !== "sort" && Boolean(value),
  )
  const [state, setState] = useState<SearchState>(
    hasCriteria ? "results" : "initial",
  )
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const update = (key: keyof RecordFilterState, value: string) =>
    setFilters({ ...filters, [key]: value })
  const active = [
    ["type", filters.type],
    ["dateFrom", filters.dateFrom],
    ["dateTo", filters.dateTo],
    ["recordStatus", filters.recordStatus],
    ["stage", filters.stage],
    ["psa", filters.psa],
    ["outcome", filters.outcome],
    ["clientAction", filters.clientAction],
    ["archive", filters.archive],
    ["updatedFrom", filters.updatedFrom],
    ["updatedTo", filters.updatedTo],
  ].filter(([, value]) => value)
  const reset = () => {
    setFilters({
      query: "",
      type: "",
      stage: "",
      psa: "",
      outcome: "",
      clientAction: "",
      recordStatus: "",
      lastUpdated: "",
      archive: "",
      updatedFrom: "",
      updatedTo: "",
      dateFrom: "",
      dateTo: "",
      sort: "Recently Updated",
    })
    setState("initial")
  }
  const search = () => {
    const criteriaCount = active.length
    if (!filters.query.trim() && criteriaCount === 0) {
      setState("broad")
      return
    }
    if (filters.query.trim().length === 1 && criteriaCount === 0) {
      setState("invalid")
      return
    }
    setState("loading")
    window.setTimeout(() => {
      const matches = petitions.some((record) =>
        record.join(" ").toLowerCase().includes(filters.query.toLowerCase()),
      )
      setState(
        filters.query.trim() && !matches && criteriaCount === 0
          ? "empty"
          : "results",
      )
    }, 500)
  }
  const searchRows = [
    [...petitions[0], "Elena M. Reyes", "Sep 4, 2026", "BOX-04 / F-048"],
    [...petitions[1], "Jose R. Cruz", "Sep 8, 2026", "BOX-04 / F-042"],
    [...petitions[2], "Roberto P. Santos", "Sep 11, 2026", "BOX-03 / F-039"],
  ]
  return (
    <div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-civic">
          Advanced Retrieval
        </p>
        <Heading
          level={1}
          className="mt-1 text-2xl font-bold text-primary-dark"
        >
          Record Search
        </Heading>
        <p className="mt-1 text-sm text-muted">
          Search across accepted petitions using one or more known details.
        </p>
      </div>
      <section className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="bg-gradient-to-r from-civic-soft to-white p-5">
          <label className="text-sm font-bold text-primary-dark">
            Search accepted petition records
          </label>
          <p className="mt-1 text-xs text-muted">
            CCE Number · Transaction Reference · Petitioner Name · Document
            Owner Name
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="civily-search-field flex-1">
              <Icon name="search" className="size-4 shrink-0" />
              <input
                aria-label="Search petition records"
                type="search"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && search()}
                placeholder="Enter a CCE number, transaction number, or name…"
              />
            </label>
            <Button
              onClick={search}
              className="h-12 bg-gradient-to-r from-primary to-primary-medium px-6 text-sm text-white shadow-sm"
            >
              Search Records
            </Button>
          </div>
        </div>
        <div className="border-t border-line">
          <Button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full justify-between rounded-none px-5 py-3 text-sm text-primary-dark hover:bg-cool"
          >
            <span className="flex items-center gap-2">
              <Icon name="filter" className="size-4 text-civic" />
              Advanced Filters
            </span>
            <span className={advancedOpen ? "rotate-90" : ""}>
              <Icon name="chevron" className="size-4" />
            </span>
          </Button>
          {advancedOpen && (
            <div className="border-t border-line bg-cool/65 p-5">
              <FilterGroup title="Petition">
                <FilterSelect
                  label="Petition Type"
                  value={filters.type}
                  onChange={(value) => update("type", value)}
                  options={[
                    "Date of Birth",
                    "Clerical Error",
                    "Change of First Name",
                    "Correction of Sex",
                  ]}
                />
                <DateFilter
                  label="Filing Date From"
                  value={filters.dateFrom}
                  onChange={(value) => update("dateFrom", value)}
                />
                <DateFilter
                  label="Filing Date To"
                  value={filters.dateTo}
                  onChange={(value) => update("dateTo", value)}
                />
                <FilterSelect
                  label="Record Status"
                  value={filters.recordStatus}
                  onChange={(value) => update("recordStatus", value)}
                  options={["Active", "Completed", "Archived"]}
                />
              </FilterGroup>
              <FilterGroup title="Process">
                <FilterSelect
                  label="Current Stage"
                  value={filters.stage}
                  onChange={(value) => update("stage", value)}
                  options={[
                    "MCR Evaluation",
                    "Awaiting PSA Result",
                    "For Annotation",
                    "Case Completion",
                  ]}
                />
                <FilterSelect
                  label="PSA Status"
                  value={filters.psa}
                  onChange={(value) => update("psa", value)}
                  options={[
                    "Not Transmitted",
                    "Transmitted to PSA",
                    "Awaiting PSA Result",
                    "PSA Result Received",
                  ]}
                />
                <FilterSelect
                  label="Outcome"
                  value={filters.outcome}
                  onChange={(value) => update("outcome", value)}
                  options={["Granted", "Denied", "Affirmed", "Impugned"]}
                />
                <FilterSelect
                  label="Client Action Required"
                  value={filters.clientAction}
                  onChange={(value) => update("clientAction", value)}
                  options={["Yes", "No"]}
                />
              </FilterGroup>
              <FilterGroup title="Record">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-muted">
                    Physical Archive Location / Storage Box
                  </span>
                  <input
                    value={filters.archive}
                    onChange={(event) => update("archive", event.target.value)}
                    placeholder="e.g. BOX-04"
                    className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
                  />
                </label>
                <DateFilter
                  label="Last Updated From"
                  value={filters.updatedFrom}
                  onChange={(value) => update("updatedFrom", value)}
                />
                <DateFilter
                  label="Last Updated To"
                  value={filters.updatedTo}
                  onChange={(value) => update("updatedTo", value)}
                />
              </FilterGroup>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  onClick={reset}
                  className="border border-line bg-white px-4 py-2.5 text-xs text-muted"
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={search}
                  className="bg-primary px-4 py-2.5 text-xs text-white"
                >
                  Search Records
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">
            Active criteria:
          </span>
          {active.map(([key, value]) => (
            <Button
              key={key}
              onClick={() => update(key as keyof RecordFilterState, "")}
              className="border border-civic/20 bg-civic-soft px-2.5 py-1.5 text-xs text-civic"
            >
              {value}
              <Icon name="x" className="size-3" />
            </Button>
          ))}
        </div>
      )}
      <section className="mt-5">
        {state === "initial" && (
          <SearchMessage
            icon="search"
            title="Search accepted petition records"
            detail="Enter a known record number or name, or use one or more advanced filters to begin."
          />
        )}
        {state === "loading" && (
          <div className="rounded-xl border border-line bg-white p-12 text-center shadow-panel">
            <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-civic/20 border-t-civic" />
            <p className="mt-4 text-sm font-semibold text-primary-dark">
              Searching authorized petition records…
            </p>
          </div>
        )}
        {state === "invalid" && (
          <SearchMessage
            icon="info"
            title="Enter more search information"
            detail="Use at least two characters, a complete record number, or select an advanced filter."
            tone="error"
            action={reset}
            actionLabel="Reset Search"
          />
        )}
        {state === "broad" && (
          <SearchMessage
            icon="filter"
            title="Your search is too broad"
            detail="Enter a CCE or transaction number, a party name, or select at least one filter to narrow the results."
            action={() => setAdvancedOpen(true)}
            actionLabel="Open Advanced Filters"
          />
        )}
        {state === "empty" && (
          <SearchMessage
            icon="search"
            title="No matching petition record was found."
            detail="Verify the spelling, check the CCE or transaction number, or remove some filters."
            action={reset}
            actionLabel="Reset Filters"
          />
        )}
        {state === "results" && (
          <div className="overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
            <div className="flex flex-col justify-between gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center">
              <p className="text-sm font-bold text-primary-dark">
                18 matching records
              </p>
              <label className="flex items-center gap-2 text-xs text-muted">
                Sort by
                <select
                  value={filters.sort}
                  onChange={(event) => update("sort", event.target.value)}
                  className="rounded border border-line bg-white px-2 py-1.5"
                >
                  {[
                    "Recently Updated",
                    "Newest Filing",
                    "Oldest Filing",
                    "Longest Waiting",
                    "CCE Number",
                  ].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-5xl text-left text-xs">
                <thead className="bg-cool text-muted">
                  <tr>
                    {[
                      "CCE No.",
                      "Transaction No.",
                      "Petitioner",
                      "Document Owner",
                      "Petition Type",
                      "Filing Date",
                      "Current Stage",
                      "Physical Location",
                      "Last Updated",
                      "Action",
                    ].map((item) => (
                      <th
                        key={item}
                        className="whitespace-nowrap px-3 py-3 font-semibold"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {searchRows.map((row) => (
                    <tr key={row[0]} className="hover:bg-cool/70">
                      <td className="px-3 py-3 font-semibold text-primary-dark">
                        <Highlight text={row[0]} query={filters.query} />
                      </td>
                      <td className="px-3 py-3">
                        <Highlight text={row[1]} query={filters.query} />
                      </td>
                      <td className="px-3 py-3">
                        <Highlight text={row[6]} query={filters.query} />
                      </td>
                      <td className="px-3 py-3">
                        <Highlight text={row[2]} query={filters.query} />
                      </td>
                      <td className="px-3 py-3">{row[3]}</td>
                      <td className="px-3 py-3">{row[7]}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={row[4]} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-muted">
                        {row[8]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{row[5]}</td>
                      <td className="px-3 py-3">
                        <Button
                          onClick={openRecord}
                          className="whitespace-nowrap text-primary hover:underline"
                        >
                          Open Record <Icon name="chevron" className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between border-t border-line px-4 py-3 text-xs text-muted">
              <span>Showing 1–3 of 18 matching records</span>
              <div className="flex gap-1">
                <Button className="border border-line px-3 py-1.5">
                  Previous
                </Button>
                <Button className="bg-primary px-3 py-1.5 text-white">1</Button>
                <Button className="border border-line px-3 py-1.5">2</Button>
                <Button className="border border-line px-3 py-1.5">Next</Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="border-b border-line py-4 first:pt-0 last:border-b-0">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-civic">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  )
}

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
      />
    </label>
  )
}

function SearchMessage({
  icon,
  title,
  detail,
  tone = "default",
  action,
  actionLabel,
}: {
  icon: IconName
  title: string
  detail: string
  tone?: "default" | "error"
  action?: () => void
  actionLabel?: string
}) {
  return (
    <div
      className={`rounded-xl border bg-white px-5 py-12 text-center shadow-panel ${
        tone === "error" ? "border-red-200" : "border-line"
      }`}
    >
      <span
        className={`mx-auto grid size-12 place-items-center rounded-xl ${
          tone === "error"
            ? "bg-red-50 text-red-700"
            : "bg-civic-soft text-civic"
        }`}
      >
        <Icon name={icon} />
      </span>
      <Heading level={2} className="mt-4 text-lg font-bold text-primary-dark">
        {title}
      </Heading>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
        {detail}
      </p>
      {action && (
        <Button
          onClick={action}
          className="mt-5 border border-primary px-4 py-2.5 text-sm text-primary hover:bg-soft"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function StatusMonitoring({ openRecord, records, live = false }: { openRecord: (reference: string) => void; records: string[][]; live?: boolean }) {
  const [selectedSummary, setSelectedSummary] = useState("")
  const [waiting, setWaiting] = useState("Any")
  const [sort, setSort] = useState("Longest Waiting")
  const [updating, setUpdating] = useState("")
  const summaries: [string, string, IconName, string][] = [
    ["18", "Awaiting MCR Action", "status", "bg-[#f2e8dc] text-[#674730]"],
    ["9", "Posting Period", "clock", "bg-[#f4ebdf] text-[#704d31]"],
    ["24", "Awaiting PSA Result", "clock", "bg-[#efebe5] text-[#62564a]"],
    ["12", "For Annotation", "document", "bg-[#ebf2ee] text-[#3e6552]"],
    ["6", "Client Action Required", "bell", "bg-[#fbefd7] text-[#805018]"],
    ["15", "Recently Completed", "check", "bg-[#ebf2ee] text-[#3e6552]"],
  ]
  const rows = [
    [
      "CCE-2026-0048",
      "Maria S. Reyes",
      "Date of Birth",
      "Awaiting PSA Result",
      "Jul 22, 2026",
      "63 days",
      "Sep 23, 2026",
    ],
    [
      "CCE-2026-0042",
      "Jose D. Cruz",
      "Clerical Error",
      "For Annotation",
      "Aug 17, 2026",
      "37 days",
      "Sep 22, 2026",
    ],
    [
      "CCE-2026-0039",
      "Ana P. Santos",
      "Change of First Name",
      "Awaiting MCR Action",
      "Sep 5, 2026",
      "18 days",
      "Sep 20, 2026",
    ],
    [
      "CCE-2026-0036",
      "Luis T. Ramos",
      "Correction of Sex",
      "Client Action Required",
      "Sep 16, 2026",
      "7 days",
      "Sep 19, 2026",
    ],
  ]
  const liveRows = records.map(record => [record[0], record[6], petitionServiceName(record[3]), record[4], record[7], "", record[5], record[1]])
  const visibleRows = (live ? liveRows : rows.map(row => {
    const record = records.find(item => item[0] === row[0])
    return record ? row.map((value, index) => index === 3 ? record[4] : index === 6 ? record[5] : value) : row
  })).filter(row => !selectedSummary || row[3] === selectedSummary)
  const shownSummaries = live ? summaries.map(([count, label, icon, tone], index) => {
    const stage = ["MCR Decision", "Posting Period", "Awaiting PSA Action", "Endorsement for Annotation", "Action Required", "Annotation / Completion"][index]
    return [String(liveRows.filter(row => row[3] === stage).length), stage, icon, tone] as const
  }) : summaries
  return (
    <div>
      {updating && <UpdateStatusPanel reference={updating} close={() => setUpdating("")} />}
      <div className="civily-services-surface civily-admin-dashboard-banner rounded-2xl">
        <Heading level={1} className="civily-admin-banner-title text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
          Petition Status Monitoring
        </Heading>
        <p className="civily-admin-banner-copy mt-2 text-sm leading-relaxed">
          Select a stage to narrow the records below.
        </p>
      </div>
      <div role="group" aria-label="Filter petitions by stage" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {shownSummaries.map(([count, label, icon, iconTone]) => {
          const selected = selectedSummary === label
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedSummary(label)}
              className={`civily-admin-panel flex min-w-0 cursor-pointer flex-col gap-2.5 rounded-xl p-3.5 text-left ring-1 ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? "bg-[#f5e8d8] ring-[#9b725d]" : "bg-[#fffcf8] ring-line hover:bg-section"}`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-lg ${iconTone}`}>
                  <Icon name={icon} className="size-4" />
                </span>
                <strong className="text-2xl leading-none font-bold tracking-tight text-primary-dark tabular-nums">{count}</strong>
              </span>
              <span className="text-sm leading-snug font-medium text-primary-dark">{label}</span>
            </button>
          )
        })}
      </div>
      <section className="mt-5 civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Heading level={2} className="font-bold text-primary-dark">
            Monitoring Filters
          </Heading>
          <Button onClick={() => setSelectedSummary("")} className="text-xs text-primary hover:underline">
            Clear All
          </Button>
        </div>
        <div className="grid gap-3 bg-cool/60 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Petition Type"
            value=""
            onChange={() => undefined}
            options={[
              "Date of Birth",
              "Clerical Error",
              "Change of First Name",
              "Correction of Sex",
            ]}
          />
          <FilterSelect
            label="Current Stage"
            value={selectedSummary}
            onChange={setSelectedSummary}
            options={summaries.map(([, label]) => label)}
          />
          <DateFilter
            label="Date Transmitted to PSA"
            value=""
            onChange={() => undefined}
          />
          <FilterSelect
            label="Last Updated"
            value=""
            onChange={() => undefined}
            options={["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"]}
          />
          <FilterSelect
            label="Outcome"
            value=""
            onChange={() => undefined}
            options={["Granted", "Denied", "Affirmed", "Impugned"]}
          />
          <FilterSelect
            label="Client Action Required"
            value=""
            onChange={() => undefined}
            options={["Yes", "No"]}
          />
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Waiting Duration
            </span>
            <select
              value={waiting}
              onChange={(event) => setWaiting(event.target.value)}
              className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
            >
              {["Any", "7+ days", "30+ days", "60+ days", "90+ days"].map(
                (option) => (
                  <option key={option}>{option}</option>
                ),
              )}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Sort By
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
            >
              {[
                "Longest Waiting",
                "Recently Updated",
                "Oldest Filing",
                "Newest Filing",
              ].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
          <Button className="border border-line px-4 py-2 text-xs text-muted">
            Reset Filters
          </Button>
          <Button className="bg-primary px-4 py-2 text-xs text-white">
            Apply Filters
          </Button>
        </div>
      </section>
      <section className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="flex flex-col justify-between gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <Heading level={2} className="font-bold text-primary-dark">
              Active Petition Monitoring
            </Heading>
            <p className="mt-1 text-xs text-muted">
              Waiting duration is based on the latest recorded stage date and
              does not indicate an official deadline.
            </p>
          </div>
          <span className="w-fit rounded-full bg-civic-soft px-3 py-1.5 text-xs font-bold text-civic">
            {visibleRows.length} records shown
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-4xl text-left text-xs">
            <thead className="sticky top-0 bg-cool text-muted">
              <tr>
                {[
                  "CCE No.",
                  "Document Owner",
                  "Petition Type",
                  "Current Stage",
                  "Stage Since",
                  "Waiting Duration",
                  "Last Update",
                  "Action",
                ].map((item) => (
                  <th
                    key={item}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleRows.length === 0 && <tr><td colSpan={8} className="px-3 py-6 text-center text-muted">No records match this stage.</td></tr>}
              {visibleRows.map((row) => (
                <tr
                  key={row[0]}
                  className={
                    row[3] === "Awaiting PSA Result" || row[3] === "Client Action Required"
                      ? "border-l-4 border-l-gold bg-warning/25"
                      : "hover:bg-cool/70"
                  }
                >
                  <td className="whitespace-nowrap px-3 py-3 font-bold text-primary-dark">
                    {row[0]}
                  </td>
                  <td className="px-3 py-3">{row[1]}</td>
                  <td className="px-3 py-3">{row[2]}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={row[3]} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{row[4]}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        row[3] === "Awaiting PSA Result" ? "text-warning-text" : "text-ink"
                      }`}
                    >
                      <Icon name="clock" className="size-3.5" />
                      {row[5] ? "Waiting " + row[5] : "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{row[6]}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => openRecord(live ? row[7] : row[0])}
                        className="whitespace-nowrap text-primary hover:underline"
                      >
                        Open Record
                      </Button>
                      <Button
                        onClick={() => live ? openRecord(row[7]) : setUpdating(row[0])}
                        className="whitespace-nowrap border border-primary px-2.5 py-1.5 text-primary hover:bg-soft"
                      >
                        Update Status
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-line px-4 py-3 text-xs text-muted">
          <span>{visibleRows.length} petition records</span>
          {!live && <div className="flex gap-1">
            <Button className="border border-line px-3 py-1.5">Previous</Button>
            <Button className="bg-primary px-3 py-1.5 text-white">1</Button>
            <Button className="border border-line px-3 py-1.5">Next</Button>
          </div>}
        </div>
      </section>
    </div>
  )
}

function EditPetitionService({ service, onSave }: { service: string; onSave: (type: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(service)
  const [saved, setSaved] = useState(false)

  return (
    <div className="rounded-lg bg-section p-3">
      <dt className="text-xs text-muted">Subject / service</dt>
      {editing ? (
        <dd className="mt-2">
          <form onSubmit={event => {
            event.preventDefault()
            if (!Object.hasOwn(petitionServiceNames, draft) || draft === service) return
            onSave(draft)
            setEditing(false)
            setSaved(true)
          }}>
            <PetitionServiceSelect value={draft} onChange={setDraft} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="submit" className="bg-primary px-3 py-2 text-xs text-white">Save service</Button>
              <Button onClick={() => setEditing(false)} className="px-3 py-2 text-xs text-primary">Cancel</Button>
            </div>
          </form>
        </dd>
      ) : (
        <dd className="mt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-primary-dark">{petitionServiceName(service)}</span>
            <Button onClick={() => {
              setDraft(service)
              setSaved(false)
              setEditing(true)
            }} className="bg-white px-2.5 py-1.5 text-xs text-primary ring-1 ring-inset ring-line hover:bg-soft">Edit service</Button>
          </div>
          {saved && <p role="status" className="mt-2 text-xs text-[#356149]">Service updated.</p>}
        </dd>
      )}
    </div>
  )
}

function PetitionServiceSelect({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  return (
    <select
      name="type"
      required
      aria-label="Subject / service"
      value={value}
      defaultValue={value === undefined ? "" : undefined}
      onChange={onChange ? event => onChange(event.target.value) : undefined}
      className="w-full min-w-0 rounded-lg border border-line px-3 py-2 text-sm"
    >
      <option value="" disabled>Select a service</option>
      {Object.entries(petitionServiceNames).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
    </select>
  )
}

function NewPetitionForm({
  onSave,
  onCancel,
}: {
  onSave: (record: string[], filingDate: string) => void
  onCancel: () => void
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (key: string) => String(data.get(key) ?? "").trim()
    const owner = get("owner")
    const petitioner = get("petitioner")
    if (!owner || !petitioner) return
    const date = get("date")
    const formatted = new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const lastUpdate = new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila",
    }).format(new Date())
    onSave(["", "", owner, get("type"), "Petition Accepted", lastUpdate, petitioner, formatted], date)
  }
  return (
    <form onSubmit={submit} className="civily-admin-panel mt-4 rounded-xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-primary-dark">New demo petition</h2>
      <p className="mt-1 text-sm text-muted">Use sample names and select the service the petitioner is requesting.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">Document owner<input name="owner" required className="rounded-lg border border-line px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-medium">Petitioner<input name="petitioner" required className="rounded-lg border border-line px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-medium">
          Subject / service
          <PetitionServiceSelect />
        </label>
        <label className="grid gap-1 text-sm font-medium">Filing date<input name="date" type="date" required className="rounded-lg border border-line px-3 py-2" /></label>
      </div>
      <div className="mt-4 rounded-lg border border-line bg-section px-3 py-2.5 text-sm text-muted">
        CIVILyst assigns the CCE and transaction numbers and records the petition as accepted when you save.
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onCancel} className="px-3 py-2 text-sm text-primary">Cancel</Button>
        <Button type="submit" className="bg-primary px-4 py-2 text-sm text-white">Save petition</Button>
      </div>
    </form>
  )
}

const petitionServiceNames: Record<string, string> = {
  "Clerical Error": "Correction of Clerical or Typographical Error",
  "Change of First Name": "Change of First Name",
  "Date of Birth": "Correction of Date of Birth",
  "Correction of Sex": "Correction of Sex",
}

function petitionServiceName(type: string) {
  return petitionServiceNames[type] ?? type
}
const initialDemoRecords = [
  [...petitions[0], "Elena M. Reyes", "Sep 4, 2026"],
  [...petitions[1], "Jose R. Cruz", "Sep 8, 2026"],
  [...petitions[2], "Roberto P. Santos", "Sep 11, 2026"],
  [...petitions[3], "Luis T. Ramos", "Sep 12, 2026"],
]

const exportColumns: [number, string][] = [
  [0, "CCE number"], [1, "Transaction number"], [2, "Document owner"],
  [6, "Petitioner"], [3, "Subject / service"], [7, "Filing date"],
  [4, "Current stage"], [5, "Last updated"],
]

const defaultExportTitle = "CIVILyst Petition Records"

function reportDate() {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "Asia/Manila" }).format(new Date())
}

function exportPetitionResults(records: string[][], columns: number[], report: { title: string; scope: string } | null) {
  const fields = exportColumns.filter(([index]) => columns.includes(index))
  const headers = fields.map(([, label]) => label)
  const rows = records.map(row => fields.map(([index]) => index === 3 ? petitionServiceName(row[3]) : row[index] ?? ""))
  const reportRows = report ? [
    report.title,
    "Municipal Civil Registrar’s Office of Daet",
    "Export date: " + reportDate(),
    "Scope: " + report.scope,
    "Record count: " + records.length,
    "",
  ].map(line => [line, ...Array<string>(headers.length - 1).fill("")]) : []
  const csv = [...reportRows, headers, ...rows].map(row => row.map(cell => {
    const safe = /^[\s]*[=+@-]/.test(cell) || /^[\t\r\n]/.test(cell) ? "'" + cell : cell
    return '"' + safe.replaceAll('"', '""') + '"'
  }).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = "civily-petition-results.csv"
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function PetitionExportDialog({ records, matches, criteria }: { records: string[][]; matches: string[][]; criteria: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [scope, setScope] = useState<"matching" | "all">("matching")
  const [columns, setColumns] = useState(exportColumns.map(([index]) => index))
  const [includeTitle, setIncludeTitle] = useState(true)
  const [reportTitle, setReportTitle] = useState(defaultExportTitle)
  const exportRecords = scope === "matching" ? matches : records

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setScope("matching")
          dialog.current?.showModal()
        }}
        className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-b from-[#fffaf3] to-[#f0e1cf] py-1.5 pr-3 pl-1.5 text-xs font-semibold text-primary-dark shadow-sm ring-1 ring-inset ring-[#cbb094] hover:to-[#e8d3bb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-md bg-primary text-white">
          <Icon name="download" className="size-4" />
        </span>
        Export CSV
      </button>
      <dialog ref={dialog} aria-labelledby="petition-export-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-auto rounded-2xl border border-line bg-[#fffcf7] text-ink shadow-xl backdrop:bg-primary-dark/45">
        <form onSubmit={event => {
          event.preventDefault()
          if (!exportRecords.length || !columns.length) return
          exportPetitionResults(exportRecords, columns, includeTitle ? {
            title: reportTitle.trim() || defaultExportTitle,
            scope: scope === "all" ? "All records" : "Current results · " + criteria,
          } : null)
          dialog.current?.close()
        }}>
          <div className="civily-services-surface border-b border-line px-5 py-4">
            <h2 id="petition-export-title" className="text-lg font-semibold text-[#fff7ec]">Export petition records</h2>
            <p className="mt-1 text-sm text-[#f3ddc7]">Choose the records, columns, and report details to include.</p>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div className="rounded-xl border border-line bg-section p-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <input type="checkbox" className="accent-primary" checked={includeTitle} onChange={event => setIncludeTitle(event.target.checked)} />
                Include report details
              </label>
              {includeTitle && (
                <label className="mt-3 grid gap-1 text-xs font-medium text-muted">
                  Report title
                  <input value={reportTitle} maxLength={100} onChange={event => setReportTitle(event.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm text-primary-dark" />
                </label>
              )}
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-primary-dark">Records</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-lg border border-line bg-white p-2.5 text-sm"><input className="accent-primary" type="radio" name="export-scope" checked={scope === "matching"} onChange={() => setScope("matching")} /> Current results ({matches.length})</label>
                <label className="flex items-center gap-2 rounded-lg border border-line bg-white p-2.5 text-sm"><input className="accent-primary" type="radio" name="export-scope" checked={scope === "all"} onChange={() => setScope("all")} /> All records ({records.length})</label>
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-primary-dark">Columns</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {exportColumns.map(([index, label]) => (
                  <label key={index} className="flex items-center gap-2 text-sm">
                    <input className="accent-primary" type="checkbox" checked={columns.includes(index)} onChange={event => {
                      const checked = event.target.checked
                      setColumns(current => checked ? [...current, index] : current.filter(column => column !== index))
                    }} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-section px-5 py-3">
            <p aria-live="polite" className="text-xs text-muted">{exportRecords.length} records · {columns.length} columns</p>
            <div className="flex gap-2">
              <Button onClick={() => dialog.current?.close()} className="px-3 py-2 text-sm text-primary">Cancel</Button>
              <button type="submit" disabled={!exportRecords.length || !columns.length} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40">Download CSV</button>
            </div>
          </div>
        </form>
      </dialog>
    </>
  )
}

export function RecordsWorkspace({
  filters,
  setFilters,
  openRecord,
  records,
  addRecord,
  onEncode,
  intakeForm,
  title = "Petition Records",
}: {
  filters: RecordFilterState
  setFilters: (filters: RecordFilterState) => void
  openRecord: (record: string[]) => void
  records: string[][]
  addRecord?: (record: string[], filingDate: string) => string
  onEncode?: () => void
  intakeForm?: ReactNode
  title?: string
}) {
  const [adding, setAdding] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const update = (key: keyof RecordFilterState, value: string) =>
    setFilters({ ...filters, [key]: value })
  const active = [
    ["type", filters.type],
    ["stage", filters.stage],
    ["psa", filters.psa],
    ["outcome", filters.outcome],
    ["clientAction", filters.clientAction],
    ["recordStatus", filters.recordStatus],
    ["lastUpdated", filters.lastUpdated],
    ["dateFrom", filters.dateFrom],
  ].filter(([, value]) => value)
  const clear = () =>
    setFilters({
      query: "",
      type: "",
      stage: "",
      psa: "",
      outcome: "",
      clientAction: "",
      recordStatus: "",
      lastUpdated: "",
      archive: "",
      updatedFrom: "",
      updatedTo: "",
      dateFrom: "",
      dateTo: "",
      sort: "Recently Updated",
    })
  const matchingRecords = records.filter((record) => {
    const keywordMatch =
      !filters.query ||
      record.slice(0, 3).concat(record[6], record[3], petitionServiceName(record[3])).some(value => value.toLowerCase().includes(filters.query.trim().toLowerCase()))
    const typeMatch = !filters.type || record[3] === filters.type
    const stageMatch = !filters.stage || record[4] === filters.stage
    const date = new Date(record[7] + " UTC")
    const filingDate = Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
    return keywordMatch && typeMatch && stageMatch &&
      (!filters.dateFrom || filingDate === filters.dateFrom)
  })
  const reportCriteria = [
    filters.query.trim() && `Search: ${filters.query.trim()}`,
    filters.type && petitionServiceName(filters.type),
    filters.stage,
    filters.dateFrom && `Filed on ${filters.dateFrom}`,
  ].filter(Boolean).join(" · ") || "No filters applied"
  return (
    <div>
      {createPortal(
        <section className="civily-report">
          <p>Municipal Civil Registrar’s Office of Daet</p>
          <h1>Petition Search Results</h1>
          <p>Export date: {reportDate()} · {matchingRecords.length} matching records</p>
          <p>Filters: {reportCriteria}</p>
          <table>
            <thead><tr>{["CCE No.", "Subject / service", "Filing Date", "Current Stage"].map(label => <th key={label}>{label}</th>)}</tr></thead>
            <tbody>{matchingRecords.map(row => (
              <tr key={row[0]}>{[0, 3, 7, 4].map(column => <td key={column}>{column === 3 ? petitionServiceName(row[3]) : row[column]}</td>)}</tr>
            ))}</tbody>
          </table>
        </section>,
        document.body,
      )}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Heading level={1} className="text-2xl font-bold text-primary-dark">
            {title}
          </Heading>
          <p className="mt-1 text-sm text-muted">
            Search petitions by case, party, filing date, and current stage.
          </p>
        </div>
        <Button onClick={onEncode ?? (() => setAdding(!adding))} expanded={onEncode ? Boolean(intakeForm) : adding} className="bg-primary px-4 py-2.5 text-sm text-white shadow-sm">
          <Icon name="document" className="size-4" />
          Add petition <Icon name="chevron" className="size-3.5" />
        </Button>
      </div>
      {intakeForm}
      {adding && addRecord && <NewPetitionForm onCancel={() => setAdding(false)} onSave={(record, date) => {
        setConfirmation(addRecord(record, date))
        clear()
        setAdding(false)
      }} />}
      {confirmation && <p role="status" className="mt-4 rounded-lg border border-line bg-sage-soft px-4 py-3 text-sm text-primary-dark">Saved demo petition {confirmation}.</p>}
      <div className="mt-5 civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="p-3.5 sm:p-4">
            <label className="civily-search-field flex-1">
              <Icon name="search" className="size-4 shrink-0" />
              <input
                aria-label="Search petition records"
                type="search"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
                placeholder="Search CCE no., transaction no., name, or subject…"
              />
            </label>
        </div>
        <div className="grid items-end gap-3 border-t border-line bg-section/70 p-3.5 sm:grid-cols-2 sm:p-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
            <FilterSelect
              label="Subject / service"
              value={filters.type}
              onChange={(value) => update("type", value)}
              options={[
                "Date of Birth",
                "Clerical Error",
                "Change of First Name",
                "Correction of Sex",
              ]}
            />
            <FilterSelect
              label="Current Stage"
              value={filters.stage}
              onChange={(value) => update("stage", value)}
              options={[
                "MCR Evaluation",
                "Awaiting PSA Action",
                "For Annotation",
                "Client Action Required",
                "Petition Accepted",
              ]}
            />
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-muted">
                Filing Date
              </span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) => update("dateFrom", event.target.value)}
                className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
              />
            </label>
            <Button
              onClick={clear}
              className="h-10 justify-self-start whitespace-nowrap bg-white px-3.5 text-xs text-primary ring-1 ring-inset ring-line hover:bg-page"
            >
              Clear all
            </Button>
        </div>
      </div>
      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">
            Active filters:
          </span>
          {active.map(([key, value]) => (
            <Button
              key={key}
              onClick={() => update(key as keyof RecordFilterState, "")}
              className="border border-civic/20 bg-civic-soft px-2.5 py-1.5 text-xs text-civic"
            >
              {value}
              <Icon name="x" className="size-3" />
            </Button>
          ))}
        </div>
      )}
      <div className="mt-5 overflow-hidden civily-admin-panel rounded-xl border border-line bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-bold text-primary-dark">
            {matchingRecords.length} sample petition records found
          </p>
          <div className="flex flex-wrap gap-2">
            <PetitionExportDialog records={records} matches={matchingRecords} criteria={reportCriteria} />
          <button
            type="button"
            disabled={!matchingRecords.length}
            onClick={() => window.print()}
            className="rounded-lg bg-primary px-4 py-2 text-xs text-white disabled:opacity-40"
          >
            Print Results
          </button>
          </div>
        </div>
        {matchingRecords.length > 0 ? (
          <div className="max-h-[34rem] overflow-auto">
            <table className="w-full min-w-4xl text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-line bg-cool text-muted">
                <tr>
                  {[
                    "CCE No.",
                    "Transaction No.",
                    "Document Owner",
                    "Petitioner",
                    "Subject / service",
                    "Filing Date",
                    "Current Stage",
                    "Last Update",
                    "Action",
                  ].map((item) => (
                    <th
                      key={item}
                      className="whitespace-nowrap px-3 py-3 font-semibold"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {matchingRecords.map((row, rowIndex) => (
                  <tr
                    key={`${row[0]}-${rowIndex}`}
                    onClick={() => openRecord(row)}
                    className="group cursor-pointer hover:bg-cool/70"
                  >
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-primary-dark">
                      {row[0]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{row[1]}</td>
                    <td className="px-3 py-3">{row[2]}</td>
                    <td className="px-3 py-3">{row[6]}</td>
                    <td className="px-3 py-3">
                      {petitionServiceName(row[3])}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{row[7]}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={row[4]} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{row[5]}</td>
                    <td className="px-3 py-3">
                      <Button
                        onClick={() => openRecord(row)}
                        className="text-primary hover:underline"
                      >
                        Open <Icon name="chevron" className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center px-5 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-civic-soft text-civic">
              <Icon name="search" />
            </span>
            <Heading
              level={2}
              className="mt-4 text-lg font-bold text-primary-dark"
            >
              No petition records match your current search and filters.
            </Heading>
            <p className="mt-2 text-sm text-muted">
              Try changing your keyword or removing one or more filters.
            </p>
            <Button
              onClick={clear}
              className="mt-5 border border-primary px-4 py-2.5 text-sm text-primary hover:bg-soft"
            >
              Clear Filters
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded border border-line bg-white px-3 text-xs outline-none focus:border-civic"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export const defaultRecordFilters: RecordFilterState = {
  query: "",
  type: "",
  stage: "",
  psa: "",
  outcome: "",
  clientAction: "",
  recordStatus: "",
  lastUpdated: "",
  archive: "",
  updatedFrom: "",
  updatedTo: "",
  dateFrom: "",
  dateTo: "",
  sort: "Recently Updated",
}

export default function InternalApp({ previewRole, onExitPreview }: { previewRole?: Role; onExitPreview?: () => void }) {
  const [previewReference, setPreviewReference] = useState("")
  const [email, setEmail] = useState("")
  const [workspace, setWorkspace] = useState<DemoWorkspace>(() => {
    try {
      const saved = localStorage.getItem(demoStoreKey)
      if (saved) return JSON.parse(saved) as DemoWorkspace
    } catch {
      // Keep the demo usable when browser storage is unavailable.
    }
    return { records: initialDemoRecords, accounts: initialDemoAccounts, activity: [], nextNumber: 129 }
  })
  const { accounts, records: demoRecords, activity } = workspace
  const actor = previewRole
    ? [previewRole === "admin" ? "Sample Super Admin" : "Sample Personnel", previewRole + "@example.test", previewRole === "admin" ? "Super Admin" : "Personnel"]
    : accounts.find(account => account[1] === email && account[3] === "Active")
  const role: Role | null = actor ? actor[2] === "Super Admin" ? "admin" : "staff" : null
  useEffect(() => {
    try {
      localStorage.setItem(demoStoreKey, JSON.stringify(workspace))
    } catch {
      // Updates remain available for this open demo session.
    }
  }, [workspace])
  const log = (user: string[], module: string, action: string, reference: string, detail: string) => {
    const now = new Date()
    return [activityDate.format(now), user[0], user[2], module, action, reference, detail, "Successful", manilaDate.format(now), (crypto.randomUUID?.() ?? String(now.getTime()) + "-" + Math.random().toString(36).slice(2)), user[1]]
  }
  const [view, setView] = useState<View>(previewRole === "staff" ? "records" : "dashboard")
  const [returnView, setReturnView] = useState<View>("dashboard")
  const [editingStatus, setEditingStatus] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const selectedRecord = demoRecords.find(record => record[0] === selectedRecordId)
  const [filters, setFilters] = useState<RecordFilterState>(defaultRecordFilters)
  if (!actor || !role) return <Login accounts={accounts} onSignIn={nextEmail => {
    const account = accounts.find(item => item[1] === nextEmail && item[3] === "Active")
    if (!account) return
    const entry = log(account, "Staff Portal", "Sign In", account[1], "Opened the demo workspace.")
    setWorkspace(current => ({
      ...current,
      accounts: current.accounts.map(item => item[1] === nextEmail ? item.map((value, index) => index === 4 ? entry[0] : value) : item),
      activity: [entry, ...current.activity],
    }))
    setEmail(nextEmail)
    setView("dashboard")
  }} />

  const createAccount = (name: string, address: string) => {
    const fullName = name.trim()
    const username = address.trim().toLowerCase()
    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) return "Enter a name and a valid email address."
    if (accounts.some(account => account[1].toLowerCase() === username)) return "An account already uses this email."
    const entry = log(actor, "Personnel Accounts", "Account Created", username, "Created a Personnel demo account.")
    setWorkspace(current => ({
      ...current,
      accounts: [...current.accounts, [fullName, username, "Personnel", "Active", "Never", entry[8]]],
      activity: [entry, ...current.activity],
    }))
    return ""
  }
  const addRecord = (record: string[], filingDate: string) => {
    const year = filingDate.slice(0, 4)
    const number = String(workspace.nextNumber).padStart(6, "0")
    const reference = "CCE-" + year + "-" + number
    const transaction = "CIV-" + year + "-" + number
    const entry = log(actor, "Petition Records", "Petition Created", reference, "Created petition " + transaction + ".")
    setWorkspace(current => ({
      ...current,
      records: [[reference, transaction, ...record.slice(2)], ...current.records],
      nextNumber: current.nextNumber + 1,
      activity: [entry, ...current.activity],
    }))
    return transaction
  }
  const editRecord = (reference: string, column: 3 | 4, value: string) => {
    const record = demoRecords.find(item => item[0] === reference)
    if (!record || record[column] === value) return false
    const entry = log(actor, "Petition Records", column === 3 ? "Service Updated" : "Status Updated", reference, record[column] + " → " + value)
    setWorkspace(current => ({
      ...current,
      records: current.records.map(item => item[0] === reference ? item.map((field, index) => index === column ? value : index === 5 ? reportDate() : field) : item),
      activity: [entry, ...current.activity],
    }))
    return true
  }

  let content: ReactNode
  if (previewRole === "staff")
    content = <section className="rounded-xl border border-line bg-white p-5">
      <h1 className="text-2xl font-bold text-primary-dark">Petition Records</h1>
      {previewReference && <p role="status" className="my-3 text-sm text-primary">Sample petition saved · {previewReference}</p>}
      <NewPetitionForm onCancel={() => onExitPreview?.()} onSave={(record, date) => setPreviewReference(addRecord(record, date))} />
    </section>
  else if (view === "record")
    content = (
      selectedRecord ? (
        <section className="civily-admin-panel rounded-xl border border-line bg-white p-5">
          <Button onClick={() => setView(returnView)} className="mb-2 text-sm text-primary"><Icon name="chevron" className="size-4 rotate-180" /> Back to results</Button>
          <h1 className="text-2xl font-bold text-primary-dark">{selectedRecord[0]}</h1>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {["Case number", "Transaction number", "Document owner", "Subject / service", "Current stage", "Last updated", "Petitioner", "Filing date"].map((label, index) => index === 3 ? (
              <EditPetitionService key={selectedRecord[0]} service={selectedRecord[3]} onSave={type => editRecord(selectedRecord[0], 3, type)} />
            ) : (
              <div key={label} className="rounded-lg bg-section p-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-primary-dark">{selectedRecord[index] || "—"}</dd>
              </div>
            ))}
          </dl>
          <Button onClick={() => setEditingStatus(true)} className="mt-4 bg-primary px-4 py-2 text-sm text-white">Update Status</Button>
          {editingStatus && <UpdateStatusPanel reference={selectedRecord[0]} close={() => setEditingStatus(false)} />}
          <h2 className="mt-6 text-lg font-bold text-primary-dark">Activity History</h2>
          <ul className="mt-2 divide-y divide-line">
            {activity.filter(entry => entry[5] === selectedRecord[0]).map(entry => (
              <li key={entry[9]} className="py-2 text-sm">
                <strong>{entry[4]} · {entry[1]}</strong>
                <p className="text-muted">{entry[0]} · {entry[6]}</p>
              </li>
            ))}
            {!activity.some(entry => entry[5] === selectedRecord[0]) && <li className="text-sm text-muted">No recorded changes in this demo.</li>}
          </ul>
        </section>
      ) : <FullPetitionRecord onBack={() => setView(returnView)} role={role} />
    )
  else if (view === "monitoring")
    content = (
      <StatusMonitoring
        records={demoRecords}
        openRecord={reference => {
          setSelectedRecordId(reference)
          setReturnView("monitoring")
          setView("record")
        }}
      />
    )
  else if (view === "records")
    content = (
      <RecordsWorkspace
        records={demoRecords}
        addRecord={addRecord}
        filters={filters}
        setFilters={setFilters}
        openRecord={(record) => {
          setSelectedRecordId(record[0])
          setReturnView(view)
          setView("record")
        }}
        title="Petition Records"
      />
    )
  else if (role === "admin" && view === "collections") content = <Collections />
  else if (role === "admin" && view === "users") content = <UserAccounts accounts={accounts} onCreate={createAccount} />
  else if (view === "roles") content = <RolesPermissions />
  else if (role === "admin" && view === "audit") content = <AuditLog activity={activity} />
  else if (view === "settings") content = <SystemSettings />
  else if (view === "backup") content = <BackupRecovery />
  else if (view !== "dashboard")
    content = (
      <div>
        <p className="text-xs font-bold uppercase text-primary">
          {role === "admin"
            ? "Super Administration"
            : "Operations"}
        </p>
        <Heading level={1} className="text-2xl font-bold text-primary-dark">
          {({public: "Services & Requirements", samples: "Document Samples", account: "My Account"})[view as "public" | "samples" | "account"]}
        </Heading>
        <div className="mt-5 rounded border border-line bg-white p-10 text-center">
          <p className="font-semibold text-primary-dark">Module preview</p>
          <p className="mt-2 text-sm text-muted">
            This workspace follows the same secure CIVILyst administrative
            layout.
          </p>
        </div>
      </div>
    )
  else
    content = (
      <Dashboard
        role={role}
        userName={actor[0]}
        openRecord={reference => {
          setSelectedRecordId(reference)
          setReturnView("dashboard")
          setView("record")
        }}
        openAdvanced={() => setView("records")}
        onSearch={(query) => {
          setFilters({ ...defaultRecordFilters, query })
          setView("records")
        }}
      />
    )

  return (
    <DemoStatusContext.Provider value={(reference, stage) => editRecord(reference, 4, stage)}>
      <InternalWorkspaceLayout live={previewRole === "staff"} role={role} view={view} userName={actor[0]} onNavigate={setView} onSignOut={() => {
        if (onExitPreview) { onExitPreview(); return }
        const entry = log(actor, "Staff Portal", "Sign Out", actor[1], "Closed the demo workspace.")
        setWorkspace(current => ({ ...current, activity: [entry, ...current.activity] }))
        setEmail("")
        setEditingStatus(false)
      }}>{previewRole && <p className="mb-4 rounded-lg border border-line bg-section px-4 py-2 text-sm font-semibold text-primary-dark">Sample workspace · Changes stay in this browser</p>}{content}</InternalWorkspaceLayout>
    </DemoStatusContext.Provider>
  )
}

export function InternalWorkspaceLayout({ role, view, userName, onNavigate, onSignOut, children, live = false }: {
  role: Role
  view: View
  userName: string
  onNavigate: (view: View) => void
  onSignOut: () => void
  children: ReactNode
  live?: boolean
}) {
  const [mobileNav, setMobileNav] = useState(false)
  const mainNav: [View, string][] = [
    ["dashboard", "Dashboard"],
    ["records", "Petition Records"],
    ["monitoring", "Status Monitoring"],

    ["public", "Services & Requirements"],
    ["samples", "Document Samples"],
    ["account", "My Account"],
  ]
  const adminNav: [View, string][] = [
    ["collections", "Service Fee Collections"],
    ["users", "Personnel Accounts"],
    ...(live ? [["sms", "SMS Queue"] as [View, string]] : []),
    ["audit", "Audit Logs"],
    ["settings", "System Settings"],
    ["backup", "Backup & Recovery"],
  ]
  const select = (nextView: View) => {
    onNavigate(nextView)
    setMobileNav(false)
  }
  const navIcons: Record<View, IconName> = {
    dashboard: "dashboard",
    sms: "bell",
    records: "folder",
    monitoring: "status",
    collections: "document",
    public: "document",
    samples: "samples",
    account: "user",
    record: "document",
    users: "users",
    roles: "roles",
    audit: "audit",
    settings: "settings",
    backup: "backup",
  }
  const nav = (
    <>
      <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-[#e9ccb0]">
        Petition Management
      </p>
      {(live && role === "staff" ? mainNav.filter(([key]) => key === "records") : mainNav).map(([key, label]) => (
        <div key={key}>
          {key === "public" && (
            <p className="mt-4 border-t border-white/10 px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider text-[#e9ccb0]">
              Public Information
            </p>
          )}
          {key === "account" && (
            <p className="mt-4 border-t border-white/10 px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider text-[#e9ccb0]">
              Account
            </p>
          )}
          <Button
            onClick={() => select(key)}
            className={`civily-admin-nav-item mb-1 w-full justify-start px-3 py-2.5 text-sm ${
              view === key
                ? "border-[#dfba8c] bg-[#f4e8d8] text-primary-dark"
                : "border-transparent text-[#f0ddc9] hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name={navIcons[key]} className="size-4" />
            <span className="flex-1">{label}</span>
          </Button>
        </div>
      ))}
      {role === "admin" && (
        <>
          <p className="mt-4 border-t border-white/10 px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider text-[#e9ccb0]">
            Administration
          </p>
          {adminNav.map(([key, label]) => (
            <Button
              key={key}
              onClick={() => select(key)}
              className={`civily-admin-nav-item mb-1 w-full justify-start px-3 py-2.5 text-sm ${
                view === key
                  ? "border-[#dfba8c] bg-[#f4e8d8] text-primary-dark"
                  : "border-transparent text-[#f0ddc9] hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={navIcons[key]} className="size-4" />
              <span className="flex-1">{label}</span>
            </Button>
          ))}
        </>
      )}
      <div className="mt-6 border-t border-white/10 px-3 pt-4">
        <p className="text-sm font-semibold text-white">
          {userName}
        </p>
        <span className="mt-2 inline-block rounded border border-white/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/60">
          {role === "admin" ? "Super Admin" : "Personnel"}
        </span>
      </div>
      <Button
        onClick={onSignOut}
        className="mt-3 w-full justify-start px-3 py-3 text-sm text-white/60 hover:bg-white/7 hover:text-white"
      >
        <Icon name="logout" className="size-4" />
        Sign Out
      </Button>
    </>
  )

  return (
    <div className="civily-page civily-admin-background min-h-screen text-ink">
      <header className="sticky top-0 z-30 px-3 pt-2 sm:px-5 sm:pt-3">
        <div className="civily-header-edge">
          <div className="flex min-h-14 items-center justify-between gap-3 rounded-[15px] bg-[#fffcf7] px-3 py-2 text-primary-dark sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Button onClick={() => setMobileNav(!mobileNav)} ariaLabel={mobileNav ? "Close navigation" : "Open navigation"} className="size-9 shrink-0 bg-section text-primary ring-1 ring-inset ring-line md:hidden">
                <Icon name={mobileNav ? "x" : "menu"} className="size-4" />
              </Button>
              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                {([[daetSeal, "Municipality of Daet"], [psaLogo, "Philippine Statistics Authority"], [maogmangDaet, "Maogmang Daet"]] as const).map(([src, label]) => (
                  <img key={label} src={src} alt={label} width={40} height={40} className="size-7 rounded-full border border-line bg-white object-contain sm:size-10" />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-base leading-tight font-bold tracking-tight">CIVILyst</p>
                <p className="hidden truncate text-xs text-muted sm:block">MCR Daet · {role === "admin" ? "Super Admin" : "Personnel"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex items-start gap-4 px-3 pt-4 pb-5 sm:px-5">
        <aside className="civily-services-surface civily-admin-nav sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-60 shrink-0 overflow-y-auto rounded-2xl p-3 shadow-panel md:block">
          {nav}
        </aside>
        {mobileNav && (
          <div className="fixed inset-0 top-20 z-20 bg-black/30 md:hidden">
            <aside className="civily-services-surface civily-admin-nav h-full w-64 max-w-[85vw] overflow-y-auto rounded-r-2xl p-3">
              {nav}
            </aside>
          </div>
        )}
        <main className="civily-admin-workspace mx-auto min-w-0 max-w-[92rem] flex-1">{children}</main>
      </div>
    </div>
  )
}
