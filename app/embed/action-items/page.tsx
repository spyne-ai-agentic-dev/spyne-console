"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ActionItemsConsole } from "@/components/max-2/sales/console-v2/action-items"
import { fetchActionItems, fetchActionItemsViaProxy } from "@/components/max-2/sales/console-v2/action-items/be-client"
import type { ActionItem } from "@/components/max-2/sales/console-v2/action-items/data"

/**
 * Embed target for the converse-ai iframe section.
 *  - PROD iframe: token in the URL → fetch backend directly (be-client).
 *  - Localhost/dev: no token → fetch via the same-origin /api/action-items proxy
 *    (creds in .env.local, no CORS). A dev bar lets you enter enterpriseId/teamId
 *    to run any rooftop (empty = .env.local defaults). Read-only / GET-only.
 */
function ActionItemsEmbed() {
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const env = params.get("env") ?? "prod"

  const [ent, setEnt] = useState(params.get("enterpriseId") ?? "")
  const [team, setTeam] = useState(params.get("teamId") ?? "")
  // Department scope (sales|service|all). Prod iframe passes ?department= / ?serviceType= / ?tab=.
  const [dept, setDept] = useState(params.get("department") ?? params.get("serviceType") ?? params.get("tab") ?? "all")
  const [items, setItems] = useState<ActionItem[] | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load(e: string, t: string, d: string) {
    ;(window as unknown as { __AI_SCOPE__?: object }).__AI_SCOPE__ = { env, enterpriseId: e, teamId: t, token, department: d }
    setLoading(true)
    setError(null)
    try {
      const live = token
        ? await fetchActionItems()
        : await fetchActionItemsViaProxy(e || undefined, t || undefined)
      // Always reflect the REAL result for the requested scope — an empty array renders the
      // console's empty state (never the bundled mock), so a 0-result or wrong scope is obvious.
      setItems(Array.isArray(live) ? live : [])
      setCount(Array.isArray(live) ? live.length : 0)
    } catch (err) {
      setItems([])
      setCount(null)
      setError(String((err as Error)?.message || err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(ent, team, dept) // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="console-v2-sales-root flex h-screen w-full min-w-0 flex-col overflow-hidden bg-spyne-page">
      {/* Dev rooftop switcher — localhost only (hidden when a prod token is present). */}
      {!token && (
        <form
          onSubmit={(ev) => {
            ev.preventDefault()
            void load(ent, team, dept)
          }}
          className="flex flex-wrap items-center gap-2 border-b border-spyne-border bg-spyne-surface px-4 py-2 text-[12px]"
        >
          <span className="font-semibold text-spyne-text-secondary">Enterprise</span>
          <input
            value={ent}
            onChange={(e) => setEnt(e.target.value)}
            placeholder="enterpriseId"
            className="spyne-input !h-7 w-48"
          />
          <span className="font-semibold text-spyne-text-secondary">Team</span>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="teamId"
            className="spyne-input !h-7 w-48"
          />
          <span className="font-semibold text-spyne-text-secondary">Department</span>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="spyne-input spyne-focus-ring !h-7 cursor-pointer"
            style={{ paddingRight: 22 }}
          >
            <option value="all">All</option>
            <option value="sales">Sales</option>
            <option value="service">Service</option>
          </select>
          <button type="submit" className="spyne-btn-primary !h-7 !text-[12px]">
            {loading ? "Loading…" : "Load"}
          </button>
          {(() => {
            const scopeLabel = `${ent || "default ent"} / ${team || "default team"}${dept !== "all" ? ` · ${dept}` : ""}`
            if (loading) return <span className="text-spyne-text-muted">fetching {scopeLabel}…</span>
            if (error) return <span style={{ color: "var(--spyne-danger-text)" }}>couldn’t load {scopeLabel}: {error}</span>
            if (count === 0) return <span style={{ color: "var(--spyne-warning-text)" }}>no action items for {scopeLabel}</span>
            if (count != null) return <span className="text-spyne-text-muted">{count} action items · {scopeLabel}</span>
            return <span className="text-spyne-text-muted">{scopeLabel}</span>
          })()}
        </form>
      )}

      {/* Real data only: `items` is the fetched array ([] = empty state), never mock.
          key remounts the console when the scope (rooftop/department) changes.
          Side + bottom padding gives the full UI (and the inbox grid) breathing room. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-max2-page pb-3 pt-3">
        {items === undefined ? (
          <div className="flex items-center justify-center py-24 text-[13px] text-spyne-text-muted">Loading action items…</div>
        ) : (
          <ActionItemsConsole key={`live-${ent}-${team}-${dept}`} readOnly initialItems={items} initialDept={dept} />
        )}
      </div>
    </div>
  )
}

export default function ActionItemsEmbedPage() {
  return (
    <Suspense fallback={null}>
      <ActionItemsEmbed />
    </Suspense>
  )
}
