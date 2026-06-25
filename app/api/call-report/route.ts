import { NextResponse } from "next/server"

/**
 * LOCAL/DEV proxy → conversational-ai-backend end-call report (call detail).
 *   GET /api/call-report?callId=...  →  GET {base}/conversation/vapi/end-call-report-by-id?callId=...
 * The upstream is public (no auth), but we still pass the env bearer if present. No CORS.
 */
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const base = process.env.PROD_AI_API_BASE_URL
  if (!base) return NextResponse.json({ error: "proxy_not_configured" }, { status: 503 })
  const callId = new URL(req.url).searchParams.get("callId")
  if (!callId) return NextResponse.json({ error: "missing_callId" }, { status: 400 })

  const target = `${base}/conversation/vapi/end-call-report-by-id?callId=${encodeURIComponent(callId)}`
  const token = process.env.PROD_AI_BEARER_TOKEN
  try {
    const res = await fetch(target, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: "no-store",
    })
    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } })
  } catch (e: any) {
    return NextResponse.json({ error: "upstream_unreachable", detail: String(e?.message || e) }, { status: 502 })
  }
}
