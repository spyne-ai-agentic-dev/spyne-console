---
name: linear-design
description: Apply the Linear design system when building UIs, websites, landing pages, web components, dashboards, or mockups in Linear's visual style. Use whenever the user asks to design or build something "like Linear", or wants a deep dark, near-black, product-craft aesthetic with a single lavender-blue accent. Triggers include requests referencing Linear, "dark product marketing", "software-craft" look, or dark-canvas SaaS pages.
---

# Linear Design System

A near-black, product-focused canvas with one chromatic accent: Linear lavender-blue. Dense, technical, quietly luxurious. Use this skill to style any web UI in Linear's aesthetic.

## When to use
Apply when building or restyling any interface, marketing page, or component that should look like Linear — dark-canvas SaaS, developer tooling, product-craft marketing.

## Core tokens (cheat-sheet)
- **Canvas**: `#010102` (near-pure black, faint blue tint — never `#000000`)
- **Surface ladder**: `#0f1011` → `#141516` → `#18191a` → `#191a1b`
- **Accent (lavender-blue)**: `#5e6ad2` (hover `#828fff`, focus `#5e69d1`) — brand mark, primary CTA, focus ring, link emphasis ONLY
- **Ink**: `#f7f8f8` / muted `#d0d6e0` / subtle `#8a8f98`
- **Hairlines**: `#23252a` borders carry depth (no drop shadows)
- **Type**: Inter or Geist Sans (sub for Linear's custom face); JetBrains/Geist Mono for code. Display 500–600 with aggressive negative tracking (−3px at 80px). Body 400.
- **Radius**: buttons/inputs 8px, cards 12px, screenshot panels 16px. Never pill-round CTAs.

## How to apply
1. Read `reference/DESIGN.md` in this skill for the full token set, component specs (buttons, pricing cards, nav, footer), elevation rules, and responsive behavior.
2. Default to dark mode — Linear ships no light marketing theme.
3. Use the surface ladder + hairlines for hierarchy, not shadows.
4. Keep lavender scarce; never use it as a section background or card fill. No second chromatic accent, no atmospheric gradients.
5. Lead sections with product UI screenshots framed in 16px dark panels.

The complete specification lives in `reference/DESIGN.md`.
