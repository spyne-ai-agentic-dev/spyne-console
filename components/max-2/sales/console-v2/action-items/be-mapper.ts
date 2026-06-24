/**
 * Maps conversational-ai-backend action-item docs → the console's ActionItem shape.
 * Defensive: every field has a fallback so a sparse/unknown BE shape never throws.
 * PRD fields ride in the BE `meta{}` bag (schema is strict:false).
 */
import type { ActionItem, Channel, IntentId, ActionItemStatus } from "./data"

const INTENT_IDS: IntentId[] = [
  "pricing_quote", "recall_response", "callback_request", "status_update",
  "appointment_inquiry", "service_intent", "vehicle_inquiry", "trade_in_inquiry",
  "complaint", "sms_takeover", "specific_salesperson", "compliance_alert", "no_show",
]
const CHANNELS: Channel[] = ["call", "sms", "chat", "email", "hitl_takeover", "hitl_warm_transfer"]

function initialsOf(name: string): string {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "–"
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

export function mapBeItem(doc: any): ActionItem {
  const meta = (doc && doc.meta) || {}
  const customer = (doc && doc.customer) || {}
  const intentId: IntentId = INTENT_IDS.indexOf(meta.intent_id) >= 0 ? meta.intent_id : "status_update"
  const ch = meta.source_channel ?? meta.source_type
  const channel: Channel = CHANNELS.indexOf(ch) >= 0 ? ch : "call"
  const status: ActionItemStatus = doc?.is_completed
    ? "completed"
    : meta.status === "incorrect"
      ? "incorrect"
      : "pending"
  const createdAt = doc?.createdAt ?? doc?.created_at ?? meta.created_at ?? new Date().toISOString()

  return {
    action_item_id: String(doc?._id ?? doc?.id ?? meta.action_item_id ?? ""),
    customer_id: String(meta.customer_id ?? customer.customer_id ?? doc?.lead_id ?? ""),
    customer_name: customer.name ?? meta.customer_name ?? undefined,
    source_channel: channel,
    intent_id: intentId,
    is_primary_intent_of_source: meta.is_primary_intent_of_source ?? true,
    intent_recap: meta.intent_recap ?? doc?.description ?? "",
    source_message: meta.source_message ?? "",
    created_at: createdAt,
    created_by_ai: meta.created_by_ai ?? true,
    status,
    assignee_user_id: doc?.assigned_to ?? meta.assignee_user_id ?? undefined,
    closed_at: doc?.completedAt ?? meta.closed_at ?? undefined,
    resolution_note: meta.resolution_note ?? undefined,
    resolution_type: meta.resolution_type ?? undefined,
    incorrect_reason: meta.incorrect_reason ?? undefined,
    repeat_caller_count: Number(meta.repeat_caller_count ?? 0),
    last_observed_at: meta.last_observed_at ?? createdAt,
    escalation_reason: meta.escalation_reason ?? undefined,
  }
}

/** Derive a CUSTOMERS-style lookup ({ id: { name, phone } }) from the BE response's inline customer data. */
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

/** Derive a USERS-style lookup ({ id: { name, initials } }) for assignees present in the BE response. */
export function usersFromBe(docs: any[]): Record<string, { name: string; initials: string }> {
  const out: Record<string, { name: string; initials: string }> = {}
  for (const d of docs || []) {
    const id = d?.assigned_to
    if (!id) continue
    const name = d?.assignee_name ?? d?.meta?.assignee_name ?? String(id)
    out[String(id)] = { name, initials: initialsOf(name) }
  }
  return out
}
