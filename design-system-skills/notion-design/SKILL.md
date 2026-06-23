---
name: notion-design
description: Apply the Notion design system when building UIs, websites, landing pages, web components, or mockups in Notion's visual style. Use whenever the user asks to design or build something "like Notion", or wants a warm, paper-calm, document-like productivity aesthetic with near-black Inter type, a single confident blue, and a playful multi-color sticker palette. Triggers include references to Notion, "paper-soft", "warm off-white canvas", or calm productivity-tool marketing.
---

# Notion Design System

A warm, paper-calm productivity system: off-white canvas, near-black Inter type, one confident blue, and a decorative-only multi-color sticker palette that does all the personality work while the chrome stays quiet.

## When to use
Apply when building or restyling any interface or marketing page that should feel like Notion — calm, document-like, productivity software.

## Core tokens (cheat-sheet)
- **Canvas**: warm paper `#f6f5f4` (page) over pure white `#ffffff` (cards/fields) — never clinical full-white pages
- **Primary (Notion blue)**: `#0075de` (pressed `#005bab`) — CTAs, links, active/focus ONLY
- **Dark hero band**: deep indigo `#213183` (single inverted "night" moment per page)
- **Ink**: `#000000` (~95% alpha) / secondary `#31302e` / muted `#615d59` / faint `#a39e98`
- **Sticker palette (DECORATIVE only)**: sky `#62aef0`, purple `#d6b6f6`, pink `#ff64c8`, orange `#dd5b00`, teal `#2a9d99`, green `#1aae39` — never paint CTAs or structure
- **Type**: Inter (sub for NotionInter), heavy 700 headlines with explicit negative tracking, 400 body at 1.5 line-height
- **Radius**: pill (`9999px`) for marketing CTAs, 8px utility buttons, 4px inputs, 12px cards
- **Elevation**: hairline `#e6e6e6` + barely-there multi-layer micro-shadows; never heavy drop shadows

## How to apply
1. Read `reference/DESIGN.md` for the full token set, component specs, elevation stack, and responsive rules.
2. Keep blue structural and scarce; let the sticker palette live only in illustrations and icon tiles.
3. Reserve the indigo "night" band for one hero moment, not repeated sections.

The complete specification lives in `reference/DESIGN.md`.
