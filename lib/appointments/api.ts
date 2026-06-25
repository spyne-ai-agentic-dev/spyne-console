import type { Meeting, ServiceType } from "./types";
import type { CallReportData } from "@/types/call-record";
import type { IframeConfig } from "./config";
import { getMeetings } from "./data";

export interface FetchResult {
  meetings: Meeting[];
  source: "live" | "demo";
}

// ── shared request helpers ──────────────────────────────────────────────
// Every live call goes through these, so the base URL always comes from the
// single env→baseURL map in config (config.apiBase, derived from ?env=) and
// auth is built one way. Add new endpoints here, not with their own base.
function authHeaders(config: IframeConfig): HeadersInit {
  const auth = config.token.startsWith("Bearer ") ? config.token : `Bearer ${config.token}`;
  return { Authorization: auth, Accept: "application/json" };
}

function apiUrl(config: IframeConfig, path: string, params: Record<string, string | undefined> = {}): string {
  const url = new URL(`${config.apiBase}${path}`);
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") url.searchParams.set(k, v);
  return url.toString();
}

// ── appointments ─────────────────────────────────────────────────────────
// Short-lived in-memory cache so re-visiting a range you just viewed (e.g.
// prev → next → prev) doesn't refetch. Keyed by team + type + date range.
const TTL_MS = 60_000;
const meetingsCache = new Map<string, { at: number; meetings: Meeting[] }>();

// With config → call the env's API directly from the browser. Without config →
// bundled demo fixtures. Direct calls require the API to allow the iframe origin.
// Always range-scoped (startDate/endDate); pages through so a busy window is not
// silently truncated; abortable via opts.signal; cached for TTL_MS.
export async function fetchMeetings(
  config: IframeConfig | null,
  params: { serviceType: ServiceType; startDate?: Date; endDate?: Date },
  opts: { signal?: AbortSignal } = {},
): Promise<FetchResult> {
  const { serviceType, startDate, endDate } = params;

  if (!config) {
    return { meetings: getMeetings({ serviceType, startDate, endDate }), source: "demo" };
  }

  const key = [
    config.apiBase,
    config.enterpriseId,
    config.teamId,
    serviceType,
    startDate?.toISOString() ?? "",
    endDate?.toISOString() ?? "",
  ].join("|");
  const cached = meetingsCache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return { meetings: cached.meetings, source: "live" };
  }

  // Page through the range so a window with >pageSize meetings isn't truncated.
  const PAGE_SIZE = 200;
  const MAX_PAGES = 20; // safety cap (≈4000 meetings) — never unbounded
  const meetings: Meeting[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(
      apiUrl(config, "/leads/dealer/v3/meetings", {
        enterpriseId: config.enterpriseId,
        teamId: config.teamId,
        serviceType,
        sortBy: "meeting_start_time",
        sortOrder: "asc",
        page: String(page),
        pageSize: String(PAGE_SIZE),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      }),
      { headers: authHeaders(config), cache: "no-store", signal: opts.signal },
    );
    if (!res.ok) throw new Error(`Couldn't load appointments (${res.status})`);
    const json = await res.json().catch(() => ({}));
    const batch = (json?.data ?? []) as Meeting[];
    meetings.push(...batch);
    if (!json?.pagination?.hasNextPage || batch.length === 0) break;
  }

  meetingsCache.set(key, { at: Date.now(), meetings });
  return { meetings, source: "live" };
}

// ── booking conversation (transcript) ──────────────────────────────────
export type ChatRole = "ai" | "customer" | "system";
export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string | null; // SMS has it; calls are null
}
export interface Conversation {
  conversationId: string;
  type: string; // "call" | "sms" | future
  status?: string; // completed | in_progress | …
  audioUrl?: string | null; // present for calls
  createdAt?: string;
  messages: ChatMessage[];
}

// A conversation/transcript doesn't change once an appointment is booked, so we
// cache each fetched conversation for a few minutes. Re-opening the same appt
// (or revisiting it) is then instant, without re-hitting the API every time.
const CONV_TTL_MS = 5 * 60_000;
const convCache = new Map<string, { at: number; conv: Conversation | null }>();

// Single conversation for an appointment. The endpoint takes EITHER callId OR
// conversationId (never both): call-booked meetings carry a callId, SMS/chat-
// booked ones carry a conversationId. Prefer callId when present. Returns null
// when the appt has neither (CRM/floor-booked) or none is found.
export async function fetchConversation(config: IframeConfig | null, m: Meeting): Promise<Conversation | null> {
  const lookup = m.callId ? { callId: m.callId } : m.conversationId ? { conversationId: m.conversationId } : null;
  if (!lookup) return null;

  if (!config) return mockConversation(m);

  const cacheKey = [config.apiBase, config.enterpriseId, config.teamId, m.callId ?? "", m.conversationId ?? ""].join("|");
  const cached = convCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CONV_TTL_MS) return cached.conv;

  const res = await fetch(
    apiUrl(config, "/conversation/dealer-conversation/messages", {
      enterpriseId: config.enterpriseId,
      teamId: config.teamId,
      ...lookup,
      page: "1",
      limit: "5",
    }),
    { headers: authHeaders(config), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Couldn't load conversation (${res.status})`);
  const json = await res.json().catch(() => ({}));
  const c = json?.conversations?.[0];
  const conv: Conversation | null = c
    ? {
        conversationId: c.conversationId,
        type: c.type,
        status: c.status,
        audioUrl: c.audioUrl ?? null,
        createdAt: c.createdAt,
        messages: (c.messages ?? []) as ChatMessage[],
      }
    : null;
  convCache.set(cacheKey, { at: Date.now(), conv });
  return conv;
}

function mockConversation(m: Meeting): Conversation {
  const name = m.customerData?.name || "there";
  const v = m.proposedVinsData?.[0] || m.meta?.vehicles?.[0];
  const veh = v ? [v.year, v.make, v.model].filter(Boolean).join(" ") : "the vehicle";
  return {
    conversationId: m.conversationId ?? "demo",
    type: "sms",
    status: "completed",
    audioUrl: null,
    createdAt: m.createdAt,
    messages: [
      { role: "ai", content: `Hi ${name}, is the ${veh} still on your list? Happy to set up a visit.`, timestamp: m.createdAt },
      { role: "customer", content: `Yes — what times do you have?`, timestamp: m.createdAt },
      { role: "ai", content: `I can do tomorrow afternoon or the next morning. Reply STOP to opt out.`, timestamp: m.createdAt },
      { role: "customer", content: `Afternoon works.`, timestamp: m.createdAt },
      { role: "ai", content: `Great, you're booked. We'll have everything ready. See you then!`, timestamp: m.createdAt },
    ],
  };
}

// ── end-call report (rich call details) ─────────────────────────────────
// Powers the in-app call-details drawer. The console fetches this same endpoint
// unauthenticated/same-origin; we route it through our env base + Bearer auth.
// Cached for a few minutes like conversations (a finished call's report is stable).
const reportCache = new Map<string, { at: number; report: CallReportData | null }>();

export async function fetchCallReport(config: IframeConfig | null, callId: string): Promise<CallReportData | null> {
  if (!config || !callId) return null;

  const cacheKey = [config.apiBase, callId].join("|");
  const cached = reportCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CONV_TTL_MS) return cached.report;

  const res = await fetch(
    apiUrl(config, "/conversation/vapi/end-call-report-by-id", { callId }),
    { headers: authHeaders(config), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Couldn't load call report (${res.status})`);
  const json = await res.json().catch(() => null);
  const report = (json ?? null) as CallReportData | null;
  reportCache.set(cacheKey, { at: Date.now(), report });
  return report;
}

// ── dealer timezone (team working-days) ─────────────────────────────────
// All UI timestamps render in the dealer's local time. Resolved once per team
// from get-working-days (data.timezone, IANA), on the same env-mapped base.
const DEMO_TZ = "America/New_York";

export async function fetchTeamTimezone(config: IframeConfig | null): Promise<string> {
  if (!config) return DEMO_TZ;
  const res = await fetch(
    apiUrl(config, "/user-management/v1/team/get-working-days", { teamId: config.teamId }),
    { headers: authHeaders(config), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Couldn't load team timezone (${res.status})`);
  const json = await res.json().catch(() => ({}));
  return json?.data?.timezone || DEMO_TZ;
}
