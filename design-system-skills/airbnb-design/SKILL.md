---
name: airbnb-design
description: Apply the Airbnb design system when building UIs, websites, landing pages, web components, or mockups in Airbnb's visual style. Use whenever the user asks to design or build something "like Airbnb", or wants a warm, photography-led consumer-marketplace aesthetic on a clean white canvas with the signature Rausch pink accent, soft rounded cards, and pill-shaped search bars. Triggers include references to Airbnb, "marketplace UI", "travel/booking site", or photo-first consumer product pages.
---

# Airbnb Design System

A warm, generous, photography-led consumer marketplace: clean white canvas, near-black ink, and a single voltage of Airbnb Rausch pink carrying every primary CTA. The brand trusts photography and whitespace over typographic muscle.

## When to use
Apply when building or restyling any consumer marketplace, booking/travel, or photo-first product interface that should feel like Airbnb.

## Core tokens (cheat-sheet)
- **Canvas**: pure white `#ffffff` (no public dark mode); soft fills `#f7f7f7` / `#f2f2f2`
- **Primary (Rausch)**: `#ff385c` (active `#e00b41`, disabled `#ffd1da`) — every primary CTA, search orb, heart save state, brand links. Used scarcely.
- **Ink**: `#222222` (never pure black) / body `#3f3f3f` / muted `#6a6a6a`
- **Hairlines**: `#dddddd` / `#ebebeb`
- **Type**: Inter (sub for Airbnb Cereal VF). Modest display weights — h1 just 28px/700; the one loud moment is the 64px rating number. Body 400.
- **Radius**: buttons 8px, cards ~14px, search bar/orb/hearts fully pill (`9999px`), category strip 32px. No hard corners except the body grid.
- **Elevation**: a single shadow tier — `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px`. Depth comes from photography.

## How to apply
1. Read `reference/DESIGN.md` for the full token set, component specs (search bar, property cards, reservation card, nav, footer), and responsive rules.
2. Keep Rausch to one or two moments per page; most surfaces stay 90% white + ink.
3. Luxe purple `#460479` and Plus magenta `#92174d` are sub-brand only — never mainline.

The complete specification lives in `reference/DESIGN.md`.
