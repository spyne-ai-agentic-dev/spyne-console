"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ActionItemsConsole } from "@/components/max-2/sales/console-v2/action-items"

/**
 * Embed target for the converse-ai iframe section.
 *
 * converse-ai builds the src as:
 *   {NEXT_PUBLIC_NEW_ACTION_ITEMS_URL}/embed/action-items?env=&enterpriseId=&teamId=&token=
 * (mirroring the appointments/reports iframe sections). We read that scope + auth
 * here and render ONLY the ActionItemsConsole inside its design-system root — no
 * spyne-console shell (rail/submenu). Read-only: GET-only data, no write actions.
 */
function ActionItemsEmbed() {
  const params = useSearchParams()
  const scope = {
    env: params.get("env") ?? "prod",
    enterpriseId: params.get("enterpriseId") ?? "",
    teamId: params.get("teamId") ?? "",
    token: params.get("token") ?? "",
  }

  // Surface scope to the (forthcoming) GET-only data layer without prop-drilling
  // through the large ActionItemsConsole tree. The data layer reads window.__AI_SCOPE__.
  if (typeof window !== "undefined") {
    ;(window as unknown as { __AI_SCOPE__?: typeof scope }).__AI_SCOPE__ = scope
  }

  return (
    <div className="console-v2-sales-root w-full min-w-0 bg-spyne-page" style={{ minHeight: "100vh" }}>
      <ActionItemsConsole />
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
