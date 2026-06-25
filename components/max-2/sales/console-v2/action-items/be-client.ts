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
  // Department is applied client-side (action items have no department field) — not sent here.

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
  // Department NOT sent — action items have no department field server-side; filtered client-side.
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

/** LOCAL/DEV: assignable users for the embed's scope (active users only). */
export async function fetchUsers(): Promise<{ id: string; name: string; initials: string; email?: string }[]> {
  const scope = (window as unknown as { __AI_SCOPE__?: { enterpriseId?: string; teamId?: string } }).__AI_SCOPE__
  const url = new URL("/api/users", window.location.origin)
  if (scope?.enterpriseId) url.searchParams.set("enterpriseId", scope.enterpriseId)
  if (scope?.teamId) url.searchParams.set("teamId", scope.teamId)
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache: "no-store" })
  if (!res.ok) return []
  const body = await res.json()
  const active = body?.data?.activeUsers ?? {}
  return Object.values(active)
    .map((u: any) => {
      const name = u.user_name || u.label || u.email_id || u.user_id || ""
      const parts = String(name).trim().split(/\s+/).filter(Boolean)
      const initials = (parts.length ? parts[0][0] + (parts[1]?.[0] ?? "") : "–").toUpperCase()
      return { id: String(u.user_id), name, initials, email: u.email_id }
    })
    .filter((u) => u.id)
}

/** Assign an action item's lead to a user (PATCH via same-origin proxy). The embed's one write. */
export async function assignActionItem(leadId: string, userId: string): Promise<boolean> {
  if (!leadId || !userId) return false
  const res = await fetch("/api/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ leadId, userId, action: "assign" }),
  })
  return res.ok
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

/** LOCAL/DEV: the customer's conversations via the same-origin proxy. Returns { conversations, summary }.
 *  Scoped to the embed's selected department (window.__AI_SCOPE__.department) so leads/conversations
 *  match the top-level department filter; falls back to the proxy default when unset. */
export async function fetchConversations(customerId: string): Promise<{ conversations: any[]; summary: any }> {
  const scope = (window as unknown as { __AI_SCOPE__?: { department?: string; enterpriseId?: string; teamId?: string } }).__AI_SCOPE__
  const dept = scope?.department && scope.department !== "all" ? scope.department : undefined
  const url = new URL("/api/conversations", window.location.origin)
  url.searchParams.set("customerId", customerId)
  // Enterprise/team are UI-driven (window.__AI_SCOPE__) — pass them so the drawer follows the
  // entered rooftop, not the proxy's env defaults. Proxy falls back to env only when unset.
  if (scope?.enterpriseId) url.searchParams.set("enterpriseId", scope.enterpriseId)
  if (scope?.teamId) url.searchParams.set("teamId", scope.teamId)
  if (dept) url.searchParams.set("department", dept)
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`conversations ${res.status}`)
  const body = await res.json()
  const data = body?.data ?? {}
  return { conversations: Array.isArray(data.conversations) ? data.conversations : [], summary: data.summary ?? null }
}
