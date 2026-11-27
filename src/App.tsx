import { pagesPreview } from "./portalRoutes"
import { lazy, Suspense } from "react"

const ClientPortal = lazy(() => import("./ClientPortal"))
const StaffPortal = lazy(() => import("./StaffPortal"))

export default function App() {
  const view = new URLSearchParams(window.location.search).get("view")
  const isStaff = pagesPreview ? view === "staff" || view === "staff-help" : /^\/portal(?:\/|$)/.test(window.location.pathname)
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      {isStaff ? (
        <StaffPortal />
      ) : (
        <ClientPortal />
      )}
    </Suspense>
  )
}

