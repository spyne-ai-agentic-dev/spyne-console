"use client"

import { useState } from "react"
import { TABS, railHTML, submenuHTML, contentHTML, crumbsHTML } from "./console-data"
import { ActionItemsConsole } from "@/components/max-2/sales/console-v2/action-items"

export default function Console() {
  const [tab, setTab] = useState<string>("home")
  const [sub, setSub] = useState<Record<string, number>>({})
  const [navCollapsed, setNavCollapsed] = useState(false)

  const current = TABS.find((t: any) => t.id === tab) ?? TABS[0]
  const curSub = sub[tab] ?? 0

  // Action Items tab (ported from intelligent-console-v2 sales) — shown for both
  // Sales → Action Items and Service → Action Items.
  const activeSubLabel = current.secondary?.[curSub]?.label
  const showActionItems =
    (current.id === "sales" || current.id === "service") && activeSubLabel === "Action Items"

  return (
    <div className="app">
      {/* Primary icon rail */}
      <aside className="rail">
        <div className="rail-logo">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="7" cy="8" r="2.4" fill="#522EBF" />
            <circle cx="14" cy="6" r="2.4" fill="#6843CC" />
            <circle cx="17.5" cy="13" r="2.4" fill="#8460D9" />
            <circle cx="10" cy="15" r="2.4" fill="#AB92E8" />
          </svg>
        </div>
        <nav
          className="rail-nav"
          onClick={(e) => {
            const b = (e.target as HTMLElement).closest(".rail-item") as HTMLElement | null
            if (b?.dataset.tab) setTab(b.dataset.tab)
          }}
          dangerouslySetInnerHTML={{ __html: railHTML(tab) }}
        />
        <div className="rail-foot">
          <button className="rail-item" title="Help" style={{ width: 44, height: 44 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.6 9.6a2.5 2.5 0 014.4 1.6c0 1.7-2.5 2-2.5 3.3M12 17h.01" />
            </svg>
          </button>
          <button className="rail-avatar" title="Apex Auto Group">AA</button>
        </div>
      </aside>

      {/* Secondary contextual menu (collapsible) */}
      {!navCollapsed && (
        <aside className="submenu">
          <button
            className="nav-collapse-btn"
            title="Collapse menu"
            aria-label="Collapse menu"
            onClick={() => setNavCollapsed(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 6l-6 6 6 6M19 6l-6 6 6 6" />
            </svg>
          </button>
          <div
            className="submenu-scroll"
            onClick={(e) => {
              const b = (e.target as HTMLElement).closest(".sub-item") as HTMLElement | null
              if (b?.dataset.sub != null) setSub((s) => ({ ...s, [tab]: Number(b.dataset.sub) }))
            }}
            dangerouslySetInnerHTML={{ __html: submenuHTML(current, curSub) }}
          />
        </aside>
      )}

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            {navCollapsed && (
              <button
                className="nav-expand-btn"
                title="Expand menu"
                aria-label="Expand menu"
                onClick={() => setNavCollapsed(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 6l6 6-6 6M5 6l6 6-6 6" />
                </svg>
              </button>
            )}
            <div className="crumbs" dangerouslySetInnerHTML={{ __html: crumbsHTML(current, curSub) }} />
          </div>
          <div className="topbar-right">
            <div className="search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
              <input placeholder="Search" />
            </div>
            <button className="chip">
              <span className="dot" />
              Comprehensive
            </button>
          </div>
        </header>
        {showActionItems ? (
          <main className="content" key={`${tab}-action-items`} style={{ padding: 0 }}>
            {/* .console-v2-sales-root scopes the Sales Console V2 design system (matches
                intelligent-console-v2's sales experience wrapper) */}
            <div className="console-v2-sales-root w-full min-w-0 bg-spyne-page" style={{ minHeight: "100%" }}>
              <ActionItemsConsole />
            </div>
          </main>
        ) : (
          <main className="content" key={tab} dangerouslySetInnerHTML={{ __html: contentHTML(current) }} />
        )}
      </div>
    </div>
  )
}
