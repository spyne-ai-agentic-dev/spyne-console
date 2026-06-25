/**
 * GET-only Action Items client for the embed.
 *
 * ⚠️ READ-ONLY: this module performs ONLY `GET` requests. No PUT/POST/PATCH/DELETE.
 * Returns mapped ActionItems when an embed scope (enterpriseId+teamId+token) is present,
 * otherwise null so the caller falls back to the bundled mock data.
 */
import { CUSTOMERS, USERS, type ActionItem } from "./data"
import { getEmbedScope, apiBaseForEnv } from "./be-scope"
import { mapBeItem, customersFromBe, usersFromBe } from "./be-mapper"

export async function fetchActionItems(): Promise<ActionItem[] | null> {
  const scope = getEmbedScope()
  if (!scope) return null // no embed scope → caller uses mock

  const base = apiBaseForEnv(scope.env)
  const url = new URL(`${base}/conversation/action-items`)
  url.searchParams.set("enterpriseId", scope.enterpriseId)
  url.searchParams.set("teamId", scope.teamId)
  url.searchParams.set("isCompleted", "false")
  url.searchParams.set("groupByCustomer", "false")
  url.searchParams.set("limit", "100")

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${scope.token}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) throw new Error(`GET /conversation/action-items → ${res.status}`)

  const body = await res.json()
  // Flat: { data: [...] } · Grouped: { data: [{ actionItems: [...] }], grouped: true }
  const raw: any[] = Array.isArray(body?.data)
    ? body.grouped
      ? body.data.flatMap((g: any) => g?.actionItems ?? [])
      : body.data
    : []

  // Merge live customer/assignee lookups into the shared maps so the console resolves
  // names/phones/initials for live ids (mock entries remain, harmlessly unused).
  Object.assign(CUSTOMERS, customersFromBe(raw))
  Object.assign(USERS, usersFromBe(raw))

  return raw.map(mapBeItem)
}

/**
 * LOCAL/DEV: fetch via the same-origin server proxy (`/api/action-items`) — no CORS, token
 * stays server-side (.env.local). Used by the embed when no token is present in the URL.
 */
export async function fetchActionItemsViaProxy(enterpriseId?: string, teamId?: string): Promise<ActionItem[]> {
  const url = new URL("/api/action-items", window.location.origin)
  if (enterpriseId) url.searchParams.set("enterpriseId", enterpriseId)
  if (teamId) url.searchParams.set("teamId", teamId)
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache: "no-store" })
  if (!res.ok) throw new Error(`proxy /api/action-items → ${res.status}`)
  const body = await res.json()
  const raw: any[] = Array.isArray(body?.data)
    ? body.grouped
      ? body.data.flatMap((g: any) => g?.actionItems ?? [])
      : body.data
    : []
  Object.assign(CUSTOMERS, customersFromBe(raw))
  Object.assign(USERS, usersFromBe(raw))
  return raw.map(mapBeItem)
}

/** LOCAL/DEV: call detail (recording, transcript, AI summary) via the same-origin proxy. */
export async function fetchCallReport(callId: string): Promise<any | null> {
  if (!callId) return null
  const res = await fetch(`/api/call-report?callId=${encodeURIComponent(callId)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`call-report ${res.status}`)
  return res.json()
}

/** LOCAL/DEV: the customer's conversations via the same-origin proxy. Returns { conversations, summary }. */
export async function fetchConversations(customerId: string): Promise<{ conversations: any[]; summary: any }> {
  const res = await fetch(`/api/conversations?customerId=${encodeURIComponent(customerId)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`conversations ${res.status}`)
  const body = await res.json()
  const data = body?.data ?? {}
  return { conversations: Array.isArray(data.conversations) ? data.conversations : [], summary: data.summary ?? null }
}
