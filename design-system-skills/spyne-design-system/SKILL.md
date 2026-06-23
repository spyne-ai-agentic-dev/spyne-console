---
name: spyne-design-system
description: Apply the Spyne Design System — the token-driven design language for the Spyne Retail Suite — when building any UI, web app, website, dashboard, component, or mockup for Spyne. Use whenever the user references Spyne, "our design system", "brand guidelines", or wants work built in Spyne's visual style: purple brand (#522EBF), Inter + JetBrains Mono type, semantic token naming (surface/text/icon/border), and a full component library (buttons, inputs, badges, data tables, charts). This is the house style — prefer it for internal Spyne projects.
---

# Spyne Design System

The official token-driven design system for the Spyne Retail Suite. Three layers: **primitives** (raw values) → **semantic tokens** (purpose-named, mode-aware) → **components** (which consume only the semantic layer). Components reference semantic tokens only, so a re-color or light/dark change happens once and propagates everywhere.

## When to use
This is Spyne's house style — use it by default for any Spyne product UI, internal tool, dashboard, marketing page, or component. Prefer it over the generic brand-emulation skills whenever the work is for Spyne.

## Core tokens (cheat-sheet)
- **Brand primary**: `#522EBF` (`color/brand/600`); accent `#6843CC` (`brand/500`). Ramp 50 `#F1EDFB` → 950 `#1A0E40`.
- **Surface**: canvas `#FAFAFF`, default/raised `#FFFFFF`, sunken `#F1F1F5`, brand `#522EBF` (hover `#44259E`, pressed `#371E7E`), brand-subtle `#F1EDFB`.
- **Text**: default `#262C42` (gray/900), subtle `#4C495D`, muted `#86839A`, disabled `#AAA8BD`, inverse/on-brand `#FFFFFF`, brand `#522EBF`.
- **Border**: default `#E1E3E9`, subtle `#F1F1F5`, strong `#C4C2D1`, brand `#522EBF`, focus `#6843CC`.
- **Status families** (50→950): success/green `#00A251` (600), danger/red `#D92D20` (600), info/blue `#0284C7` (600), pending/amber `#EA580C` (600). NOTE: there is **no `warning` family** — use `pending` for attention, `info` for informational.
- **Charts**: `chart/1`–`5` = `#522EBF`, `#00A251`, `#F59E0B`, `#0EA5E9`, `#F04438`.
- **Type**: Inter (Regular/Medium/SemiBold/Bold) for UI; JetBrains Mono (Medium) for code/token names. Responsive desktop/mobile sizes — display 48/Bold down to micro 8. Headings SemiBold, body Medium.
- **Radius**: controls xs 4 / sm 8 / md 12 / lg 16; containers 8–20; dialog 24; pill 9999. Re-themable via default / rounded / no-corner-radius modes.
- **Spacing**: 8px-based — xs 8, sm 12, md 16, lg 24, xl 32, 2xl 40–48; section rhythm 48/64/80/96/128. Control heights 40/44/48.
- **Icons**: Lucide stroke icons, `size` 16 (1px) / 24 / 32 (2px); strokes bind to `icon/*` tokens. Separate brand/social icon set with mono/brand toggle.
- **Effects**: modal scrims use `overlay/backdrop` (#141028 @35%) + `overlay/backdrop-blur` (2px). Brand gradients are paint styles: `gradient/brand`, `gradient/brand-hover`, `gradient/brand-spectrum`.

## Token naming convention
Names read broad → specific, `/`-separated: **category / role / variant** — e.g. `surface/bg/brand` = the brand-colored background fill. Same pattern across `text/muted`, `icon/danger`, `border/subtle`. When generating code, name CSS variables/classes to mirror these tokens.

## Components available
Button, Input (text/form-field/phone/OTP/textarea/search/select/file-upload/accordion), Checkbox, Radio, Toggle, Badge (6 tones × solid/subtle), Avatar, Tooltip, Segmented Control, Menu, Stepper, Tabs, Slider, Pagination, Progress, Modal, Separator, Navigation, Calendar, Data Table (with loading skeleton), Confirmation Card, Charts. All auto-layout, bound to semantic tokens, with state/size/variant props.

## How to apply
1. Read `reference/DESIGN.md` for the complete primitive ramps, full semantic token tables, typography scale, and component prop notes.
2. Build only against **semantic** tokens (surface/text/icon/border/background/overlay) — never wire components to raw primitive ramps.
3. Use Inter for UI and JetBrains Mono for code/token labels; apply responsive desktop/mobile type sizes.
4. Use `pending` (amber) for attention states and `info` (blue) for informational — never invent a "warning" color.
5. Mirror the `category/role/variant` token names in any CSS variables or component APIs you generate.

The complete specification lives in `reference/DESIGN.md`. Source of truth is the Figma file `WhiruQHsdVqXKh9BbV9sM6`; this is a generated snapshot.
