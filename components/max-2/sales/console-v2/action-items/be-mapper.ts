/**
 * Maps conversational-ai-backend action-item docs → the console's ActionItem shape.
 * Aligned to the REAL prod response (verified against api.spyne.ai GET /conversation/action-items):
 *   - intent is a top-level UPPERCASE string (e.g. REQUEST_CALLBACK), not meta.intent_id
 *   - the "what needs doing" recap is top-level `description` (`summary` is usually empty)
 *   - the source quote is top-level `evidence`
 *   - source conversation id is `meta.conversationId` (camelCase); channel is call (meta.callSid)
 *   - assigned_to is often "SYSTEM" (auto) → treated as unassigned
 * Forward-compatible: still honours PRD-style `meta.*` fields when present.
 * Defensive: every field has a fallback so a sparse/unknown shape never throws.
 */
import type { ActionItem, Channel, IntentId, ActionItemStatus } from "./data"

const INTENT_IDS: IntentId[] = [
  "pricing_quote", "recall_response", "callback_request", "status_update",
  "appointment_inquiry", "service_intent", "vehicle_inquiry", "trade_in_inquiry",
  "complaint", "sms_takeover", "specific_salesperson", "compliance_alert", "no_show",
]
const CHANNELS: Channel[] = ["call", "sms", "chat", "email", "hitl_takeover", "hitl_warm_transfer"]

// Prod BE intent vocabulary → console IntentId (verified values + room for more).
const BE_INTENT_TO_CONSOLE: Record<string, IntentId> = {
  REQUEST_CALLBACK: "callback_request",
  SERVICE_PARTS_CALLBACK: "callback_request",
  SERVICE_SCHEDULE_APPOINTMENT: "appointment_inquiry",
  SERVICE_SEND_ESTIMATE: "pricing_quote",
  SERVICE_STATUS_UPDATE: "status_update",
  SERVICE_RECALL: "recall_response",
  SERVICE_COMPLAINT: "complaint",
  CUSTOM: "service_intent",
}

function resolveIntent(doc: any, meta: any): IntentId {
  if (INTENT_IDS.indexOf(meta?.intent_id) >= 0) return meta.intent_id // PRD-style, if present
  const raw = String(doc?.intent ?? "").toUpperCase()
  if (BE_INTENT_TO_CONSOLE[raw]) return BE_INTENT_TO_CONSOLE[raw]
  // keyword heuristics for unmapped BE intents
  if (raw.includes("APPOINTMENT") || raw.includes("SCHEDULE")) return "appointment_inquiry"
  if (raw.includes("ESTIMATE") || raw.includes("QUOTE") || raw.includes("PRICE")) return "pricing_quote"
  if (raw.includes("RECALL")) return "recall_response"
  if (raw.includes("COMPLAINT")) return "complaint"
  if (raw.includes("TRADE")) return "trade_in_inquiry"
  if (raw.includes("STATUS")) return "status_update"
  if (raw.includes("CALLBACK") || raw.includes("CALL")) return "callback_request"
  return "service_intent" // prod is service-oriented; safe catch-all
}

function asText(v: any): string {
  if (typeof v === "string") return v
  if (Array.isArray(v)) return v.map(asText).filter(Boolean).join(" · ")
  if (v && typeof v === "object") return asText(v.text ?? v.quote ?? v.message ?? "")
  return ""
}

export function mapBeItem(doc: any): ActionItem {
  const meta = (doc && doc.meta) || {}
  const customer = (doc && doc.customer) || {}
  const ch = meta.source_channel ?? meta.source_type ?? (meta.callSid ? "call" : undefined)
  const channel: Channel = CHANNELS.indexOf(ch) >= 0 ? ch : "call"
  const status: ActionItemStatus = doc?.is_completed
    ? "completed"
    : meta.status === "incorrect" || doc?.is_active === false
      ? "incorrect"
      : "pending"
  const createdAt = doc?.createdAt ?? doc?.created_at ?? meta.created_at ?? new Date().toISOString()
  const rawAssignee = doc?.assigned_to ?? meta.assignee_user_id
  const assignee = rawAssignee && rawAssignee !== "SYSTEM" ? String(rawAssignee) : undefined

  return {
    action_item_id: String(doc?._id ?? doc?.id ?? meta.action_item_id ?? ""),
    customer_id: String(meta.customer_id ?? customer.customer_id ?? doc?.lead_id ?? ""),
    customer_name: customer.name ?? meta.customer_name ?? undefined,
    source_channel: channel,
    intent_id: resolveIntent(doc, meta),
    is_primary_intent_of_source: meta.is_primary_intent_of_source ?? true,
    intent_recap: meta.intent_recap || asText(doc?.summary) || asText(doc?.description) || "",
    source_message: meta.source_message || asText(doc?.evidence) || asText(doc?.description) || "",
    created_at: createdAt,
    created_by_ai: meta.created_by_ai ?? true,
    status,
    assignee_user_id: assignee,
    closed_at: doc?.completedAt ?? meta.closed_at ?? undefined,
    resolution_note: meta.resolution_note ?? undefined,
    resolution_type: meta.resolution_type ?? undefined,
    incorrect_reason: meta.incorrect_reason ?? undefined,
    repeat_caller_count: Number(meta.repeat_caller_count ?? 0),
    last_observed_at: meta.last_observed_at ?? doc?.updatedAt ?? createdAt,
    escalation_reason: meta.escalation_reason ?? (doc?.time_sensitive ? "aged_past_sla" : undefined),
    // Source linkage — wire "Listen"/"Transcript" to the call + conversation.
    source_call_id: meta.callSid ?? meta.call_id ?? meta.callId ?? undefined,
    source_conversation_id: meta.conversationId ?? meta.conversation_id ?? meta.source_conversation_id ?? undefined,
  }
}

/** CUSTOMERS-style lookup ({ id: { name, phone } }) from the BE response's inline customer data. */
export function customersFromBe(docs: any[]): Record<string, { name: string; phone: string }> {
  const out: Record<string, { name: string; phone: string }> = {}
  for (const d of docs || []) {
    const c = d?.customer || {}
    const id = String(d?.meta?.customer_id ?? c.customer_id ?? d?.lead_id ?? "")
    if (!id) continue
    out[id] = {
      name: c.name ?? d?.meta?.customer_name ?? "Customer",
      phone: c.mobile ?? (Array.isArray(c.emails) ? c.emails[0] : "") ?? "",
    }
  }
  return out
}

/** USERS-style lookup ({ id: { name, initials } }) for real assignees (skips "SYSTEM"/auto). */
export function usersFromBe(docs: any[]): Record<string, { name: string; initials: string }> {
  const out: Record<string, { name: string; initials: string }> = {}
  for (const d of docs || []) {
    const id = d?.assigned_to
    if (!id || id === "SYSTEM") continue
    const name = d?.assignee_name ?? d?.meta?.assignee_name ?? String(id)
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    const initials = (parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")) : "–").toUpperCase()
    out[String(id)] = { name, initials }
  }
  return out
}
