import { useEffect, useState, type FormEvent } from "react"
import { apiRequest } from "./api"
import { AuditLog, Dashboard, InternalWorkspaceLayout, RecordsWorkspace, StatusMonitoring, defaultRecordFilters, type View } from "./InternalApp"
import Collections from "./Collections"
import { Footer, HelpQuestions, Icon, LanguageMenu, PageIntro, useScrollLighting } from "./ClientPortal"
import daetSeal from "./assets/daet-seal.png"
import psaLogo from "./assets/psa-logo.png"
import maogmangDaet from "./assets/maogmang-daet.png"
import officePhoto from "./assets/mcr-daet-office.png"

type Staff = { full_name: string; email: string; role: "personnel" | "super_admin" }
type Session = { staff: Staff | null }
type Row = Record<string, string | number>
const control = "min-h-11 w-full rounded-lg border border-line bg-white px-3 text-ink focus:outline-2 focus:outline-primary"
const action = "min-h-11 rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
const surface = "rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-7"

function Field({ name, label = name, type = "text", minLength, optional = false }: { name: string; label?: string; type?: string; minLength?: number; optional?: boolean }) {
  return <label className="grid gap-1.5 text-sm font-semibold capitalize">
    {label}
    <input className={control} name={name} type={type} required={!optional} minLength={minLength} autoComplete={type === "password" ? "off" : undefined} />
  </label>
}

function DataForm({ route, button, children, onSaved }: {
  route: string; button: string; children: React.ReactNode; onSaved: (data: { reference?: string; smsQueued?: boolean }) => void | Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const input = Object.fromEntries(new FormData(form))
    const body = { ...input, current: input.current === "on" }
    setBusy(true)
    setError("")
    try {
      const result = await apiRequest<{ reference?: string; smsQueued?: boolean }>(route, body)
      form.reset()
      await onSaved(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The operation failed.")
    } finally {
      setBusy(false)
    }
  }
  return <form onSubmit={submit} className="mt-4 grid gap-4">
    <fieldset disabled={busy} className="grid min-w-0 gap-4">{children}</fieldset>
    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    <button disabled={busy} className={action}>{busy ? (route === "login" ? "Signing in…" : "Saving…") : button}</button>
  </form>
}

function WorkspaceBrand() {
  return <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
    <div className="flex shrink-0 items-center gap-1.5">
      {([[daetSeal, "Municipality of Daet"], [psaLogo, "Philippine Statistics Authority"], [maogmangDaet, "Maogmang Daet"]] as const).map(([src, name]) =>
        <img key={name} src={src} alt={name} width={40} height={40} className="size-10 rounded-full border border-line bg-white object-contain p-0.5 sm:size-12" />)}
    </div>
    <div className="min-w-0">
      <p className="text-3xl font-bold leading-none tracking-[-0.045em] text-primary-dark sm:text-4xl">CIVILyst</p>
      <p className="mt-1.5 text-xs font-medium leading-snug text-muted sm:text-sm">Municipal Civil Registrar’s Office · Daet</p>
    </div>
  </div>
}

function WorkspaceLanding({ children, fil }: { children: React.ReactNode; fil: boolean }) {
  const [photoReady, setPhotoReady] = useState(false)
  return <main>
    <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-panel lg:grid-cols-[1fr_1fr]">
      <section className="flex flex-col items-start justify-center px-6 py-8 sm:px-10 lg:py-14">
        <p className="civily-layered-label bg-primary px-3 py-1.5 text-sm font-semibold text-white">{fil ? "Para sa kawani ng MCR" : "For MCR staff"}</p>
        <h1 className="civily-section-underline civily-section-underline-light mt-5 max-w-[18ch] text-balance text-3xl font-bold leading-tight tracking-tight text-primary-dark sm:text-5xl">Petition Records and Monitoring</h1>
        <p className="mt-4 max-w-[42ch] leading-relaxed text-muted sm:text-lg">{fil ? "Gamitin ang inyong MCR account upang magtala ng mga tinanggap na petisyon at subaybayan ang progreso ng kaso." : "Encode accepted petitions and manage case progress using your assigned MCR account."}</p>
        <a href="#staff-overview" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md px-1 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{fil ? "Paano gumagana ang CIVILyst" : "How CIVILyst works"} <span aria-hidden="true">↓</span></a>
      </section>
      <section aria-label="Staff sign-in" data-photo-ready={photoReady} className="civily-staff-entry relative isolate grid min-w-0 place-items-center overflow-hidden bg-primary-dark px-4 py-8 sm:px-8 lg:min-h-[29rem] lg:py-10">
        <img src={officePhoto} alt="Personnel and visitors inside the Municipal Civil Registrar’s Office of Daet" onLoad={() => setPhotoReady(true)} onError={() => setPhotoReady(true)} className="civily-staff-entry-photo pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div aria-hidden="true" className="civily-staff-entry-tint pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,#3c261c99_0%,#59403270_55%,#25170f38_100%)]" />
        <div className="civily-staff-login-panel w-full max-w-md rounded-2xl border border-[#fff3df] bg-white p-5 shadow-[0_18px_48px_#21140e70] sm:p-7">
          {children}
        </div>
      </section>
    </div>
    <section id="staff-overview" aria-labelledby="staff-overview-title" className="-mx-4 mt-10 border-t border-line bg-white sm:-mx-8">
      <div className="mx-auto max-w-7xl px-6 py-9 sm:px-8 sm:py-12">
        <h2 id="staff-overview-title" className="civily-section-underline civily-section-underline-light text-3xl font-bold tracking-tight text-primary-dark">{fil ? "Paano gumagana ang CIVILyst" : "How CIVILyst works"}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <article className="border-l-2 border-[#c8a27d] pl-4">
            <h3 className="font-bold text-primary-dark">{fil ? "Tinanggap na petisyon" : "Petition intake"}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{fil ? "Nagbibigay ang MCR Daet ng reference number kapag tinanggap na ang petisyon." : "MCR Daet provides a transaction reference once it accepts a petition."}</p>
          </article>
          <article className="border-l-2 border-[#c8a27d] pl-4">
            <h3 className="font-bold text-primary-dark">{fil ? "Katayuan ng petisyon" : "Case progress"}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{fil ? "Magagamit ang reference number upang makita ang pinakahuling naitalang katayuan." : "Petitioners can use their reference to see the latest recorded status and next steps."}</p>
          </article>
          <article className="border-l-2 border-[#c8a27d] pl-4">
            <h3 className="font-bold text-primary-dark">{fil ? "Access ng kawani" : "Staff access"}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{fil ? "Gumagamit ang awtorisadong kawani ng sariling MCR account." : "Authorized staff sign in with their assigned MCR account to work on petition records."}</p>
          </article>
        </div>
      </div>
    </section>
    <Footer fromStaff navigate={page => window.location.assign(`/?view=${page}`)} />
  </main>
}

function WorkspaceHelp({ fil }: { fil: boolean }) {
  const questions = fil ? [
    ["Paano ako magkakaroon ng account?", "Makipag-ugnayan sa tagapangasiwa ng CIVILyst sa MCR Daet para sa account ng kawani."],
    ["Nakalimutan ko ang password ko.", "Hilingin sa tagapangasiwa ng CIVILyst na tulungan kang maibalik ang access sa iyong account."],
    ["Paano ko masusubaybayan ang aking petisyon?", "Buksan ang Petition Tracking at ilagay ang transaction reference na ibinigay ng MCR Daet."],
  ] : [
    ["How do I get a staff account?", "Contact the CIVILyst administrator at MCR Daet for access to an assigned account."],
    ["What if I forgot my password?", "Contact the CIVILyst administrator at MCR Daet for help restoring access."],
    ["Where can I check my petition status?", "Open Petition Tracking and enter the transaction reference issued by MCR Daet."],
  ]
  return <>
    <main lang={fil ? "fil" : "en"} className="civily-public-inner mx-auto mb-10 w-full max-w-7xl flex-1">
      <div className="civily-services-surface rounded-2xl p-4 sm:p-6">
        <PageIntro title={fil ? "Tulong sa workspace" : "Workspace help"} description={fil ? "Mga sagot tungkol sa account, pag-sign in, at pagsubaybay sa petisyon." : "Find answers about staff accounts, sign-in, and petition tracking."} />
        <div className="grid gap-2.5 sm:grid-cols-3">
          {([
            ["chevron", fil ? "Bumalik sa workspace" : "Back to workspace", "/portal"],
            ["shield", fil ? "Tulong sa account" : "Account support", "#workspace-account-support"],
            ["timeline", "Petition Tracking", "/?view=track"],
          ] as const).map(([icon, label, href]) => <a key={href} href={href} className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-[#fffcf7] p-3.5 text-sm font-semibold text-primary-dark shadow-panel hover:bg-section focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-white"><Icon name={icon} className={icon === "chevron" ? "size-5 rotate-180" : "size-5"} /></span>
            {label}
          </a>)}
        </div>
      </div>
      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <HelpQuestions faqs={questions} title={fil ? "Mga karaniwang tanong" : "Common questions"} />
        <aside id="workspace-account-support" className="civily-services-surface scroll-mt-6 rounded-2xl p-5 text-[#fff7ec]">
          <span className="grid size-11 place-items-center rounded-lg bg-white/10"><Icon name="help" /></span>
          <h2 className="civily-section-underline mt-3 text-xl font-semibold">{fil ? "Tulong sa account" : "Account support"}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#f3ddc7]">{fil ? "Para sa access o tulong sa password, makipag-ugnayan sa tagapangasiwa ng CIVILyst sa MCR Daet." : "For account access or password help, contact the CIVILyst administrator at MCR Daet."}</p>
        </aside>
      </div>
    </main>
    <Footer fromStaff navigate={page => window.location.assign(`/?view=${page}`)} />
  </>
}

function SignIn({ refresh, fil }: { refresh: () => Promise<void>; fil: boolean }) {
  const [visible, setVisible] = useState(false)
  return <div className="mx-auto w-full max-w-md">
    <h2 className="civily-section-underline civily-section-underline-light text-3xl font-bold tracking-tight text-primary-dark sm:text-4xl">{fil ? "Mag-sign in sa CIVILyst" : "Sign in to CIVILyst"}</h2>
    <p className="mt-2 text-sm text-muted">{fil ? "Gamitin ang inyong Personnel o Super Admin account." : "Use your assigned Personnel or Super Admin account."}</p>
      <DataForm route="login" button={fil ? "Mag-sign in" : "Sign in"} onSaved={refresh}>
        <label className="grid gap-1.5 text-sm font-semibold">{fil ? "Email ng account" : "Account email"}<input name="email" type="email" autoComplete="username" required className={control} /></label>
        <div>
          <label htmlFor="live-password" className="mb-1.5 block text-sm font-semibold">{fil ? "Password ng account" : "Password"}</label>
          <div className="flex items-center rounded-lg border border-line">
            <input id="live-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required className="min-h-11 min-w-0 flex-1 rounded-l-lg px-3 focus:outline-2 focus:outline-primary" />
            <button type="button" aria-controls="live-password" aria-label={visible ? (fil ? "Itago ang password" : "Hide password") : (fil ? "Ipakita ang password" : "Show password")} className="grid size-11 shrink-0 place-items-center rounded-md text-primary hover:bg-section focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setVisible(!visible)}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                {visible ? <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A11 11 0 0 1 12 5c5 0 8.4 4.5 9 7a11 11 0 0 1-2.7 3.9M6.5 6.5A13 13 0 0 0 3 12c.6 2.5 4 7 9 7 1.5 0 2.9-.4 4.1-1" /> : <><path d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="2.5" /></>}
              </svg>
            </button>
          </div>
        </div>
      </DataForm>
  </div>
}

function Workspace({ staff, refresh }: { staff: Staff; refresh: () => Promise<void> }) {
  const admin = staff.role === "super_admin"
  const [tab, setTab] = useState<View>(admin ? "dashboard" : "records")
  const [addingPetition, setAddingPetition] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [dashboardData, setDashboardData] = useState<{ records: Row[]; audit: Row[] }>()
  const [types, setTypes] = useState<Record<string, [string, string]>>({})
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [filters, setFilters] = useState(defaultRecordFilters)
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<Row | null>(null)
  const [loading, setLoading] = useState(false)
  function load(route: string) {
    setLoading(true)
    return apiRequest<Row[]>(route).then(setRows).catch(reason => setError(reason.message)).finally(() => setLoading(false))
  }
  useEffect(() => {
    apiRequest<Record<string, [string, string]>>("petition-types").then(setTypes).catch(reason => setError(reason.message))
  }, [])
  useEffect(() => {
    if (tab === "dashboard") {
      let cancelled = false
      Promise.all([apiRequest<Row[]>("petitions"), apiRequest<Row[]>("audit")]).then(([records, audit]) => {
        if (!cancelled) setDashboardData({ records, audit })
      }).catch(reason => { if (!cancelled) setError(reason.message) })
      return () => { cancelled = true }
    }
    const route = admin && (tab === "records" || tab === "monitoring") ? "petitions" : tab === "users" ? "accounts" : tab === "sms" || tab === "audit" ? tab : null
    if (!route) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    apiRequest<Row[]>(route)
      .then(data => { if (!cancelled) setRows(data) })
      .catch(reason => { if (!cancelled) setError(reason.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tab, admin])
  const visibleRows = rows.filter(row => Object.values(row).some(value => String(value ?? "").toLowerCase().includes(filter.trim().toLowerCase())))
  const records = rows.map(row => [row.cce_number, row.transaction_ref_no, row.document_owner, row.type_name, row.current_stage, row.updated_at, row.petitioner, row.filing_date].map(value => String(value ?? "")))
  function navigate(next: View) {
    setTab(next)
    setNotice("")
    setError("")
    setSelected(null)
    setAddingPetition(false)
    if (tab !== next) setRows([])
    setFilter("")
    setFilters(defaultRecordFilters)
  }
  function openRecord(reference: string) {
    const record = rows.find(row => row.transaction_ref_no === reference || row.cce_number === reference)
    if (record) {
      setSelected(record)
      setTab("record")
      window.scrollTo({ top: 0 })
    }
  }
  const intakeForm = <section className={surface + (admin ? " mt-4" : "")}>
      <h2 className="text-xl font-bold">Encode an accepted petition</h2>
      <DataForm route="petitions" button="Save petition" onSaved={async result => {
        setNotice("Petition saved. Tracking reference: " + result.reference + (result.smsQueued ? " · SMS notice queued." : ""))
        if (admin) { setAddingPetition(false); await load("petitions") }
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="CCE number" label="MCR-assigned CCE number" /><Field name="filing date" type="date" />
          <Field name="petitioner first name" /><Field name="petitioner last name" />
          <Field name="owner first name" /><Field name="owner last name" />
          <Field name="owner date of birth" type="date" /><Field name="relationship" label="Petitioner’s relationship to the owner" />
          <label className="grid gap-1.5 text-sm font-semibold">Petition type<select name="type" required className={control}><option value="">Choose a petition type</option>{Object.entries(types).map(([code, [label]]) => <option key={code} value={code}>{label}</option>)}</select></label>
          <Field name="box" label="Physical box number" />
          <Field name="contact number" label="Petitioner’s mobile number for SMS (optional)" type="tel" optional />
        </div>
      </DataForm>
    </section>
  return <InternalWorkspaceLayout live role={admin ? "admin" : "staff"} view={tab} userName={staff.full_name} onNavigate={navigate} onSignOut={async () => {
    try { await apiRequest("logout", {}); await refresh() }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to sign out.") }
  }}>
    {error && <p role="alert" className="mb-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-3 break-all rounded-lg border border-line bg-white p-3 font-semibold">{notice}</p>}
    {tab === "dashboard" && (dashboardData ? <Dashboard role="admin" userName={staff.full_name}
      live={{
        records: dashboardData.records.map(row => [row.cce_number, row.transaction_ref_no, row.document_owner, row.type_name, row.current_stage, row.updated_at].map(value => String(value ?? ""))),
        activities: dashboardData.audit.slice(0, 4).map(row => [String(row.action).replaceAll("_", " "), [row.actor, row.cce_number || row.target_email].filter(Boolean).join(" · "), String(row.recorded_at), "status", "bg-civic-soft text-civic"]),
      }}
      openRecord={reference => { navigate("records"); setFilters({ ...defaultRecordFilters, query: reference }) }}
      openAdvanced={() => navigate("records")}
      onSearch={query => { navigate("records"); setFilters({ ...defaultRecordFilters, query }) }}
    /> : !error && <p role="status">Loading dashboard…</p>)}
    {tab === "users" && admin && <section className={surface}>
      <h2 className="text-xl font-bold">Create a Personnel account</h2>
      <DataForm route="accounts" button="Create Personnel account" onSaved={async () => { setNotice("Personnel account created."); await load("accounts") }}>
        <Field name="name" label="Full name" /><Field name="email" type="email" /><Field name="password" type="password" minLength={12} />
      </DataForm>
    </section>}
    {tab === "record" && selected && <section className={surface + " mb-4"}>
      <button type="button" className="mb-3 text-sm font-semibold text-primary" onClick={() => navigate("records")}>← Back to petition records</button>
      <h2 className="text-xl font-bold">Record a milestone for {selected.cce_number}</h2>
      <DataForm key={selected.petition_id} route="milestones" button="Save milestone" onSaved={async result => { setNotice(result.smsQueued ? "Milestone recorded. SMS notice queued." : "Milestone recorded."); setSelected(null); setTab("records") }}>
        <input type="hidden" name="petition_id" value={selected.petition_id} />
        <label className="grid gap-1.5 text-sm font-semibold">Stage<select className={control} name="stage" required><option value="">Choose a stage</option>{["Posting Period","MCR Decision","Transmitted to PSA","Awaiting PSA Action","PSA Result","Endorsement for Annotation","Annotation / Completion","Action Required"].map(stage => <option key={stage}>{stage}</option>)}</select></label>
        <Field name="effective date" type="date" />
        <label className="grid gap-1.5 text-sm font-semibold">Public remark<textarea name="public remark" className={control} maxLength={2000} /></label>
        <label className="flex items-center gap-2 text-sm"><input name="current" type="checkbox" /> Make this the current stage</label>
      </DataForm>
    </section>}
    {tab === "sms" && <p className="mb-3 text-sm text-muted">Notices are saved to the queue. SMS delivery is pending gateway configuration.</p>}
    {(tab === "users" || tab === "sms") && <section className={surface + " mt-4"}>
      <label className="grid max-w-sm gap-1.5 text-sm font-semibold">Filter {tab}<input value={filter} onChange={event => setFilter(event.target.value)} className={control} /></label>
      {loading ? <p className="mt-4">Loading…</p> : <ul className="mt-4 divide-y divide-line">
        {visibleRows.map(row => <li key={String(row.petition_id ?? row.staff_id ?? row.sms_id ?? row.audit_event_id)} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <div className="min-w-0 break-words">
            {tab === "users" ? <><strong>{row.full_name}</strong><p>{row.email} · {row.role === "super_admin" ? "Super Admin" : "Personnel"}</p></>
              : <><strong>{row.cce_number} · {row.delivery_status}</strong><p>{row.transaction_ref_no} · {row.recipient} · {row.created_at}</p></>}
          </div>
        </li>)}
        {!visibleRows.length && <li className="py-3 text-muted">No matching records.</li>}
      </ul>}
    </section>}
    {loading && (tab === "records" || tab === "monitoring" || tab === "audit") && <p role="status">Loading…</p>}
    {tab === "records" && !admin && <><h1 className="mb-4 text-2xl font-bold text-primary-dark">Petition Records</h1>{intakeForm}</>}
    {!loading && tab === "records" && admin && <RecordsWorkspace records={records} filters={filters} setFilters={setFilters} onEncode={() => setAddingPetition(current => !current)} intakeForm={addingPetition ? intakeForm : undefined} openRecord={record => openRecord(record[1])} />}
    {!loading && tab === "monitoring" && <StatusMonitoring live records={records} openRecord={openRecord} />}
    {!loading && tab === "audit" && <AuditLog activity={rows.map(row => {
      const action = String(row.action).replaceAll("_", " ")
      const moduleName = row.target_email ? "Personnel Accounts" : row.cce_number ? "Petition Records" : "Staff Portal"
      return [String(row.recorded_at), String(row.actor), row.actor_role === "super_admin" ? "Super Admin" : "Personnel", moduleName, action, String(row.cce_number || row.target_email || "—"), "", "Successful", String(row.recorded_at).slice(0, 10), String(row.audit_event_id), String(row.actor_email ?? "")]
    })} />}
    {tab === "collections" && <Collections />}
    {(tab === "public" || tab === "samples") && <section className={surface}><h1 className="text-2xl font-bold">{tab === "public" ? "Services & Requirements" : "Document Samples"}</h1><a className="mt-3 inline-block font-semibold text-primary underline" href="/?view=services">Browse petition services and requirements</a></section>}
    {tab === "account" && <section className={surface}><h1 className="text-2xl font-bold">My Account</h1><p className="mt-3">{staff.full_name}</p><p>{staff.email}</p></section>}
    {(tab === "settings" || tab === "backup") && <section className={surface}><h1 className="text-2xl font-bold">{tab === "settings" ? "System Settings" : "Backup & Recovery"}</h1><p className="mt-3 text-muted">This module is unavailable in the local workspace.</p></section>}
  </InternalWorkspaceLayout>
}

export default function StaffPortal() {
  const surfaceRef = useScrollLighting()
  const helpPage = window.location.pathname.replace(/\/$/, "") === "/portal/help"
  const [language, setLanguage] = useState<"en" | "fil">(() => localStorage.getItem("civily-public-language") === "fil" ? "fil" : "en")
  const [menuOpen, setMenuOpen] = useState(false)
  const fil = language === "fil"
  useEffect(() => { localStorage.setItem("civily-public-language", language) }, [language])
  const [session, setSession] = useState<Session>()
  const [error, setError] = useState("")
  async function refresh() {
    setSession(await apiRequest<Session>("session"))
    setError("")
  }
  function checkSession() { refresh().catch(reason => setError(reason.message)) }
  useEffect(() => { if (!helpPage) checkSession() }, [helpPage])
  if (!helpPage && session?.staff) return <Workspace key={session.staff.email} staff={session.staff} refresh={refresh} />
  return <div ref={surfaceRef} className="civily-page civily-admin-background flex min-h-screen flex-col px-4 py-5 sm:px-8 sm:py-8">
    <header className="civily-header-edge relative z-40 mx-auto mb-6 w-full max-w-7xl self-stretch sm:mb-8">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 rounded-[15px] bg-white px-4 py-3 sm:px-6 sm:py-4">
        <WorkspaceBrand />
        <div className="relative z-20" onKeyDown={event => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false)
            event.currentTarget.querySelector("button")?.focus()
          }
        }}>
          <button type="button" aria-label={fil ? "Menu ng workspace" : "Workspace menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)} className="grid size-10 place-items-center rounded-lg border border-line bg-section text-primary hover:bg-white focus-visible:outline-2 focus-visible:outline-primary">
            <span aria-hidden="true" className="grid gap-[3px]"><span className="h-0.5 w-4 rounded bg-current" /><span className="h-0.5 w-4 rounded bg-current" /><span className="h-0.5 w-4 rounded bg-current" /></span>
          </button>
          {menuOpen && <nav lang={language} aria-label={fil ? "Mga opsiyon" : "Workspace options"} className="absolute right-0 top-full mt-2 grid w-64 gap-1 rounded-xl border border-line bg-white p-1.5 shadow-lg">
            <a href="/portal/help" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary-dark hover:bg-section"><Icon name="help" className="size-4" /> {fil ? "Tulong sa workspace" : "Workspace help"}</a>
            <a href="/?view=track" lang="en" className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-primary-dark hover:bg-section"><Icon name="timeline" className="size-4" /> Petition Tracking</a>
            <LanguageMenu language={language} setLanguage={setLanguage} />
          </nav>}
        </div>
      </div>
    </header>
    {helpPage ? <WorkspaceHelp fil={fil} /> : <WorkspaceLanding fil={fil}>{session ? <SignIn refresh={refresh} fil={fil} /> : error
        ? <div><p role="alert">{error}</p><button className={action + " mt-3"} onClick={checkSession}>Retry connection</button></div>
        : <div role="status" className="flex items-center gap-3 font-semibold text-primary-dark">
            <span aria-hidden="true" className="size-5 rounded-full border-2 border-line border-t-primary motion-safe:animate-spin" />
            Checking your session…
          </div>}</WorkspaceLanding>}
  </div>
}



