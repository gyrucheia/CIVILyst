import { apiRequest, type TrackingResult } from "./api"
import serviceCounterPhoto from "./assets/daet-service-counter.png"
import visitorQueuePhoto from "./assets/daet-visitor-queue.png"
import waitingAreaPhoto from "./assets/daet-waiting-area.png"
import maogmangDaet from "./assets/maogmang-daet.png"
import daetSeal from "./assets/daet-seal.png"
import psaLogo from "./assets/psa-logo.png"
import { createContext, FormEvent, ReactNode, useContext, useEffect, useRef, useState } from "react"

type PublicLanguage = "en" | "fil"
const PublicLanguageContext = createContext<PublicLanguage>("en")
const filipino: Record<string, string> = {
  "Transaction reference number": "Reference number ng transaksyon",
  "Use the transaction reference issued by MCR Daet after acceptance.": "Gamitin ang reference number na ibinigay ng MCR Daet matapos tanggapin ang petisyon.",
  "Checking…": "Sinusuri…",
  "No petition matched that transaction reference.": "Walang petisyong tumugma sa reference number na iyon.",
  "Home": "Panimula",
  "Services & Requirements": "Mga Serbisyo at Kailangan",
  "Fees": "Mga Bayarin",
  "Help": "Tulong",
  "Track Your Petition": "Tingnan ang Katayuan ng Petisyon",
  "CCE number": "Numero ng CCE",
  "Track Petition": "Tingnan ang Petisyon",
  "Your CCE number is provided after your petition has been officially accepted by MCR Daet.": "Ibibigay ng MCR Daet ang iyong numero ng CCE kapag opisyal nang tinanggap ang iyong petisyon.",
  "Enter your CCE number in the format CCE-000128-2026.": "Ilagay ang numero ng CCE sa format na CCE-000128-2026.",
  "No demo petition was found for that CCE number.": "Walang halimbawang petisyon para sa numerong ito.",
  "Track a Petition": "Tingnan ang Katayuan ng Petisyon",
  "View the latest recorded status.": "Tingnan ang pinakahuling naitalang katayuan.",
  "Prepare Requirements": "Ihanda ang mga Kailangan",
  "See what documents you need.": "Tingnan kung anong mga dokumento ang kailangan.",
  "Check Fees": "Tingnan ang mga Bayarin",
  "Review applicable petition and service fees.": "Alamin ang mga bayarin sa petisyon at serbisyo.",
  "Services and requirements": "Mga serbisyo at kailangang dokumento",
  "View all services": "Tingnan ang lahat ng serbisyo",
  "Fees and exemptions": "Mga bayarin at eksemsiyon",
  "See filing fees and ask MCR Daet about exemptions.": "Alamin ang mga bayarin at magtanong sa MCR Daet tungkol sa mga eksemsiyon.",
  "View full fee schedule": "Tingnan ang buong talaan ng bayarin",
  "About CIVILyst": "Tungkol sa CIVILyst",
  "The Municipal Civil Registrar’s Office of Daet receives and reviews civil registry correction petitions. CIVILyst helps you prepare for your visit and check the latest recorded status after your petition is accepted.": "Tumatanggap at sumusuri ang Municipal Civil Registrar’s Office ng Daet ng mga petisyon para sa pagwawasto ng tala sa civil registry. Sa CIVILyst, makapaghahanda ka sa pagbisita at makikita ang pinakahuling naitalang katayuan kapag tinanggap na ang iyong petisyon.",
  "Visit MCR Daet": "Bumisita sa MCR Daet",
  "Office hours and help": "Oras ng opisina at tulong",
  "Visiting the Municipal Civil Registrar’s Office of Daet": "Pagbisita sa Municipal Civil Registrar’s Office ng Daet",
  "Correction of Clerical or Typographical Error": "Pagwawasto ng Clerical o Typographical Error",
  "Change of First Name": "Pagpapalit ng Unang Pangalan",
  "Correction of Date of Birth": "Pagwawasto ng Petsa ng Kapanganakan",
  "Correction of Sex": "Pagwawasto ng Nakatala na Kasarian",
  "Fix an eligible spelling, typing, or clerical mistake in a civil registry record.": "Iwasto ang maaaring itamang mali sa baybay, pag-type, o pagtatala sa civil registry.",
  "Apply to change a first name or nickname on record.": "Maghain ng petisyon para palitan ang nakatalang unang pangalan o palayaw.",
  "Fix an eligible error in the recorded day or month of birth.": "Iwasto ang maaaring itamang mali sa nakatalang araw o buwan ng kapanganakan.",
  "Fix an eligible clerical error in the sex entry on a birth record.": "Iwasto ang maaaring itamang clerical error sa pagkakatala ng kasarian sa birth record.",
  "Petition Fee": "Bayarin sa Petisyon",
  "View Service": "Tingnan ang Serbisyo",
  "Quick Links": "Mga Madalas Hanapin",
  "Staff Services": "Serbisyo para sa Kawani",
  "Legal / Information": "Legal at Impormasyon",
  "Data Privacy Notice": "Abiso sa Privacy ng Datos",
  "Accessibility": "Accessibility",
  "Choose a service to see its requirements and filing fee.": "Pumili ng serbisyo upang makita ang mga kailangang dokumento at bayarin.",
  "Check your petition’s status with your transaction reference.": "Gamitin ang reference number ng transaksyon upang makita ang katayuan ng petisyon."
}

function usePublicCopy() {
  const language = useContext(PublicLanguageContext)
  return (value: string) => language === "fil" ? filipino[value] ?? value : value
}

type Page = "home" | "timeline" | "track" | "services" | "fees" | "help"
type Tab = "requirements" | "samples" | "information"
type IconName = "school" | "medical" | "download" | "check" | "checklist" | "chevron" | "clock" | "document" | "fee" | "help" | "info" | "menu" | "pin" | "print" | "search" | "shield" | "timeline" | "x"

type Service = {
  id: string
  title: string
  law: string
  fee: string
  description: string
}

const services: Service[] = [
  {
    id: "clerical",
    title: "Correction of Clerical or Typographical Error",
    law: "RA 9048",
    fee: "₱1,000",
    description:
      "Fix an eligible spelling, typing, or clerical mistake in a civil registry record.",
  },
  {
    id: "first-name",
    title: "Change of First Name",
    law: "RA 9048",
    fee: "₱3,000",
    description:
      "Apply to change a first name or nickname on record.",
  },
  {
    id: "birth-date",
    title: "Correction of Date of Birth",
    law: "RA 10172",
    fee: "₱3,000",
    description:
      "Fix an eligible error in the recorded day or month of birth.",
  },
  {
    id: "gender",
    title: "Correction of Sex",
    law: "RA 10172",
    fee: "₱3,000",
    description:
      "Fix an eligible clerical error in the sex entry on a birth record.",
  },
]

type DocumentRequirement = {
  title: string
  detail: string
  preparation: string
  icon: IconName
  sampleName?: RegExp
}

const swornPetition: DocumentRequirement = {
  title: "Sworn petition",
  detail: "Ask MCR Daet for the petition form for your correction. The petition must be signed under oath.",
  preparation: "Review names, dates, and the requested change before signing. Ask MCR Daet who must sign and where to take the oath.",
  icon: "checklist",
}

const supportingRecords: DocumentRequirement = {
  title: "At least two supporting records",
  detail: "Prepare at least two public or private records that support the entry you want corrected or the change you are requesting.",
  preparation: "Choose records that show the correct entry. If using a barangay certification, ask MCR Daet whether it is accepted for your case and whose signature is required.",
  icon: "checklist",
}

const certifiedBirthRecord: DocumentRequirement = {
  title: "Certified birth record",
  detail: "Prepare a certified copy of the birth certificate or of the registry page showing the entry you want corrected.",
  preparation: "Check that the entry you want to correct is legible on the copy. Ask MCR Daet how to obtain the right certified copy if your current copy is unclear.",
  icon: "document",
  sampleName: /^Birth Certificate$/,
}

const earlyRecord: DocumentRequirement = {
  title: "One early supporting record",
  detail: "Prepare one of these: your earliest school record, a medical record, or a baptismal certificate or equivalent religious record.",
  preparation: "Ask the school, clinic, or religious institution that holds the record for a copy and check that it shows the relevant entry.",
  icon: "school",
  sampleName: /Form 137|School Record/,
}

const publication: DocumentRequirement = {
  title: "Newspaper publication",
  detail: "The petition must be published once a week for two consecutive weeks in a newspaper of general circulation. Ask MCR Daet how to arrange publication and submit proof.",
  preparation: "Ask MCR Daet when to start publication and what proof to request from the publisher. Keep the proof for filing.",
  icon: "document",
}

const requirementsByService: Record<string, DocumentRequirement[]> = {
  clerical: [
    swornPetition,
    {
      title: "Certified copy of the record with the error",
      detail: "Prepare a certified copy of the civil registry certificate or registry page showing the error.",
      preparation: "Bring a legible certified copy and note the exact line with the error so staff can compare it with your supporting records.",
      icon: "document",
      sampleName: /^PSA Certificate with Entry to be Corrected$/,
    },
    supportingRecords,
  ],
  "first-name": [
    swornPetition,
    {
      title: "Certified copy of the record showing your current name",
      detail: "Prepare a certified copy of the certificate or registry page showing the first name or nickname you want to change.",
      preparation: "Check that the current name is legible and matches the entry you identify in the petition.",
      icon: "document",
      sampleName: /^PSA Certificate$/,
    },
    supportingRecords,
    {
      title: "Law enforcement certification",
      detail: "Prepare a certification from the appropriate law enforcement agency about pending cases or criminal records. Ask MCR Daet which clearance to obtain.",
      preparation: "Before requesting the document, confirm the issuing agency and which clearance MCR Daet will accept for your case.",
      icon: "shield",
    },
    publication,
  ],
  "birth-date": [
    swornPetition,
    certifiedBirthRecord,
    supportingRecords,
    earlyRecord,
    publication,
  ],
  gender: [
    swornPetition,
    certifiedBirthRecord,
    supportingRecords,
    earlyRecord,
    {
      title: "Medical certification from an accredited government physician",
      detail: "Ask MCR Daet which accredited government physician can issue the certification required for a correction of the recorded sex entry.",
      preparation: "Confirm the physician’s accreditation and ask MCR Daet what information and signature the certification should include.",
      icon: "medical",
      sampleName: /^Medical Certification from Government Physician/,
    },
    publication,
  ],
}

const checklistFilingNote = "Based on national Philippine Statistics Authority (PSA) guidance. Confirm the documents, copy counts, and any additional requirements for your case with MCR Daet before filing."

const samplesByService: Record<string, string[][]> = {
  "birth-date": [
    [
      "Birth Certificate",
      "Civil registry document referenced in this service.",
    ],
    [
      "Form 137 / Earliest School Record",
      "Example of the earliest available school record.",
    ],
    ["Medical Record", "General reference for a supporting medical record."],
    ["Baptismal Certificate", "Document issued by a religious authority."],
    ["Voter's Certification", "Reference for an additional supporting record."],
    ["PhilHealth MDR", "Sample Member Data Record reference."],
    ["Employer's Clearance", "Example clearance for an employed petitioner."],
    ["NBI Clearance", "Visual reference only."],
    ["PNP Clearance", "Visual reference only."],
  ],
  gender: [
    [
      "Birth Certificate",
      "Civil registry document referenced in this service.",
    ],
    ["Form 137 / School Record", "Example of a supporting school record."],
    ["Medical Record", "General supporting medical record reference."],
    ["Baptismal Certificate", "Document issued by a religious authority."],
    ["Voter's Certification", "Reference for an additional supporting record."],
    ["PhilHealth MDR", "Sample Member Data Record reference."],
    ["Employer's Clearance", "Example clearance for an employed petitioner."],
    [
      "Medical Certification from Government Physician / RHU",
      "Sample reference from an accredited government physician or RHU.",
    ],
  ],
  "first-name": [
    [
      "PSA Certificate",
      "Civil registry certificate referenced in the petition.",
    ],
    ["Baptismal Certificate", "Document issued by a religious authority."],
    ["Voter's Certification", "Supporting public record reference."],
    ["Employment Record", "Example employment information record."],
    ["GSIS Record", "Sample reference only."],
    ["SSS / PhilHealth MDR", "Sample membership record reference."],
    ["Medical Record", "General supporting medical record."],
    ["School Record / Form 137 / Transcript", "Example educational record."],
    ["Driver's License / TIN / Postal ID", "Identification reference only."],
    ["Civil Registry Record", "Related civil registry record reference."],
    [
      "Land Title / Certificate of Land Transfer",
      "Property record reference only.",
    ],
    ["Passport", "Travel document reference only."],
    ["Bank Passbook", "Financial record reference only."],
    ["Employer's Clearance", "Example clearance for an employed petitioner."],
    ["NBI Clearance", "Visual reference only."],
    ["PNP Clearance", "Visual reference only."],
  ],
  clerical: [
    [
      "PSA Certificate with Entry to be Corrected",
      "Civil registry certificate containing the relevant entry.",
    ],
    ["Baptismal Certificate", "Document issued by a religious authority."],
    ["Voter's Certification", "Supporting public record reference."],
    ["Employment Record", "Example employment information record."],
    ["GSIS Record", "Sample reference only."],
    ["SSS / PhilHealth MDR", "Sample membership record reference."],
    ["Medical Record", "General supporting medical record."],
    ["Business Record", "Example business-related supporting record."],
    ["School Record / Form 137 / Transcript", "Example educational record."],
    ["Driver's License / TIN / Postal ID", "Identification reference only."],
    ["Insurance Record", "Example supporting insurance record."],
    [
      "Civil Registry Records of Ascendants or Descendants",
      "Related family civil registry record.",
    ],
    [
      "Land Title / Certificate of Land Transfer",
      "Property record reference only.",
    ],
    ["Passport", "Travel document reference only."],
    ["Bank Passbook", "Financial record reference only."],
  ],
}

const fees = [
  ["Correction of Clerical Error", "RA 9048", "₱1,000.00"],
  ["Change of First Name", "RA 9048", "₱3,000.00"],
  ["Correction of Sex", "RA 10172", "₱3,000.00"],
  ["Correction of Date of Birth", "RA 10172", "₱3,000.00"],
  ["Change of First Name + Correction of Sex", "RA 10172", "₱3,000.00"],
  [
    "Change of First Name + Correction of Date of Birth",
    "RA 10172",
    "₱3,000.00",
  ],
  ["Correction of Sex + Date of Birth", "RA 10172", "₱3,000.00"],
  ["Migrant Petition Service Fee — Clerical Error", "Service Fee", "₱500.00"],
  ["Migrant Petition Service Fee — CFN / RA 10172", "Service Fee", "₱1,000.00"],
  ["Issuance of Certificate of Finality", "RA 9048 / RA 10172", "₱220.00"],
]

export function Icon({
  name,
  className = "size-5",
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, ReactNode> = {
    check: <path d="m5 12 4 4L19 6" />,
    checklist: (
      <>
        <path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3" />
        <path d="M9 3h6v4H9zM8 12l1.5 1.5L12 11M14 12h3M8 17l1.5 1.5L12 16M14 17h3" />
      </>
    ),
    school: <path d="m2 9 10-5 10 5-10 5-10-5ZM6 11v5c4 3 8 3 12 0v-5m4-2v6" />,
    medical: <path d="M4 7h16v13H4zM9 7V4h6v3m-3 3v7m-3-3.5h6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h4M9 13h6M9 17h4" />
      </>
    ),
    fee: (
      <>
        <path d="M5 4h14v17l-3-2-4 2-4-2-3 2z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.3 2.3 0 1 1 3 2.2c-.8.3-.8 1-.8 1.8M12 17h.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    download: <path d="M12 4v11m-4-4 4 4 4-4M5 15v4h14v-4" />,
    print: (
      <>
        <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <path d="M7 14h10v7H7z" />
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
    timeline: (
      <>
        <circle cx="6" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="6" cy="19" r="2" />
        <path d="M8 5h10M8 12h10M8 19h10" />
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
  current,
  expanded,
  children,
  className = "",
  type = "button",
  onClick,
  ariaLabel,
}: {
  current?: boolean
  expanded?: boolean
  children: ReactNode
  className?: string
  type?: "button" | "submit"
  onClick?: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={current ? "page" : undefined}
      aria-expanded={expanded}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
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

function AgencyLogos() {
  return (
    <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <img src={daetSeal} alt="Municipality of Daet seal" width={44} height={44}
        className="size-8 rounded-full bg-white object-contain ring-1 ring-line sm:size-11" />
      <img src={psaLogo} alt="Philippine Statistics Authority logo" width={44} height={44}
        className="size-8 rounded-full bg-white object-contain p-0.5 ring-1 ring-line sm:size-11" />
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white p-1 ring-1 ring-line sm:size-11 sm:p-1.5">
        <img src={maogmangDaet} alt="Maogmang Daet" width={32} height={16} className="h-auto w-full object-contain" />
      </span>
    </span>
  )
}

export function LanguageMenu({ language, setLanguage }: { language: PublicLanguage; setLanguage: (language: PublicLanguage) => void }) {
  return (
  <details className="border-t border-line pt-1">
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-sm font-semibold text-primary-dark hover:bg-section focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
      {language === "fil" ? "Palitan ang wika" : "Change language"}
      <Icon name="chevron" className="size-4" />
    </summary>
    <div className="mx-2 mb-2 grid grid-cols-2 gap-1 rounded-lg bg-section p-1">
      {(["en", "fil"] as const).map(option => (
        <button key={option} type="button" lang={option} aria-pressed={language === option} onClick={() => setLanguage(option)} className={`min-h-10 rounded-md px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary ${language === option ? "bg-primary text-white" : "text-primary-dark hover:bg-white"}`}>
          {option === "en" ? "English" : "Filipino"}
        </button>
      ))}
    </div>
  </details>
  )
}

function Header({
  page,
  navigate,
  language,
  setLanguage,
  openStaffServices,
}: {
  openStaffServices: () => void
  language: PublicLanguage
  setLanguage: (language: PublicLanguage) => void
  page: Page
  navigate: (page: Page) => void
}) {
  const t = usePublicCopy()
  const [open, setOpen] = useState(false)
  const links: [Page, string][] = [
    ["home", "Home"],
    ["services", "Services & Requirements"],
    ["fees", "Fees"],
  ]
  const go = (target: Page) => {
    navigate(target)
    if (page !== "timeline") setOpen(false)
  }
  useEffect(() => { setOpen(false) }, [page])
  const isTimeline = page === "timeline"
  const branding = (
    <>
      <AgencyLogos />
      <span className="min-w-0">
        <strong className="block text-xl leading-none font-bold tracking-[-0.04em] text-primary-dark sm:text-2xl">CIVILyst</strong>
        <span className="mt-1.5 block text-xs leading-snug font-medium text-muted">
          Municipal Civil Registrar’s Office <span className="hidden sm:inline">· Daet</span>
        </span>
      </span>
    </>
  )
  return (
    <header onKeyDown={event => {
      if (event.key === "Escape" && open) {
        setOpen(false)
        event.currentTarget.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus()
      }
    }} className="sticky top-0 z-40 mx-auto w-full max-w-7xl px-3 pt-2 sm:px-8 sm:pt-3">
      <div className="civily-header-edge">
        <div className="overflow-hidden rounded-[15px] bg-white">
          <div className="flex items-center justify-between gap-4 px-3.5 py-3 sm:px-5">
            {isTimeline ? (
              <>
                <div className="flex min-w-0 items-center gap-3">{branding}</div>
                  <Button
                    onClick={() => setOpen(!open)}
                    expanded={open}
                    ariaLabel={language === "fil" ? (open ? "Isara ang menu" : "Buksan ang menu") : (open ? "Close menu" : "Open menu")}
                    className="size-10 shrink-0 border border-line bg-section text-primary hover:bg-white"
                  >
                    <Icon name={open ? "x" : "menu"} />
                  </Button>
              </>
            ) : (
              <>
                <Button onClick={() => go("home")} className="min-w-0 justify-start gap-3 text-left">
                  {branding}
                </Button>
                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                  <nav className="hidden shrink-0 items-center gap-1 xl:flex" aria-label="Public navigation">
                    {links.map(([key, label]) => (
                      <Button
                        key={key}
                        onClick={() => go(key)}
                        current={page === key}
                        className={`min-h-10 whitespace-nowrap px-3.5 text-sm tracking-[0.01em] ${page === key ? "bg-[#ecddcb] font-bold! text-primary-dark ring-1 ring-inset ring-[#cfb398]" : "font-medium! text-primary hover:bg-section hover:text-primary-dark"}`}
                      >
                        <span lang="en">{label}</span>
                      </Button>
                    ))}
                  </nav>
                  <Button
                    onClick={() => setOpen(!open)}
                    expanded={open}
                    ariaLabel={language === "fil" ? (open ? "Isara ang menu" : "Buksan ang menu") : (open ? "Close menu" : "Open menu")}
                    className="size-10 shrink-0 border border-line bg-section text-primary hover:bg-white"
                  >
                    <Icon name={open ? "x" : "menu"} />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {open && (
        <div lang={language} className="absolute right-3 top-full mt-2 grid max-h-[70dvh] w-[min(16rem,calc(100%-1.5rem))] gap-1 overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-lg sm:right-8">
            {!isTimeline && <nav aria-label="Public navigation" className="grid gap-1 border-b border-line pb-2 xl:hidden">
              {links.map(([key, label]) => (
                <Button
                  key={key}
                  onClick={() => go(key)}
                  current={page === key}
                  className={`min-h-11 justify-start px-3 text-sm ${page === key ? "bg-[#ecddcb] font-bold! text-primary-dark ring-1 ring-inset ring-[#cfb398]" : "font-medium! text-primary hover:bg-section hover:text-primary-dark"}`}
                >
                  <span lang="en">{label}</span>
                </Button>
              ))}
            </nav>}
          <Button onClick={() => go("help")} current={page === "help"} className="min-h-11 justify-start px-3 text-sm text-primary-dark hover:bg-section">
            <Icon name="help" className="size-4" /> {t("Help")}
          </Button>
          <a href="/portal" onClick={event => {
            if (!isTimeline || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            openStaffServices()
          }} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary-dark hover:bg-section focus-visible:outline-2 focus-visible:outline-primary">
            <Icon name="shield" className="size-4" /> {t("Staff Services")}
          </a>
          <LanguageMenu language={language} setLanguage={setLanguage} />
        </div>
      )}

    </header>
  )
}

function Notice({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "amber"
}) {
  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 text-sm leading-relaxed ${
        tone === "amber"
          ? "border-warning-line bg-warning"
          : "border-primary-light/25 bg-soft/55"
      }`}
    >
      <Icon
        name="info"
        className={`mt-0.5 size-5 shrink-0 ${
          tone === "amber" ? "text-warning-text" : "text-primary"
        }`}
      />
      <div>{children}</div>
    </div>
  )
}

function Tracker({
  onTrack,
  elevated = false,
}: {
  onTrack: (result: TrackingResult) => void
  elevated?: boolean
}) {
  const t = usePublicCopy()
  const [reference, setReference] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setBusy(true)
    try {
      const result = await apiRequest<TrackingResult>("track", { reference })
      onTrack(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to check this petition.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={`min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-7 ${elevated ? "shadow-[0_20px_45px_-25px_#21140e]" : "shadow-panel"}`}>
      <div className="mb-5 flex min-h-10 items-center gap-3 border-b border-line pb-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-section text-primary">
          <Icon name="timeline" className="size-5" />
        </span>
        <Heading level={2} className="text-xl font-bold leading-tight text-primary-dark">
          {t("Track Your Petition")}
        </Heading>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          {t("Transaction reference number")}
          <span className="flex h-12 min-w-0 items-center gap-2 rounded-lg border border-line bg-white px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="CCE-123456789012-2026"
              required maxLength={40} autoComplete="off"
              className="h-full min-w-0 flex-1 bg-white text-base font-normal uppercase text-ink outline-none placeholder:text-muted"
            />
            <Icon name="document" className="size-4 shrink-0 text-primary" />
          </span>
        </label>
        {error && <p role="alert" className="text-sm text-error">{t(error)}</p>}
        <button
          type="submit" disabled={busy}
          className="h-12 w-full rounded-lg bg-primary px-4 text-sm text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {t(busy ? "Checking…" : "Track Petition")}
        </button>
      </form>
      <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-muted">{t("Use the transaction reference issued by MCR Daet after acceptance.")}</p>
    </div>
  )
}

function Home({
  navigate,
  openService,
  onTrack,
}: {
  navigate: (page: Page) => void
  openService: (service: Service) => void
  onTrack: (result: TrackingResult) => void
}) {
  const t = usePublicCopy()
  const quickActions: [IconName, string, string, Page][] = [
    ["timeline", "Track a Petition", "View the latest recorded status.", "track"],
    ["checklist", "Prepare Requirements", "See what documents you need.", "services"],
    ["fee", "Check Fees", "Review applicable petition and service fees.", "fees"],
  ]
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="civily-hero relative isolate grid overflow-hidden rounded-[1.75rem] border border-primary-dark/15 bg-primary-dark p-6 shadow-[0_24px_55px_-32px_#422b20] sm:p-9 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-14 lg:p-12">
          <div className="pb-6 pt-1 sm:pb-8 lg:pb-0">
            <p className="mb-4 text-sm font-semibold text-[#f3ddc7]">Municipal Civil Registrar’s Office · Daet</p>
            <Heading
              level={1}
              className="max-w-lg text-balance text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-[#fff7ec] sm:text-5xl xl:text-6xl"
            >
              <span lang="en">Track your petition for correction of a clerical error</span>
            </Heading>
            <p className="mt-5 max-w-md border-l border-[#e9be8c]/55 pl-4 text-pretty text-base leading-relaxed text-[#f0dcc9] sm:text-lg">
              {t("Check your petition’s status with your CCE number.")}
            </p>
          </div>
          <div id="petition-tracking" className="civily-tracking-frame scroll-mt-28">
            <Tracker onTrack={onTrack} elevated />
          </div>
        </div>
      </section>
      <section aria-label="Quick links" className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-5 sm:px-8 sm:pt-6">
        <div className="civily-header-edge">
          <div className="grid gap-px overflow-hidden rounded-[15px] bg-line md:grid-cols-3">
            {quickActions.map(([icon, title, description, page]) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(page)}
                className="group grid min-w-0 cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 bg-white p-4 text-left hover:bg-section focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:p-5"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary text-white">
                  <Icon name={icon} className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm font-semibold text-primary-dark">{t(title)}</strong>
                  <span className="mt-1 block text-sm leading-snug text-muted">{t(description)}</span>
                </span>
                <span aria-hidden="true" className="grid size-7 place-items-center text-primary transition-transform motion-safe:group-hover:translate-x-0.5">
                  <Icon name="chevron" className="size-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section aria-labelledby="home-services-title" className="mx-auto max-w-[75rem] px-5 py-8 sm:px-8 sm:py-10">
        <div className="civily-services-surface rounded-2xl p-3.5 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[#efd4b2]/25 pb-2 text-[#fff7ec] sm:mb-4">
            <h2 id="home-services-title" className="civily-destination-label text-xl font-semibold leading-tight tracking-tight sm:text-[1.6rem]">
              {t("Services and requirements")}
            </h2>
            <Button onClick={() => navigate("services")} className="min-h-10 gap-1.5 px-1 text-sm font-medium text-[#f7dfc6] hover:text-white focus-visible:outline-white">
              {t("View all services")} <Icon name="chevron" className="size-3.5" />
            </Button>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onClick={() => openService(service)} />
            ))}
          </div>
        </div>
      </section>
      <div className="civily-home-lower relative isolate mx-auto w-full max-w-7xl px-5 pb-7 sm:px-8 sm:pb-9">
        <section aria-labelledby="home-fees-title" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 civily-fees-banner relative isolate px-5 py-4 sm:px-7 lg:mx-3 lg:px-9">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-panel">
              <Icon name="fee" className="size-5" />
            </span>
            <div>
              <h2 id="home-fees-title" className="civily-layered-label mb-1.5 w-fit bg-primary px-3 py-1 text-base font-bold text-white sm:text-lg">{t("Fees and exemptions")}</h2>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{t("See filing fees and ask MCR Daet about exemptions.")}</p>
            </div>
          </div>
          <Button onClick={() => navigate("fees")} className="min-h-11 gap-1.5 bg-primary px-3.5 text-sm text-white hover:bg-primary-dark">
            {t("View full fee schedule")} <Icon name="chevron" className="size-4" />
          </Button>
        </section>
        <section aria-labelledby="home-about-title" className="relative isolate mt-7 grid gap-x-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-5">
          <div aria-hidden="true" className="absolute inset-x-0 top-10 bottom-0 -z-10 hidden rounded-2xl bg-white shadow-panel lg:block" />
          <div className="rounded-xl bg-white p-5 sm:p-7 lg:self-center lg:bg-transparent lg:pt-14">
            <h2 id="home-about-title" className="civily-layered-label w-fit bg-primary px-3 py-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">{t("About CIVILyst")}</h2>
            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink sm:text-base">{t("The Municipal Civil Registrar’s Office of Daet receives and reviews civil registry correction petitions. CIVILyst helps you prepare for your visit and check the latest recorded status after your petition is accepted.")}</p>
            <div className="mt-4 border-t border-line pt-3">
              <h3 className="flex items-center gap-2 font-bold text-primary-dark"><Icon name="pin" className="size-4 shrink-0 text-primary" /> {t("Visit MCR Daet")}</h3>
              <p className="mt-1 text-sm text-muted">Municipal Hall, Daet, Camarines Norte</p>
              <Button onClick={() => navigate("help")} className="mt-2 min-h-11 gap-1.5 text-sm text-primary hover:underline">
                {t("Office hours and help")} <Icon name="chevron" className="size-4" />
              </Button>
            </div>
          </div>
          <figure className="mt-4 min-w-0 lg:mt-0 lg:pb-5">
            <div className="grid aspect-[16/10] grid-cols-[1.65fr_1fr] grid-rows-2 gap-1 overflow-hidden rounded-xl border border-[#fff3df] bg-white p-1 shadow-panel sm:gap-1.5 sm:p-1.5">
              <img src={waitingAreaPhoto} alt="Visitors seated in the municipal waiting area" width={1536} height={2048} loading="lazy" decoding="async" className="row-span-2 h-full min-h-0 w-full rounded-l-lg object-cover object-[center_63%]" />
              <img src={serviceCounterPhoto} alt="Visitors preparing paperwork near the service counter" width={1536} height={2048} loading="lazy" decoding="async" className="h-full min-h-0 w-full rounded-tr-lg object-cover object-[center_57%]" />
              <img src={visitorQueuePhoto} alt="Visitors lining up at the municipal office" width={1536} height={2048} loading="lazy" decoding="async" className="h-full min-h-0 w-full rounded-br-lg object-cover object-[center_64%]" />
            </div>
            <figcaption className="mt-2 border-l-2 border-[#c8a27d] py-1 pl-3 text-sm leading-snug text-muted">{t("Visiting the Municipal Civil Registrar’s Office of Daet")}</figcaption>
          </figure>
        </section>
      </div>
    </>
  )
}

function ServiceCard({
  service,
  onClick,
}: {
  service: Service
  onClick: () => void
}) {
  const t = usePublicCopy()
  const icons: Record<string, IconName> = {
    clerical: "document",
    "first-name": "checklist",
    "birth-date": "clock",
    gender: "shield",
  }
  return (
    <div className="civily-header-edge h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-[15px] bg-white">
        <div className="civily-card-emboss flex-1 px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span aria-hidden="true" className="civily-service-icon grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-white">
              <Icon name={icons[service.id] ?? "document"} className="size-4" />
            </span>
            <span className="civily-service-law whitespace-nowrap text-right text-xs font-medium tracking-wide text-muted">{service.law}</span>
          </div>
          <Heading level={3} className="text-lg font-semibold leading-[1.25] tracking-tight text-primary-dark sm:text-xl">
            {t(service.title)}
          </Heading>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">{t(service.description)}</p>
        </div>
        <div className="civily-service-fee flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#e7d7c5] bg-[linear-gradient(to_bottom_left,#fff9ef,#f5e8d7_52%,#ead4ba)] group-hover:bg-[linear-gradient(to_bottom_left,#fcf0df,#f0ddc4_52%,#e5c8a8)] group-focus-within:bg-[linear-gradient(to_bottom_left,#fcf0df,#f0ddc4_52%,#e5c8a8)] px-4 py-3 sm:px-5">
          <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <strong className="text-xl leading-tight font-bold tracking-tight text-primary-dark tabular-nums">{service.fee}</strong>
            <span className="text-sm font-medium text-muted">{t("Petition Fee")}</span>
          </p>
          <Button onClick={onClick} ariaLabel={`View Service: ${t(service.title)}`} className="civily-card-action min-h-10 gap-1.5 px-2 text-sm font-medium text-primary hover:text-primary-dark">
            {t("View Service")}
            <Icon name="chevron" className="size-3.5" />
          </Button>
        </div>
      </article>
    </div>
  )
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="civily-page-intro mx-auto w-full max-w-7xl px-5 pt-7 pb-5 sm:px-8 sm:pt-9 sm:pb-6">
      <div className={children ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.62fr)] lg:items-end lg:gap-8" : undefined}>
        <div>
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              {eyebrow}
            </p>
          )}
          <Heading level={1} className="civily-page-title text-3xl font-bold leading-[1.12] tracking-tight text-primary-dark sm:text-4xl">
            {title}
          </Heading>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

function ServiceDirectory({
  openService,
  viewFees,
}: {
  openService: (service: Service) => void
  viewFees: () => void
}) {
  const t = usePublicCopy()
  const combined = [
    "Change of First Name + Correction of Sex",
    "Change of First Name + Correction of Date of Birth",
    "Correction of Sex + Date of Birth",
  ]
  return (
    <div className="civily-service-directory mx-auto w-full max-w-7xl px-5 pt-6 pb-1 sm:px-8 sm:pt-8">
      <header className="civily-services-surface overflow-hidden rounded-t-2xl rounded-br-2xl border-b-2 border-[#e0b88e] px-5 py-5 text-[#fff7ec] shadow-panel sm:px-7">
        <h1 className="civily-section-underline text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Services &amp; Requirements</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#f3ddc7] sm:text-base">{t("Choose a service to see its requirements and filing fee.")}</p>
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} onClick={() => openService(service)} />
        ))}
      </div>
      <section aria-labelledby="combined-services-title" className="mt-7 grid overflow-hidden rounded-2xl border border-[#e5cfb4] bg-white shadow-panel md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="civily-services-surface px-5 py-5 text-[#fff7ec] sm:px-7">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/15">
              <Icon name="checklist" className="size-5" />
            </span>
            <div>
              <h2 id="combined-services-title" className="civily-section-underline text-xl font-bold tracking-tight">Combined petitions</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#f3ddc7]">Confirm the requirements with MCR Daet before filing.</p>
              <Button onClick={viewFees} className="mt-3 min-h-11 bg-white px-3.5 text-sm text-primary hover:bg-soft focus-visible:outline-white">
                View fees <Icon name="chevron" className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <ul className="self-center divide-y divide-line px-5 py-1 sm:px-7">
          {combined.map((title) => (
            <li key={title} className="flex items-start gap-3 py-3.5 text-sm font-semibold leading-relaxed text-primary-dark">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-section text-primary"><Icon name="document" className="size-4" /></span>
              <span>{t(title)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SamplePreview({
  documentName,
  close,
  viewRequirements,
}: {
  documentName: string
  close: () => void
  viewRequirements?: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closing = useRef(false)

  const dismiss = async (afterClose: () => void) => {
    const preview = dialog.current
    if (!preview?.open || closing.current) return
    closing.current = true

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const exit = preview.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(8px) scale(.99)" }],
        { duration: 120, easing: "ease-in", fill: "forwards" },
      )
      await exit.finished.catch(() => undefined)
    }

    preview.close()
    afterClose()
  }

  useEffect(() => {
    const preview = dialog.current
    if (preview && !preview.open) preview.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-label={`${documentName} sample`}
      onCancel={(event) => {
        event.preventDefault()
        void dismiss(close)
      }}
      className="civily-sample-preview fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-2xl bg-white text-ink shadow-2xl backdrop:bg-primary-dark/65 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-section text-primary"><Icon name="document" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              For Illustration Only
            </p>
            <Heading level={2} className="text-lg font-bold text-primary-dark">
              {documentName}
            </Heading>
          </div>
          <Button
            onClick={() => void dismiss(close)}
            ariaLabel="Close sample"
            className="size-11 shrink-0 bg-section text-primary ring-1 ring-inset ring-line hover:bg-soft"
          >
            <Icon name="x" className="size-5" />
          </Button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain bg-[#f5f1eb] p-4 sm:p-8">
          <div className="civily-sample-sheet relative mx-auto min-h-[34rem] max-w-xl overflow-hidden border border-line bg-white p-5 shadow-md sm:p-8">
            <div className="absolute inset-x-0 top-1/2 -rotate-12 text-center text-5xl font-bold tracking-widest text-primary/[0.07]">
              SAMPLE
            </div>
            <div className="border-2 border-primary p-3 text-center">
              <p className="text-xs font-bold uppercase">
                Sample Document Reference
              </p>
              <p className="mt-1 text-[10px] font-semibold text-primary">
                FOR ILLUSTRATION ONLY — NOT A VALID DOCUMENT
              </p>
            </div>
            <div className="mt-8 text-center">
              <p className="text-xs uppercase tracking-widest text-muted">
                Sample Reference Document
              </p>
              <p className="mt-2 font-bold text-primary-dark">{documentName}</p>
            </div>
            <div className="mt-10 space-y-5">
              {[
                "Fictional Name: JUAN SAMPLE DELA CRUZ",
                "Sample Reference: DEMO-000000",
                "Sample Address: Barangay Halimbawa, Daet",
                "Illustrative Date: January 1, 2000",
              ].map((line) => (
                <div key={line}>
                  <p className="text-xs text-muted">{line}</p>
                  <div className="mt-2 h-px bg-line" />
                </div>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div className="min-w-0 flex-1">
                <div className="h-px bg-muted" />
                <p className="mt-2 text-center text-[10px] text-muted">
                  SAMPLE SIGNATURE
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-px bg-muted" />
                <p className="mt-2 text-center text-[10px] text-muted">
                  SAMPLE OFFICER
                </p>
              </div>
            </div>
            <div className="mt-10 border border-error/30 bg-red-50 p-3 text-center text-xs font-bold text-error">
              SAMPLE · FOR ILLUSTRATION ONLY · NO LEGAL VALIDITY
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-muted">
            All information shown is fictional. This visual reference cannot be
            used as an official form, record, clearance, or supporting document.
          </p>
          <div className="mx-auto mt-6 max-w-xl rounded-lg border border-civic/20 bg-civic-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-civic">
              What to look for
            </p>
            <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
              {[
                "Name of document owner",
                "Relevant date or entry",
                "Registry information",
                "Document title and issuing office",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-civic" />
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              CIVILyst does not automatically validate or accept documents.
            </p>
          </div>
        </div>
        {viewRequirements && (
          <div className="flex shrink-0 justify-end border-t border-line bg-white px-4 py-2 sm:px-6">
            <Button onClick={() => void dismiss(viewRequirements)} className="min-h-11 px-3 text-sm text-primary hover:bg-section">
              View document checklist
              <Icon name="chevron" className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </dialog>
  )
}

function ServiceDetail({
  service,
  back,
}: {
  service: Service
  back: () => void
}) {
  const [tab, setTab] = useState<Tab>("requirements")
  const [preview, setPreview] = useState("")
  const requirements = requirementsByService[service.id]
  const download = () => {
    const text = `CIVILyst — ${service.title}\nFOR INFORMATION ONLY\n\n${requirements.map((item, index) => `${index + 1}. [ ] ${item.title}\n${item.detail}\nPreparation: ${item.preparation}`).join("\n\n")}\n\n${checklistFilingNote}`
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${service.id}-checklist.txt`
    link.click()
    URL.revokeObjectURL(url)
  }
  const serviceSamples =
    samplesByService[service.id] ?? samplesByService["birth-date"]
  return (
    <>
      {preview && (
        <SamplePreview
          documentName={preview}
          close={() => setPreview("")}
          viewRequirements={tab === "requirements" ? undefined : () => {
            setPreview("")
            setTab("requirements")
          }}
        />
      )}
      <div className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">
        <section className="civily-service-enter civily-hero relative isolate overflow-hidden rounded-[1.75rem] px-5 py-5 text-[#fff7ec] shadow-panel sm:px-8 sm:py-7">
          <Button onClick={back} className="min-h-10 gap-1.5 px-2 text-sm text-[#f4dfc8] hover:bg-white/10 focus-visible:outline-white">
            <Icon name="chevron" className="size-4 rotate-180" /> All services
          </Button>
          <div className="mt-3 grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,auto)]">
            <div>
              <h1 className="civily-section-underline max-w-3xl text-2xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">{service.title}</h1>
              <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-[#f3ddc7] sm:text-base">{service.description}</p>
            </div>
            <div className="civily-tracking-frame w-full max-w-sm lg:w-auto">
              <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-[#fffcf7] px-4 py-3 text-primary-dark">
                <div>
                  <dt className="text-xs font-medium text-muted">Petition fee</dt>
                  <dd className="mt-1 text-xl font-bold tabular-nums">{service.fee}.00</dd>
                </div>
                <div className="border-l border-line pl-4">
                  <dt className="text-xs font-medium text-muted">Legal basis</dt>
                  <dd className="mt-1 text-sm font-semibold">{service.law}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
        <div className="civily-header-edge mt-4">
          <div role="group" aria-label="Service details" className="flex flex-wrap gap-1 rounded-[15px] bg-[#fffcf7] p-1.5">
            {([
              ["requirements", "Requirements"],
              ["samples", "Sample documents"],
              ["information", "Service information"],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary ${tab === key ? "bg-primary text-white" : "text-muted hover:bg-section hover:text-primary-dark"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div key={tab} className="civily-service-enter mx-auto max-w-7xl px-5 pt-5 pb-8 sm:px-8">
        {tab === "requirements" && (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-6">
            <section className="civily-header-edge min-w-0" aria-labelledby="document-checklist-title">
              <div className="overflow-hidden rounded-[15px] bg-white">
                  <div className="civily-services-surface flex items-center gap-3 overflow-hidden px-4 py-3 text-[#fff7ec] sm:px-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15 text-[#fff7ec]">
                      <Icon name="checklist" className="size-5" />
                    </span>
                    <h2 id="document-checklist-title" className="civily-section-underline text-lg font-bold tracking-tight">Document checklist</h2>
                  </div>
                <ul className="grid gap-3 border-t border-line bg-[#f5f1eb] p-3 sm:p-4">
                  {requirements.map((item) => {
                    const sample = serviceSamples.find(([name]) => item.sampleName?.test(name))
                    return (
                      <li key={item.title} className="rounded-xl border border-line bg-white p-4 shadow-panel sm:p-5">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-x-4">
                          <span className="grid size-10 place-items-center rounded-lg bg-soft text-primary">
                            <Icon name={item.icon} />
                          </span>
                          <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
                            <div className="min-w-0 flex-[1_1_16rem]">
                              <h3 className="text-lg font-bold leading-snug text-primary-dark">{item.title}</h3>
                              <p className="mt-1.5 max-w-[65ch] text-base leading-relaxed text-muted">{item.detail}</p>
                              <p className="mt-3 max-w-[65ch] border-l-2 border-line pl-3 text-sm leading-relaxed text-muted">
                                <strong className="text-primary-dark">Preparation:</strong> {item.preparation}
                              </p>
                            </div>
                            {sample && (
                              <Button
                                onClick={() => setPreview(sample[0])}
                                ariaLabel={`View example: ${sample[0]}`}
                                className="min-h-11 border border-line bg-white px-3 text-sm text-primary hover:bg-section"
                              >
                                <Icon name="document" className="size-4" />
                                View example
                                <Icon name="chevron" className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
            <aside className="civily-checklist-dock grid content-start gap-3">
              <section className="civily-header-edge print:hidden" aria-labelledby="checklist-actions-title">
                <div className="rounded-[15px] bg-white p-3.5">
                  <h3 id="checklist-actions-title" className="civily-layered-label mb-3 w-fit bg-primary px-3 py-1 text-sm font-bold text-white">Save or print</h3>
                  <div className="grid gap-2">
                    <Button onClick={download} className="min-h-12 w-full !justify-start gap-2.5 bg-primary px-2.5 py-2 text-left text-white hover:bg-primary-dark">
                      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-white/15"><Icon name="download" className="size-4" /></span>
                      <span><span className="block text-sm">Download checklist</span><span className="block text-xs font-medium text-[#f3ddc7]">Text file (.txt)</span></span>
                    </Button>
                    <Button onClick={() => window.print()} className="min-h-12 w-full !justify-start gap-2.5 bg-white px-2.5 py-2 text-left text-primary ring-1 ring-inset ring-line hover:bg-section">
                      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-section"><Icon name="print" className="size-4" /></span>
                      <span><span className="block text-sm">Print checklist</span><span className="block text-xs font-medium text-muted">Print or save as PDF</span></span>
                    </Button>
                  </div>
                </div>
              </section>
              <Notice>{checklistFilingNote}</Notice>
            </aside>
          </div>
        )}
        {tab === "samples" && (
          <section className="civily-header-edge" aria-labelledby="document-samples-title">
            <div className="overflow-hidden rounded-[15px] bg-white">
              <div className="civily-services-surface px-5 py-5 text-[#fff7ec] sm:px-6">
                <h2 id="document-samples-title" className="civily-section-underline w-fit text-2xl font-bold tracking-tight text-[#fff7ec]">Document samples</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#f3ddc7]">Open an example to see what the document looks like.</p>
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-white/15 bg-primary-dark/55 px-3 py-2.5 text-sm leading-relaxed text-[#fff7ec]">
                  <Icon name="info" className="mt-0.5 size-4 shrink-0 text-[#efcc9f]" />
                  <p>Examples contain fictional details and are for reference only. Confirm what to bring with MCR Daet.</p>
                </div>
              </div>
              <ul className="grid gap-3 border-t border-line bg-[#f5f1eb] p-4 sm:grid-cols-2 sm:p-6">
                {serviceSamples.map(([name, description]) => (
                  <li key={name}>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => setPreview(name)}
                      className="civily-sample-card group grid h-full w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-xl bg-white p-4 text-left shadow-panel ring-1 ring-inset ring-line transition-colors hover:bg-section focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span className="grid size-10 place-items-center rounded-lg bg-primary text-white group-hover:bg-primary-dark">
                        <Icon name="document" />
                      </span>
                      <span>
                        <span className="block text-base font-bold leading-snug text-primary-dark">{name}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span>

                      </span>
                      <span className="col-start-2 mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-section px-2.5 py-1.5 text-sm font-semibold text-primary group-hover:bg-soft">
                        View example <Icon name="chevron" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {tab === "information" && (
          <section aria-labelledby="service-information-title">
            <div className="civily-header-edge">
              <div className="overflow-hidden rounded-[15px] bg-white">
                <div className="flex items-start gap-4 px-5 py-5 sm:px-7">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
                    <Icon name="pin" />
                  </span>
                  <div>
                    <h2 id="service-information-title" className="civily-layered-label mb-1 w-fit bg-primary px-3 py-1 text-lg font-bold tracking-tight text-white">File in person</h2>
                    <p className="mt-1 text-sm font-semibold text-primary-dark">Municipal Civil Registrar’s Office of Daet</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">Online filing and payment are unavailable through CIVILyst.</p>
                  </div>
                </div>
                <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line bg-section px-5 py-4 text-sm sm:px-7">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <dt className="text-muted">Petition fee</dt>
                    <dd className="font-bold text-primary-dark">{service.fee}.00</dd>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <dt className="text-muted">Legal basis</dt>
                    <dd className="font-semibold text-primary-dark">{service.law.replace("RA ", "Republic Act No. ")}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white">
              <h3 className="civily-faq-title flex items-center gap-2 border-b border-line px-5 py-3.5 text-base font-bold text-primary-dark sm:px-7">
                <Icon name="checklist" className="size-5 text-primary" />
                Before you visit
              </h3>
              <ul className="grid gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2 sm:px-7">
                {[
                  "Review the petition checklist and confirm which copies to bring with MCR Daet.",
                  "Confirm the applicable fee with MCR Daet.",
                  "Bring valid identification and supporting records for your petition.",
                  "Allow time for MCR personnel to review your documents.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                    <Icon name="check" className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function StatusResult({
  reference,
  reset,
}: {
  reference: string
  reset: () => void
}) {
  const timeline = [
    ["Petition Accepted", "September 4, 2026"],
    ["Notice Posting Completed", "September 14, 2026"],
    ["MCR Decision — Granted", "September 19, 2026"],
    ["Transmitted to PSA", "September 23, 2026"],
    ["Awaiting PSA Action", "CURRENT"],
    ["PSA Result", "Pending"],
    ["Endorsement for Annotation", "Pending"],
    ["Annotation / Completion", "Pending"],
  ]
  return (
    <>
      <PageIntro
        eyebrow="Petition Status"
        title="Your Tracking Result"
        description="Only status information approved for public viewing is displayed."
      />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Button
          onClick={reset}
          className="mb-5 text-sm text-primary hover:underline"
        >
          <span className="rotate-180">
            <Icon name="chevron" className="size-4" />
          </span>
          Track another petition
        </Button>
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_16px_45px_-30px_rgba(67,39,30,0.45)]">
          <div className="bg-gradient-to-r from-primary-dark to-primary px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/65">
                  Transaction
                </p>
                <p className="mt-1 text-lg font-bold">{reference}</p>
              </div>
              <span className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                IN PROGRESS
              </span>
            </div>
          </div>
          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Current Status
              </p>
              <Heading
                level={1}
                className="mt-2 text-2xl font-bold text-primary-dark"
              >
                Awaiting PSA Action
              </Heading>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Your petition has been transmitted to the Philippine Statistics
                Authority. No action is currently required from you.
              </p>
              <div className="mt-5 rounded-lg border border-line bg-page p-4">
                <p className="text-xs text-muted">Last Updated</p>
                <p className="mt-1 text-sm font-bold">September 23, 2026</p>
              </div>
              <div className="mt-5">
                <Notice>
                  Need assistance? Contact MCR Daet and provide your transaction
                  number. Internal notes and personal record information are not
                  displayed here.
                </Notice>
              </div>
            </div>
            <div>
              <Heading
                level={2}
                className="mb-6 text-sm font-bold uppercase tracking-wide text-primary-dark"
              >
                Petition Progress
              </Heading>
              {timeline.map(([title, date], index) => {
                const complete = index < 4
                const current = index === 4
                return (
                  <div
                    key={title}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index < timeline.length - 1 && (
                      <span
                        className={`absolute left-4 top-8 h-full w-0.5 ${
                          complete ? "bg-sage" : "bg-line"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 ${
                        complete
                          ? "border-sage bg-sage text-white"
                          : current
                            ? "border-primary bg-white text-primary ring-4 ring-soft"
                            : "border-line bg-white text-muted/60"
                      }`}
                    >
                      {complete ? (
                        <Icon name="check" className="size-4" />
                      ) : (
                        <span className="size-2 rounded-full bg-current" />
                      )}
                    </span>
                    <div
                      className={
                        current
                          ? "-mt-1 w-full rounded-lg border border-primary-light/30 bg-soft/60 p-3"
                          : "pt-1"
                      }
                    >
                      <p
                        className={`text-sm font-semibold ${
                          current
                            ? "text-primary-dark"
                            : complete
                              ? "text-ink"
                              : "text-muted"
                        }`}
                      >
                        {title}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          current ? "font-bold text-primary" : "text-muted"
                        }`}
                      >
                        {date}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type PublicStageStatus = "completed" | "current" | "pending" | "action"

type PublicStage = {
  name: string
  shortDate: string
  date: string
  status: PublicStageStatus
  description: string
  clientAction: string
}

function PetitionStatusResult({ result }: { result: TrackingResult }) {
  const reference = result.petition.transaction_ref_no
  const latest = [...result.milestones].reverse().find(item => item.changes_current_stage) ?? result.milestones.at(-1)
  const workflow = ["Petition Accepted", "Posting Period", "MCR Decision", "Transmitted to PSA", "Awaiting PSA Action", "PSA Result", "Endorsement for Annotation", "Annotation / Completion"]
  const labels = [...workflow]
  for (const { stage_code } of result.milestones) if (!labels.includes(stage_code)) labels.push(stage_code)
  const needsAction = /action required|denied|impugned/i.test(latest?.stage_code ?? "")
  const formatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "UTC" })
  const stages: PublicStage[] = labels.map(name => {
    const event = name === latest?.stage_code ? latest : [...result.milestones].reverse().find(item => item.stage_code === name)
    const current = name === latest?.stage_code
    const date = event ? formatter.format(new Date(event.effective_on + "T00:00:00Z")) : ""
    return {
      name,
      status: current ? needsAction ? "action" : "current" : event ? "completed" : "pending",
      date,
      shortDate: current ? "Current stage" : date || "Pending",
      description: event?.public_remark || (event ? "This milestone has been recorded by MCR Daet." : "MCR Daet has not recorded this milestone yet."),
      clientAction: event?.public_remark || (current && needsAction ? "Contact MCR Daet for instructions." : "No action required"),
    }
  })
  const initialIndex = Math.max(
    0,
    stages.findIndex(
      (stage) => stage.status === "current" || stage.status === "action",
    ),
  )
  const current = stages[initialIndex]
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const timelineRef = useRef<HTMLOListElement>(null)
  const showMilestone = (index: number) => {
    setSelectedIndex(index)
    setDetailsOpen(true)
  }
  const summary = needsAction ? "See next step" : current.name === "Annotation / Completion" ? "Completed" : "In progress"

  useEffect(() => {
    const timeline = timelineRef.current
    const button = timeline?.querySelectorAll("button")[selectedIndex]
    if (!timeline || !button) return
    const left = button.getBoundingClientRect().left - timeline.getBoundingClientRect().left
    timeline.scrollTo({
      left: timeline.scrollLeft + left - (timeline.clientWidth - button.offsetWidth) / 2,
      behavior: "instant",
    })
  }, [selectedIndex, detailsOpen])

  const questions = [
    ["What does Pending mean?", "MCR Daet has not recorded an update for that milestone yet. Some milestones apply only to certain petitions."],
    ["When will my timeline update?", "Check again after MCR Daet records a new milestone. The last updated date shows when the current status was recorded."],
    ["When should I contact MCR Daet?", "Contact the office if your status asks you to take action or if you need help understanding an update. Have your CCE number ready."],
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
      <section className="civily-header-edge" aria-labelledby="petition-status-title">
        <div className="overflow-hidden rounded-[15px] bg-white">
          <div className="civily-services-surface flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-[#fff7ec] sm:px-6">
            <div>
              <p className="text-xs font-medium text-[#f3ddc7]">Transaction reference</p>
              <p className="mt-1 break-all text-lg font-bold tracking-tight">{reference}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${needsAction ? "bg-warning text-primary-dark" : "bg-white/15 text-white"}`}>{summary}</span>
          </div>
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.42fr)] lg:items-center lg:gap-6">
            <div>
              <p className="civily-layered-label mb-2 w-fit bg-primary px-2.5 py-1 text-xs font-bold text-white">Current status</p>
              <h1 id="petition-status-title" className="mt-1 text-2xl leading-tight font-bold tracking-tight text-primary-dark sm:text-3xl">{current.name}</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                {current.description}
              </p>
              {current.date && <p className="mt-3 text-xs text-muted">Last updated <strong className="font-semibold text-primary-dark">{current.date}</strong></p>}
            </div>
            <div className={`rounded-xl border border-line p-4 ${needsAction ? "bg-warning" : "bg-[#faf6f0]"}`}>
              <h2 className="civily-section-underline civily-section-underline-light text-xs font-bold text-primary">What you need to do</h2>
              <p className="mt-1.5 text-sm leading-relaxed font-semibold text-primary-dark">{needsAction ? current.clientAction : "No action required"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="civily-header-edge" aria-labelledby="petition-payment-title">
        <div className="rounded-[15px] bg-white p-4 sm:p-6">
          <h2 id="petition-payment-title" className="civily-layered-label w-fit bg-primary px-3 py-1.5 text-lg font-bold text-white">Petition payment</h2>
          <p className="mt-3 text-sm text-muted">Payment records are unavailable in online tracking. Keep your official receipt for reference.</p>
        </div>
      </section>

      <section className="civily-header-edge" aria-labelledby="petition-history-title">
        <div className="overflow-hidden rounded-[15px] bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="petition-history-title" className="civily-layered-label w-fit bg-primary px-3 py-1.5 text-lg font-bold tracking-tight text-white">Petition progress</h2>
              <p className="mt-2.5 text-sm text-muted">Select the current stage or a completed milestone to view its details.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => showMilestone(initialIndex)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-primary ring-1 ring-inset ring-line transition-colors hover:bg-section focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><Icon name="timeline" className="size-4" /> Current stage</button>
              <button type="button" aria-label="Previous milestone" disabled={selectedIndex === 0} onClick={() => showMilestone(selectedIndex - 1)} className="grid size-10 cursor-pointer place-items-center rounded-lg bg-white text-primary ring-1 ring-inset ring-line hover:bg-section focus-visible:outline-2 disabled:cursor-default disabled:opacity-35"><Icon name="chevron" className="size-4 rotate-180" /></button>
              <button type="button" aria-label="Next milestone" disabled={selectedIndex >= initialIndex} onClick={() => showMilestone(selectedIndex + 1)} className="grid size-10 cursor-pointer place-items-center rounded-lg bg-white text-primary ring-1 ring-inset ring-line hover:bg-section focus-visible:outline-2 disabled:cursor-default disabled:opacity-35"><Icon name="chevron" className="size-4" /></button>
            </div>
          </div>
          <ol ref={timelineRef} aria-label="Milestones in order" className="mt-4 flex gap-2 overflow-x-auto overscroll-x-contain p-1 pb-3 [scrollbar-color:#c4a98e_transparent] [scrollbar-width:thin]">
            {stages.map((stage, index) => {
              const isCurrent = index === initialIndex
              const complete = stage.status === "completed"
              const available = isCurrent || complete
              const expanded = detailsOpen && selectedIndex === index
              const label = isCurrent ? "Current stage" : complete ? "Completed" : "Pending"
              return (
                <li key={stage.name} className="relative w-35 shrink-0">
                  {index < stages.length - 1 && <span aria-hidden="true" className={`pointer-events-none absolute top-7 left-1/2 h-0.5 w-[calc(100%+0.5rem)] ${complete ? "bg-sage" : "bg-line"}`} />}
                  <button type="button" aria-current={isCurrent ? "step" : undefined} disabled={!available} aria-expanded={available ? expanded : undefined} aria-controls={available ? "milestone-details" : undefined} onClick={() => { setSelectedIndex(index); setDetailsOpen(!expanded) }}
                    className={`relative flex min-h-37 w-full cursor-pointer flex-col items-center rounded-xl border border-transparent px-2 py-2 text-center disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${expanded ? "bg-[#f5ebdf] ring-1 ring-inset ring-primary-light" : isCurrent ? "bg-section hover:bg-soft" : complete ? "hover:bg-[#faf7f2]" : ""}`}>
                    <span aria-hidden="true" className={`grid size-9 place-items-center rounded-full border ${isCurrent ? "border-primary bg-primary text-white ring-2 ring-primary/20 ring-offset-2" : complete ? "border-sage bg-sage-soft text-[#37624b]" : "border-line bg-white text-muted"}`}>
                      {complete ? <Icon name="check" className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    <span className="mt-2 text-sm leading-tight font-semibold text-primary-dark">{stage.name}</span>
                    <span className={`mt-2 rounded-full px-2 py-0.5 text-xs font-semibold ${isCurrent ? "bg-primary text-white" : complete ? "bg-sage-soft text-[#37624b]" : "bg-[#f4f1ed] text-muted"}`}>{label}</span>
                    {complete && stage.shortDate && <span className="mt-1 text-xs text-muted">{stage.shortDate}</span>}
                    {available && <Icon name="chevron" className={`mt-1 size-4 text-primary ${expanded ? "-rotate-90" : "rotate-90"}`} />}
                  </button>
                </li>
              )
            })}
          </ol>
          <button
            type="button"
            aria-expanded={detailsOpen}
            aria-controls="milestone-details"
            onClick={() => setDetailsOpen(open => !open)}
            className="civily-faq-title mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-2.5 text-left text-primary-dark shadow-panel hover:border-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span>
              <span className="block text-sm font-bold">{detailsOpen ? "Hide milestone history" : "Show milestone history"}</span>
            </span>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-white">
              <Icon name="chevron" className={`size-4 ${detailsOpen ? "-rotate-90" : "rotate-90"}`} />
            </span>
          </button>
          <div id="milestone-details" hidden={!detailsOpen} aria-live="polite">
            {detailsOpen && (
              <ol className="civily-service-enter mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
                {stages.map((stage, index) => stage.status !== "pending" && (
                  <li key={stage.name} className={`border-l-4 px-4 py-3 ${index === selectedIndex ? "border-primary-light bg-section" : "border-transparent"}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-sm font-bold text-primary-dark">{stage.name}</h3>
                      <p className="text-xs font-medium text-muted">Step {index + 1} of {stages.length}{stage.date && " · " + stage.date}</p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{stage.description}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      <section className="civily-header-edge" aria-labelledby="petition-questions-title">
        <div className="divide-y divide-line overflow-hidden rounded-[15px] bg-white">
          <h2 id="petition-questions-title" className="civily-faq-title civily-section-underline civily-section-underline-light px-4 py-3.5 sm:px-5">
            <span className="civily-layered-label inline-block bg-primary px-3 py-1 text-base font-bold text-white">Questions about your timeline</span>
          </h2>
          <div className="grid sm:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1fr)]">
            <div role="group" aria-label="Timeline questions" className="divide-y divide-line sm:border-r sm:border-line">
          {questions.map(([question], index) => (
            <button
              key={question}
              type="button"
              aria-pressed={selectedQuestion === index}
              aria-controls="timeline-faq-answer"
              onClick={() => setSelectedQuestion(index)}
              className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-primary-dark hover:bg-section focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-5 ${selectedQuestion === index ? "bg-[#f4ebe0] font-semibold shadow-[inset_3px_0_#a47350]" : "bg-white"}`}
            >
              {question}
              <Icon name="chevron" className="size-4 shrink-0 text-primary" />
            </button>
          ))}
            </div>
            <div id="timeline-faq-answer" aria-live="polite" className="h-36 overflow-y-auto overscroll-contain border-t border-line bg-white px-4 py-3.5 sm:h-40 sm:border-t-0 sm:px-5">
              <h3 className="text-sm font-semibold text-primary-dark">{questions[selectedQuestion][0]}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{questions[selectedQuestion][1]}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

function FeesPage() {
  const feeGroups = [
    { title: "Individual petitions", rows: fees.slice(0, 4) },
    { title: "Combined petitions", rows: fees.slice(4, 7) },
    { title: "Other service fees", rows: fees.slice(7) },
  ]

  return (
    <div className="civily-public-inner mx-auto w-full max-w-7xl px-5 pt-6 pb-8 sm:px-8 sm:pt-8">
      <header className="civily-services-surface rounded-t-2xl rounded-br-2xl border-b-2 border-[#e0b88e] px-5 py-5 text-[#fff7ec] shadow-panel sm:px-7">
        <h1 className="civily-section-underline text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Petition and Service Fees</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#f3ddc7] sm:text-base">Confirm the applicable filing fee with MCR Daet before your visit.</p>
      </header>
      <div className="mt-5 grid gap-4">
        <aside aria-labelledby="fee-exemption-title" className="flex items-start gap-3 rounded-r-lg border-y border-r border-line border-l-4 border-l-primary-light bg-white px-4 py-3 sm:px-5">
          <Icon name="info" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 id="fee-exemption-title" className="text-sm font-bold text-primary-dark">Fee exemptions</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">Ask MCR Daet if you qualify and whether to bring a Certificate of Indigency or other proof.</p>
          </div>
        </aside>
        <div className="min-w-0 overflow-x-auto rounded-xl border border-line bg-white shadow-panel">
          <table aria-label="Petition and service fees" className="w-full border-collapse text-left text-sm">
            <thead className="bg-primary-dark text-[#fff7ec]">
              <tr>
                <th scope="col" className="px-3 py-3 sm:px-5">Petition or service</th>
                <th scope="col" className="px-2 py-3 sm:px-4">Legal basis</th>
                <th scope="col" className="px-3 py-3 text-right sm:px-5">Fee</th>
              </tr>
            </thead>
            {feeGroups.map(({ title, rows }) => (
              <tbody key={title} className="divide-y divide-line">
                <tr className="civily-faq-title border-t border-line">
                  <th colSpan={3} scope="rowgroup" className="px-3 py-2.5 font-bold text-primary-dark sm:px-5">{title}</th>
                </tr>
                {rows.map(([name, law, fee]) => (
                  <tr key={name} className="odd:bg-[#fcfbfa]">
                    <th scope="row" className="px-3 py-3 font-medium leading-snug text-primary-dark sm:px-5">{name}</th>
                    <td className="px-2 py-3 text-xs text-muted sm:px-4 sm:text-sm">{law}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-primary-dark tabular-nums sm:px-5">{fee}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  )
}

export function HelpQuestions({ faqs, title = "Common questions" }: { faqs: string[][]; title?: string }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
  <section className="civily-header-edge">
    <div className="overflow-hidden rounded-[15px] bg-white">
    <Heading
      level={2}
      className="civily-faq-title civily-section-underline civily-section-underline-light border-b border-[#dfc9b0] px-4 py-3.5 text-xl font-semibold tracking-tight text-primary-dark sm:px-5"
    >
      <span className="civily-layered-label inline-block bg-primary px-3 py-1 text-base font-bold text-white">{title}</span>
    </Heading>
    <div className="overflow-hidden">
      {faqs.map(([question, answer], index) => (
        <div
          key={question}
          className={`border-b border-line last:border-b-0 ${openFaq === index ? "bg-white" : "bg-[#fffcf7]"}`}
        >
          <Button
            onClick={() => setOpenFaq(openFaq === index ? null : index)}
            expanded={openFaq === index}
            className={`w-full !justify-between gap-3 rounded-none border-l-2 px-4 py-3.5 text-left text-sm transition-colors focus-visible:-outline-offset-2 sm:px-5 ${openFaq === index ? "border-[#e4b681] bg-linear-to-r from-primary-dark to-primary text-white focus-visible:outline-white" : "border-transparent text-primary-dark hover:bg-section"}`}
          >
            <span>{question}</span>
            <span aria-hidden="true"
              className={`shrink-0 transition ${
                openFaq === index ? "rotate-90" : ""
              }`}
            >
              <Icon name="chevron" className="size-4" />
            </span>
          </Button>
          {openFaq === index && (
            <p className="border-l-2 border-[#bc8d62] bg-white px-4 py-4 text-sm leading-relaxed text-ink sm:px-5">
              {answer}
            </p>
          )}
        </div>
      ))}
    </div>
    </div>
  </section>
  )
}

function HelpPage({ navigate }: { navigate: (page: Page) => void }) {
  const actions: [IconName, string, string, Page][] = [
    [
      "timeline",
      "Track My Petition",
      "Check the latest recorded progress.",
      "track",
    ],
    [
      "checklist",
      "Find Requirements",
      "Prepare documents for your visit.",
      "services",
    ],
    ["fee", "Understand Fees", "Review the current fee schedule.", "fees"],
    ["pin", "Visit MCR Daet", "Find office and service information.", "help"],
  ]
  const faqs = [
    [
      "Where can I find my CCE number?",
      "It is printed on the acknowledgement or transaction record issued after MCR Daet officially accepts your petition.",
    ],
    [
      "When can I start tracking my petition?",
      "Tracking becomes available after your petition has been officially accepted and recorded in CIVILyst.",
    ],
    [
      "Can I submit documents through CIVILyst?",
      "No. Documentary requirements must be submitted in person to MCR Daet for official assessment.",
    ],
    [
      "Can I pay through CIVILyst?",
      "No. CIVILyst does not process online payments. Confirm payment instructions with MCR Daet.",
    ],
    [
      "What should I do if my status says Action Required?",
      "Read the approved client instruction shown with the status, then contact MCR Daet and bring your CCE number.",
    ],
    [
      "What if I cannot access the internet?",
      "You may visit MCR Daet during office hours and present your CCE number for assistance.",
    ],
  ]
  return (
    <div className="civily-public-inner mx-auto w-full max-w-7xl px-5 pt-6 pb-6 sm:px-8 sm:pt-8">
      <div className="civily-services-surface rounded-2xl p-4 sm:p-6">
      <PageIntro
        title="How can we help?"
        description="Find answers about tracking, filing, and visiting MCR Daet."
      />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map(([icon, title, detail, page]) => (
            <Button
              key={title}
              onClick={() => {
                if (page === "help") document.getElementById("visit-mcr-daet")?.scrollIntoView({ block: "start" })
                else navigate(page)
              }}
              className="min-w-0 !justify-start border border-line bg-[#fffcf7] p-3.5 text-left shadow-panel hover:bg-section"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-white">
                <Icon name={icon} />
              </span>
              <span>
                <strong className="block text-sm text-primary-dark">
                  {title}
                </strong>
                <span className="mt-1 block text-xs font-normal text-muted">
                  {detail}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </div>
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <HelpQuestions faqs={faqs} />
          <aside id="visit-mcr-daet" className="scroll-mt-28">
            <div className="civily-services-surface rounded-2xl p-5 text-[#fff7ec]">
              <span className="grid size-11 place-items-center rounded-lg bg-white/10">
                <Icon name="pin" />
              </span>
              <Heading level={2} className="civily-section-underline mt-3 text-xl font-semibold tracking-tight">
                Visit MCR Daet
              </Heading>
              <p className="mt-3 text-sm leading-relaxed text-[#f3ddc7]">
                Municipal Civil Registrar's Office
                <br />
                Municipal Hall, Daet, Camarines Norte
              </p>
              <div className="mt-5 border-t border-white/15 pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#f3ddc7]">
                  Office Hours
                </p>
                <p className="mt-2 text-sm font-semibold">Monday to Friday</p>
                <p className="mt-1 text-sm text-white/70">8:00 AM–5:00 PM</p>
              </div>
            </div>
            <div className="civily-header-edge mt-4">
              <section className="rounded-[15px] bg-[#fbf3e8] p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e9d7c0] text-primary">
                    <Icon name="document" className="size-4" />
                  </span>
                  <Heading level={3} className="civily-layered-label w-fit bg-primary px-2.5 py-1 text-sm font-bold text-white">
                    Before contacting the office
                  </Heading>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Have your <strong className="font-semibold text-primary-dark">CCE number</strong> ready when you visit or contact MCR Daet.
                </p>
              </section>
            </div>
          </aside>
        </div>
    </div>
  )
}

export function Footer({ navigate, fromStaff = false }: { navigate: (page: Page) => void; fromStaff?: boolean }) {
  const t = usePublicCopy()
  const links: [Page, string][] = [
    ...(fromStaff ? [] : [["track", "Track Petition"] as [Page, string]]),
    ["services", "Services & Requirements"],
    ["fees", "Fees"],
    ["help", "Help"],
  ]

  return (
    <footer className={`civily-footer mt-auto text-[#fff9f0] ${fromStaff ? "-mx-4 -mb-5 sm:-mx-8 sm:-mb-8" : ""}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-x-10 gap-y-8 py-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.8fr] lg:py-11">
          <div>
            <div className="flex items-center gap-3">
              <AgencyLogos />
              <div>
                <p className="text-2xl font-bold tracking-tight text-[#ffe2bd]">CIVILyst</p>
                <p className="mt-1 text-sm text-[#f0d9c4]">Municipal Civil Registrar’s Office</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#f0d9c4]">
              Municipality of Daet, Camarines Norte<br />
              Petition Tracking &amp; Transaction Monitoring System
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <h2 className="mb-3 text-sm font-semibold text-white">{t("Quick Links")}</h2>
            <ul className="grid gap-2.5">
              {links.map(([page, label]) => (
                <li key={page}>
                  <Button onClick={() => navigate(page)} className="justify-start text-left text-sm font-medium text-[#f0d9c4] hover:text-white hover:underline">
                    {t(label)}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">{t("Legal / Information")}</h2>
            <ul className="grid gap-2.5 text-sm text-[#f0d9c4]">
              <li>{t("Data Privacy Notice")}</li>
              <li>{t("Accessibility")}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[#f8d5af]/20 py-4">
          <p className="text-xs text-[#f0d9c4]">Official digital service of the Municipality of Daet · © 2026</p>
        </div>
      </div>
    </footer>
  )
}

export function useScrollLighting() {
  const publicPageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const surface = publicPageRef.current
    if (!surface) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    const updateLighting = () => {
      frame = 0
      const scrollRange = Math.max(surface.offsetHeight - window.innerHeight, 1)
      const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollRange))
      surface.style.setProperty("--light-x", `${100 - progress * 100}%`)
      surface.style.setProperty("--shade-x", `${progress * 100}%`)
    }
    const queueLighting = () => {
      if (!frame) frame = window.requestAnimationFrame(updateLighting)
    }
    const layoutObserver = new ResizeObserver(queueLighting)
    layoutObserver.observe(surface)
    window.addEventListener("scroll", queueLighting, { passive: true })
    window.addEventListener("resize", queueLighting)
    reducedMotion.addEventListener("change", queueLighting)
    updateLighting()

    return () => {
      layoutObserver.disconnect()
      window.removeEventListener("scroll", queueLighting)
      window.removeEventListener("resize", queueLighting)
      reducedMotion.removeEventListener("change", queueLighting)
      window.cancelAnimationFrame(frame)
    }
  }, [])
  return publicPageRef
}

export default function ClientPortal() {
  const publicPageRef = useScrollLighting()
  const [language, setLanguage] = useState<PublicLanguage>(() => localStorage.getItem("civily-public-language") === "fil" ? "fil" : "en")
  useEffect(() => {
    localStorage.setItem("civily-public-language", language)
  }, [language])
  const requestedPage = new URLSearchParams(window.location.search).get("view")
  const [page, setPage] = useState<Exclude<Page, "track">>(requestedPage === "services" || requestedPage === "fees" || requestedPage === "help" ? requestedPage : "home")
  const [service, setService] = useState<Service | null>(null)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [trackingFocusRequest, requestTrackingFocus] = useState(requestedPage === "track" ? 1 : 0)
  useEffect(() => {
    if (!trackingFocusRequest) return
    const target = document.getElementById("petition-tracking")
    target?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    })
    target?.querySelector("input")?.focus({ preventScroll: true })
  }, [trackingFocusRequest])

  const endTrackingDialog = useRef<HTMLDialogElement>(null)
  const pendingDestination = useRef<Page | "staff">("home")

  const navigate = (next: Page) => {
    if (next !== "timeline") setResult(null)
    setPage(next === "track" || (next === "timeline" && !result) ? "home" : next)
    setService(null)
    if (next === "track") {
      requestTrackingFocus(count => count + 1)
    } else {
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }
  const openService = (next: Service) => {
    setService(next)
    window.scrollTo({ top: 0, behavior: "instant" })
  }
  const requestNavigation = (next: Page | "staff") => {
    if (page === "timeline" && result && next !== "timeline") {
      pendingDestination.current = next
      endTrackingDialog.current?.showModal()
      return
    }
    if (next === "staff") window.location.assign("/portal")
    else navigate(next)
  }

  const confirmLeave = () => {
    endTrackingDialog.current?.close()
    const next = pendingDestination.current
    if (next === "staff") {
      setResult(null)
      window.location.assign("/portal")
    } else navigate(next)
  }

  const track = (trackingResult: TrackingResult) => {
    setResult(trackingResult)
    setPage("timeline")
    setService(null)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  let content: ReactNode
  if (service)
    content = (
      <ServiceDetail
        service={service}
        back={() => {
          setService(null)
          setPage("services")
          window.scrollTo(0, 0)
        }}
      />
    )
  else if (page === "timeline" && result)
    content = (
      <PetitionStatusResult key={result.petition.transaction_ref_no} result={result} />
    )
  else if (page === "home")
    content = (
      <Home navigate={navigate} openService={openService} onTrack={track} />
    )
  else if (page === "services")
    content = <ServiceDirectory openService={openService} viewFees={() => navigate("fees")} />
  else if (page === "fees") content = <FeesPage />
  else content = <HelpPage navigate={navigate} />

  return (
    <PublicLanguageContext.Provider value={language}>
    <div ref={publicPageRef} className={`civily-public-page flex flex-col text-ink ${page === "services" && !service ? "" : "min-h-screen"}`}>
      <Header page={service ? "services" : page} navigate={requestNavigation} language={language} setLanguage={setLanguage} openStaffServices={() => requestNavigation("staff")} />
      <main lang={page === "home" ? language : "en"} className={page === "timeline" ? "civily-public-main" : "civily-public-main civily-public-main--light"}>
        <div aria-hidden="true" className="civily-page-objects">
          <span className="civily-paper" />
          <span className="civily-folder" />
          <span className="civily-receipt" />
          <span className="civily-paper" />
          <span className="civily-folder" />
          <span className="civily-receipt" />
        </div>
        {content}
        {page === "timeline" && <div className="relative mx-auto flex w-full max-w-6xl justify-end px-5 pb-6 sm:px-8">
          <Button onClick={() => requestNavigation("home")} className="min-h-10 border border-line bg-white px-3 text-sm text-primary hover:bg-section">
            <Icon name="chevron" className="size-4 rotate-180" /> End tracking session
          </Button>
        </div>}
      </main>
      {page === "timeline" && (
        <dialog ref={endTrackingDialog} aria-labelledby="end-tracking-title" aria-describedby="end-tracking-description" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-white p-5 text-ink shadow-2xl backdrop:bg-primary-dark/60 sm:p-6">
          <h2 id="end-tracking-title" className="civily-section-underline civily-section-underline-light text-xl font-bold text-primary-dark">End tracking session?</h2>
          <p id="end-tracking-description" className="mt-3 text-sm leading-relaxed text-muted">Leaving this page will close your petition result. To view it again, enter your transaction reference number.</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" autoFocus onClick={() => endTrackingDialog.current?.close()} className="min-h-11 rounded-lg border border-line px-3 text-sm font-semibold text-primary hover:bg-section focus-visible:outline-2">Keep tracking</button>
            <Button onClick={confirmLeave} className="min-h-11 bg-primary px-3 text-sm text-white hover:bg-primary-dark">End session</Button>
          </div>
        </dialog>
      )}
      <Footer navigate={requestNavigation} />
    </div>
    </PublicLanguageContext.Provider>
  )
}
