# Spyne Design System

A token-driven design system for the Spyne Retail Suite. Built in Figma, with three foundational layers — **primitives** (raw values), **semantic tokens** (purpose-named, mode-aware), and **components** (which consume only the semantic layer).

> **Source of truth:** the Figma file (`WhiruQHsdVqXKh9BbV9sM6`). This document is a generated snapshot — regenerate and overwrite it after meaningful changes rather than creating new versions.

---

## Table of contents

1. [Foundations](#foundations)
2. [Color](#color)
3. [Typography](#typography)
4. [Radius](#radius)
5. [Spacing & dimensions](#spacing--dimensions)
6. [Gradients & effects](#gradients--effects)
7. [Icons](#icons)
8. [Components](#components)
9. [Token naming convention](#token-naming-convention)
10. [Pages in the file](#pages-in-the-file)

---

## Foundations

The system is organized into variable **collections**, several of which are **mode-aware** (they hold different values per mode, e.g. desktop vs mobile, enabling responsive output).

| Collection | Modes | Variables |
|---|---|---|
| `primitives.color` | value | 80 |
| `primitives.dimension` | value | 17 |
| `primitives.radius` | value | 24 |
| `primitives.typography` | value | 48 |
| `primitives.number` | value | 17 |
| `primitives.shadow` | value | 5 |
| `primitives.breakpoint` | value | 6 |
| `semantic.color` | light | 85 |
| `semantic.dimension` | mobile, desktop | 30 |
| `semantic.radius` | default, rounded, no-corner-radius | 10 |
| `semantic.typography` | desktop, mobile | 126 |
| `semantic.elevation` | light | 9 |
| `semantic.number` | value | 6 |
| `semantic.breakpoint` | mobile, desktop | 8 |

**Principle:** components reference **semantic** tokens only. Semantic tokens alias **primitives**. This means a brand re-color or a light/dark adjustment happens once at the semantic layer and propagates everywhere.

---

## Color

### Brand

The brand primary is **`#522EBF`** (`color/brand/600`). Accent is `#6843CC` (`color/brand/500`).

**Brand ramp**

| Token | Hex |
|---|---|
| `color/brand/50` | `#F1EDFB` |
| `color/brand/100` | `#E4DCF8` |
| `color/brand/200` | `#C9B9F0` |
| `color/brand/300` | `#AB92E8` |
| `color/brand/400` | `#8460D9` |
| `color/brand/500` | `#6843CC` |
| `color/brand/600` | `#522EBF` *(brand primary)* |
| `color/brand/700` | `#44259E` |
| `color/brand/800` | `#371E7E` |
| `color/brand/900` | `#291661` |
| `color/brand/950` | `#1A0E40` |

### Primitive ramps

Raw color values. **Do not use directly in components** — use the semantic tokens below. Each family runs 50 → 950.

- **Gray** — `#FAFAFF` (50) → `#F1F1F5`, `#E1E3E9`, `#C4C2D1`, `#AAA8BD`, `#86839A`, `#68657A`, `#4C495D`, `#343241`, `#262C42`, `#1F1E2A` (950)
- **Success** (green) — `#EBFAF3` (50) → `#00A251` (600) → `#00351A` (950)
- **Danger** (red) — `#FFF5F5` (50) → `#D92D20` (600) → `#450505` (950)
- **Info** (blue) — `#F0F9FF` (50) → `#0284C7` (600) → `#082F49` (950)
- **Pending** (amber) — `#FFF7ED` (50) → `#EA580C` (600) → `#431407` (950)
- **Chart** — `#522EBF`, `#00A251`, `#F59E0B`, `#0EA5E9`, `#F04438`
- **Base** — `color/white` `#FFFFFF`, `color/black` `#000000`, `color/transparent`

> **Note:** there is no `warning` family — it was intentionally removed. Use **`pending`** (amber) for pending/attention states and **`info`** (blue) for informational states.

### Semantic colors

Purpose-named tokens components actually use. Each aliases a primitive (shown in the "→" column).

#### Surface (backgrounds)

| Token | → Primitive | Hex |
|---|---|---|
| `surface/bg/canvas` | brand/gray 50 | `#FAFAFF` |
| `surface/bg/default` | white | `#FFFFFF` |
| `surface/bg/raised` | white | `#FFFFFF` |
| `surface/bg/overlay` | white | `#FFFFFF` |
| `surface/bg/sunken` | gray/100 | `#F1F1F5` |
| `surface/bg/disabled` | gray/100 | `#F1F1F5` |
| `surface/bg/brand` | brand/600 | `#522EBF` |
| `surface/bg/brand/hover` | brand/700 | `#44259E` |
| `surface/bg/brand/pressed` | brand/800 | `#371E7E` |
| `surface/bg/brand/subtle` | brand/50 | `#F1EDFB` |
| `surface/bg/brand/subtle/hover` | brand/100 | `#E4DCF8` |
| `surface/bg/brand/subtle/pressed` | brand/200 | `#C9B9F0` |
| `surface/bg/accent` | brand/500 | `#6843CC` |
| `surface/bg/accent/subtle` | brand/50 | `#F1EDFB` |
| `surface/bg/selected` | brand/50 | `#F1EDFB` |
| `surface/bg/selected/hover` | brand/100 | `#E4DCF8` |
| `surface/bg/selected/pressed` | brand/200 | `#C9B9F0` |
| `surface/bg/success` | success/600 | `#00A251` |
| `surface/bg/success/subtle` | success/50 | `#EBFAF3` |
| `surface/bg/danger` | danger/600 | `#D92D20` |
| `surface/bg/danger/subtle` | danger/50 | `#FFF5F5` |
| `surface/bg/info` | info/600 | `#0284C7` |
| `surface/bg/info/subtle` | info/50 | `#F0F9FF` |
| `surface/bg/pending` | pending/500 | `#F97316` |
| `surface/bg/pending/subtle` | pending/50 | `#FFF7ED` |

#### Text

| Token | → Primitive | Hex |
|---|---|---|
| `text/default` | gray/900 | `#262C42` |
| `text/subtle` | gray/700 | `#4C495D` |
| `text/muted` | gray/500 | `#86839A` |
| `text/disabled` | gray/400 | `#AAA8BD` |
| `text/inverse` | white | `#FFFFFF` |
| `text/brand` | brand/600 | `#522EBF` |
| `text/brand/inverse` | brand/200 | `#C9B9F0` |
| `text/accent` | brand/600 | `#522EBF` |
| `text/success` | success/700 | `#008743` |
| `text/danger` | danger/700 | `#B42318` |
| `text/info` | info/700 | `#0369A1` |
| `text/pending` | pending/700 | `#C2410C` |
| `text/on-brand` | white | `#FFFFFF` |
| `text/on-accent` | white | `#FFFFFF` |
| `text/on-success` | white | `#FFFFFF` |
| `text/on-danger` | white | `#FFFFFF` |
| `text/on-info` | white | `#FFFFFF` |
| `text/on-pending` | gray/900 | `#262C42` |

#### Icon

Icon tokens carry a `STROKE_COLOR` scope (the icon library is stroke-based / Lucide).

| Token | → Primitive | Hex |
|---|---|---|
| `icon/default` | gray/700 | `#4C495D` |
| `icon/subtle` | gray/500 | `#86839A` |
| `icon/muted` | gray/400 | `#AAA8BD` |
| `icon/disabled` | gray/400 | `#AAA8BD` |
| `icon/inverse` | white | `#FFFFFF` |
| `icon/brand` | brand/600 | `#522EBF` |
| `icon/accent` | brand/500 | `#6843CC` |
| `icon/success` | success/600 | `#00A251` |
| `icon/danger` | danger/600 | `#D92D20` |
| `icon/info` | info/600 | `#0284C7` |
| `icon/pending` | pending/600 | `#EA580C` |
| `icon/on-brand` · `icon/on-accent` · `icon/on-success` · `icon/on-danger` · `icon/on-info` | white | `#FFFFFF` |
| `icon/on-pending` | gray/900 | `#262C42` |

#### Border

| Token | → Primitive | Hex |
|---|---|---|
| `border/default` | gray/200 | `#E1E3E9` |
| `border/subtle` | gray/100 | `#F1F1F5` |
| `border/strong` | gray/300 | `#C4C2D1` |
| `border/disabled` | gray/200 | `#E1E3E9` |
| `border/brand` | brand/600 | `#522EBF` |
| `border/accent` | brand/500 | `#6843CC` |
| `border/selected` | brand/600 | `#522EBF` |
| `border/focus` | brand/500 | `#6843CC` |
| `border/focus-subtle` | brand/200 | `#C9B9F0` |
| `border/success` | success/600 | `#00A251` |
| `border/danger` | danger/600 | `#D92D20` |
| `border/info` | info/600 | `#0284C7` |
| `border/pending` | pending/500 | `#F97316` |

#### Background

| Token | → Primitive | Hex |
|---|---|---|
| `background/neutral` | gray/100 | `#F1F1F5` |
| `background/inverse` | gray/900 | `#262C42` |
| `background/white` | white | `#FFFFFF` |

#### Overlay

Scrims for modals/dialogs. The two `backdrop` tokens carry alpha and are designed to pair with the `overlay/backdrop-blur` effect style (2px). Blur is an effect, not a color value, so it lives as a separate style.

| Token | → Primitive | Value |
|---|---|---|
| `overlay/default` | gray/950 | `#1F1E2A` |
| `overlay/strong` | black | `#000000` |
| `overlay/backdrop` | overlay/backdrop | `#141028` @ 35% — pair with 2px blur |
| `overlay/backdrop-light` | overlay/backdrop-light | `#FFFFFF` @ 25% — pair with 2px blur |

#### Chart

`chart/1`–`chart/5`: `#522EBF`, `#00A251`, `#F59E0B`, `#0EA5E9`, `#F04438`.

---

## Typography

Fonts: **Inter** (Regular / Medium / Semi Bold / Bold) for UI; **JetBrains Mono** (Medium) for code and token names.

All 18 text styles bind their font size to typography **variables that have desktop & mobile modes** — text is genuinely responsive (resizes per mode).

| Style | Size (desktop) | Weight | Line height |
|---|---|---|---|
| `display` | 48 | Bold | 56 |
| `display/lg` | 40 | Bold | 48 |
| `heading/h1` | 36 | Bold | 44 |
| `display/md` | 32 | Bold | 40 |
| `heading/h2` | 30 | Semi Bold | 38 |
| `heading/h2-lg` | 26 | Semi Bold | 34 |
| `heading/h3` | 24 | Semi Bold | 32 |
| `heading/h4` | 20 | Semi Bold | 28 |
| `title/lg` | 18 | Semi Bold | 28 |
| `body/lg` | 18 | Medium | 28 |
| `title/md` | 16 | Semi Bold | 24 |
| `body/md` | 16 | Medium | 24 |
| `body/sm` | 14 | Medium | 20 |
| `code/md` | 14 | Regular (mono) | 20 |
| `caption` | 12 | Medium | 16 |
| `code/sm` | 12 | Regular (mono) | 16 |
| `caption-xs` | 10 | Medium | 14 |
| `micro` | 8 | Medium | 12 |

---

## Radius

| Token | Value |
|---|---|
| `radius/control/xs` | 4 |
| `radius/control/sm` | 8 |
| `radius/control/md` | 12 |
| `radius/control/lg` | 16 |
| `radius/container/sm` | 8 |
| `radius/container/md` | 12 |
| `radius/container/lg` | 16 |
| `radius/container/xl` | 20 |
| `radius/dialog` | 24 |
| `radius/pill` | 9999 |

`semantic.radius` has three modes — **default**, **rounded**, and **no-corner-radius** — so the whole system's roundness can be re-themed at once.

---

## Spacing & dimensions

`semantic.dimension` is **mode-aware (mobile / desktop)**. Spacing is grouped by intent.

**Control heights** — small `40`, medium `44`, large `48`.

**Space scale** (desktop values; `inline`, `inset`, `stack` share the scale):

| Step | Value |
|---|---|
| none | 0 |
| xs | 8 |
| sm | 12 |
| md | 16 |
| lg | 24 |
| xl | 32 |
| 2xl | 40–48 |

**Section spacing** (page rhythm): sm `48`, md `64`, lg `80`, xl `96`, 2xl/3xl `128`.

---

## Gradients & effects

Gradients can't be stored as variables in Figma, so they're **shared paint styles**. Apply to text fills, shape/CTA fills, and icon strokes.

| Paint style | Description |
|---|---|
| `gradient/brand` | Primary brand gradient |
| `gradient/brand-hover` | Hover state of the brand gradient |
| `gradient/brand-spectrum` | 9-stop multi-color spectrum: blue `#5BBFF6` → purple `#7F6AF2` → pink → orange `#ED8939` |

**Effect styles**

| Effect style | Value |
|---|---|
| `overlay/backdrop-blur` | 2px background blur — pair with `overlay/backdrop` or `overlay/backdrop-light` on modal scrims |

---

## Icons

- **1,964 icon component sets** (Lucide-based, stroke icons) on the **Icons** page, arranged in an alphabetical grid.
- Each icon is a component set with a **`size` variant: 16 / 24 / 32 px**.
  - `size=16` → 1px stroke
  - `size=24` → 2px stroke
  - `size=32` → 2px stroke
- Icon strokes bind to `icon/*` tokens (default `icon/default`), so they recolor with the system.

**Social icons** — a separate set of 20 brand marks (X, GitHub, Google, Facebook, LinkedIn, YouTube, Instagram, Apple, Discord, Figma, Dribbble, Slack, TikTok, WhatsApp, Twitch, Telegram, Pinterest, Reddit, Medium, GitLab). Each has a **`style` toggle: mono** (bound to `icon/default`) **and brand** (official brand colors; multi-color logos keep their palettes).

---

## Components

Each lives on its own page. All are auto-layout based and bound to semantic tokens; most expose state/size/variant properties.

| Component | Notable props / notes |
|---|---|
| **Button** | appearance (primary/…), tone, size (small/medium/large), state |
| **Input** | Text Input, Form Field, Phone Input, OTP, Textarea, Search Field, Command Item, dropdown select, File Upload, Accordion. States: default / filled / error / disabled |
| **Checkbox** | icon-based; checked × size (16/24) × state |
| **Radio** | icon-based; selected × size (16/24) × state |
| **Toggle** | on/off × default/disabled |
| **Badge** | 6 tones (neutral, brand, success, danger, info, **pending**) × solid/subtle = 12 variants |
| **Avatar** | size sm/md/lg/xl × initials/placeholder/image |
| **Tooltip** | — |
| **Segmented Control** | — |
| **Menu** | — |
| **Stepper** | — |
| **Tabs** | — |
| **Slider** | — |
| **Pagination** | — |
| **Progress** | — |
| **Modal** | pairs with `overlay/backdrop` + `overlay/backdrop-blur` |
| **Separator** | orientation (h/v) × dashed × with-text |
| **Navigation** | — |
| **Calendar** | day cell + assembled calendars (single, week-nums, range, 2-month, range+presets, time picker, inline) |
| **Data Table** | Desktop (toolbar, sortable header, rows with avatar/badge/checkbox, pagination footer) + Loading skeleton |
| **Confirmation Card** | — |
| **Charts** | uses `chart/1`–`chart/5` |

---

## Token naming convention

Token names read **left to right** from broad to specific, separated by `/`:

```
surface / bg / brand
   │        │      └─ variant  — which version (brand-colored)
   │        └──────── role     — the job it does (a background fill)
   └───────────────── category — what it's for (surfaces / backgrounds)
```

So `surface/bg/brand` = "the brand-colored background fill." The same **category → role → variant** pattern repeats across `text/muted`, `icon/danger`, `border/subtle`, etc.

---

## Pages in the file

`Design System` · `Tokens Guide` · `Colors` · `Icons` · `Button` · `Typography` · `Input` · `Checkbox` · `Radio` · `Toggle` · `Badge` · `Tooltip` · `Avatar` · `Calendar` · `Segmented Control` · `Menu` · `Stepper` · `Tabs` · `Slider` · `Pagination` · `Progress` · `Modal` · `Separator` · `Navigation` · `Data Table` · `Confirmation Card` · `Charts` · `Brand Gradient` · `Social Icons`

---

## Maintaining this document

This `.md` is a **static snapshot**, not a live mirror of Figma. When the system changes:

1. Regenerate this file and **overwrite** the same `design-system.md` (don't create `v2`, `v3`).
2. Share it via a **link** (Git repo or a cloud-drive link to this one file) rather than as an attachment, so regenerating it updates what everyone sees.
3. The genuinely syncable layer is **variables/tokens** — those can be pulled programmatically via the Figma Variables REST API, Tokens Studio, or Style Dictionary if you want automated token export.

*Snapshot generated from Figma file `WhiruQHsdVqXKh9BbV9sM6`.*
