"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ActionItemsConsole } from "@/components/max-2/sales/console-v2/action-items"
import { fetchActionItems } from "@/components/max-2/sales/console-v2/action-items/be-client"
import type { ActionItem } from "@/components/max-2/sales/console-v2/action-items/data"

/**
 * Embed target for the converse-ai iframe section. The host builds the src as:
 *   {NEXT_PUBLIC_NEW_ACTION_ITEMS_URL}/embed/action-items?env=&enterpriseId=&teamId=&token=
 *
 * Renders ONLY the ActionItemsConsole (no spyne shell), READ-ONLY + GET-only:
 * - scope/auth are read from the URL params and exposed on window.__AI_SCOPE__
 * - mock data renders immediately; when scope+token are present a GET fetches live
 *   items and the console is remounted (via `key`) with them. Any no-scope/error
 *   path simply keeps the mock data, so the embed always renders something.
 */
function ActionItemsEmbed() {
  const params = useSearchParams()
  const [items, setItems] = useState<ActionItem[] | undefined>(undefined)

  useEffect(() => {
    const scope = {
      env: params.get("env") ?? "prod",
      enterpriseId: params.get("enterpriseId") ?? "",
      teamId: params.get("teamId") ?? "",
      token: params.get("token") ?? "",
    }
    ;(window as unknown as { __AI_SCOPE__?: typeof scope }).__AI_SCOPE__ = scope

    let cancelled = false
    ;(async () => {
      try {
        const live = await fetchActionItems() // null when no scope
        if (!cancelled && live && live.length) setItems(live)
      } catch {
        // any GET failure → keep the mock fallback (items stays undefined)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params])

  return (
    <div className="console-v2-sales-root w-full min-w-0 bg-spyne-page" style={{ minHeight: "100vh" }}>
      {/* read-only: GET-only embed — write CTAs hidden. key remounts when live data arrives. */}
      <ActionItemsConsole key={items ? "live" : "mock"} readOnly initialItems={items} />
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
