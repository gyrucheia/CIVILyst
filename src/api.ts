type ErrorResponse = { error?: string }

export async function apiRequest<T>(route: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`/api/${route}`, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload === null) {
    throw new Error((payload as ErrorResponse | null)?.error || "The local CIVILyst API is unavailable.")
  }
  return payload as T
}

export type TrackingResult = {
  petition: { transaction_ref_no: string; filing_date: string }
  milestones: { stage_code: string; effective_on: string; public_remark: string | null; changes_current_stage: number | boolean }[]
}
