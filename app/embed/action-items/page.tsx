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
  const [items, setItems] = useState<ActionItem[] | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState<number | null>(null)

  async function load(e: string, t: string) {
    ;(window as unknown as { __AI_SCOPE__?: object }).__AI_SCOPE__ = { env, enterpriseId: e, teamId: t, token }
    setLoading(true)
    try {
      const live = token
        ? await fetchActionItems()
        : await fetchActionItemsViaProxy(e || undefined, t || undefined)
      if (live && live.length) {
        setItems(live)
        setCount(live.length)
      } else {
        setItems(undefined)
        setCount(0)
      }
    } catch {
      setItems(undefined)
      setCount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(ent, team) // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="console-v2-sales-root w-full min-w-0 bg-spyne-page" style={{ minHeight: "100vh" }}>
      {/* Dev rooftop switcher — localhost only (hidden when a prod token is present). */}
      {!token && (
        <form
          onSubmit={(ev) => {
            ev.preventDefault()
            void load(ent, team)
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
          <button type="submit" className="spyne-btn-primary !h-7 !text-[12px]">
            {loading ? "Loading…" : "Load"}
          </button>
          <span className="text-spyne-text-muted">
            {loading
              ? "fetching…"
              : count === null
                ? "(using .env.local defaults — or mock if unreachable)"
                : count === 0
                  ? "no live items — showing mock"
                  : `live items: ${count}`}
          </span>
        </form>
      )}

      {/* key remounts the console when the dataset (or rooftop) changes */}
      <ActionItemsConsole key={items ? `live-${ent}-${team}` : "mock"} readOnly initialItems={items} />
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
