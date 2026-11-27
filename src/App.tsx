import { lazy, Suspense } from "react"

const ClientPortal = lazy(() => import("./ClientPortal"))
const StaffPortal = lazy(() => import("./StaffPortal"))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      {window.location.pathname.startsWith("/portal") ? (
        <StaffPortal />
      ) : (
        <ClientPortal />
      )}
    </Suspense>
  )
}

