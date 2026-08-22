---
version: alpha
name: ProtectMyMobile
description: Design system for ProtectMyMobile — a UK mobile phone theft prevention and recovery resource. Editorial "data-journalism" system — warm paper, ink, and a single alert red. Built for trust, clarity, and urgency.

colors:
  # Core brand — ink on warm paper
  primary: "#16130F"
  primary-foreground: "#FAF8F5"
  primary-hover: "#000000"
  primary-subtle: "#F2EEE6"
  primary-muted: "#E8E2D6"

  # Secondary / UI chrome
  secondary: "#F2EEE6"
  secondary-foreground: "#16130F"
  secondary-hover: "#E8E2D6"

  # Neutral scale — warm greys
  background: "#FAF8F5"
  foreground: "#16130F"
  neutral: "#F5F2EC"
  neutral-100: "#F2EEE6"
  neutral-200: "#E5DFD5"
  neutral-300: "#D8D2C8"
  neutral-400: "#A39B8D"
  neutral-500: "#6B6459"
  neutral-600: "#58524A"
  neutral-700: "#453F36"
  neutral-800: "#2B2620"
  neutral-900: "#16130F"

  # Muted / subtle text
  muted: "#F2EEE6"
  muted-foreground: "#6B6459"

  # Accent (used for highlights, tags, hover states)
  accent: "#F2EEE6"
  accent-foreground: "#16130F"

  # Destructive / Emergency — the single alert red
  destructive: "#C8322B"
  destructive-foreground: "#FFFFFF"
  destructive-hover: "#A8271F"
  destructive-subtle: "#F9ECE8"
  destructive-muted: "#F0C7C4"

  # Semantic
  emergency: "#C8322B"
  emergency-foreground: "#FFFFFF"
  warning: "#B06000"
  warning-subtle: "#F7EFE0"
  success: "#2F6B4F"
  success-subtle: "#EAF2EC"

  # Surfaces
  card: "#FAF8F5"
  card-foreground: "#16130F"
  popover: "#FAF8F5"
  popover-foreground: "#16130F"

  # Borders & input
  border: "#D8D2C8"
  input: "#D8D2C8"
  ring: "#C8322B"

typography:
  font-sans:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5

  font-serif:
    fontFamily: Newsreader
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.2

  h1:
    fontFamily: Newsreader
    fontSize: 2.125rem
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.02em

  h2:
    fontFamily: Newsreader
    fontSize: 1.625rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em

  h3:
    fontFamily: Newsreader
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25

  h4:
    fontFamily: Archivo
    fontSize: 1.0625rem
    fontWeight: 700
    lineHeight: 1.4

  body:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6

  body-sm:
    fontFamily: Archivo
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5

  body-xs:
    fontFamily: Archivo
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5

  label:
    fontFamily: Archivo
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.05em

  stat-number:
    fontFamily: Archivo
    fontSize: 1.875rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em

rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px

  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-foreground}"

  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px

  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px

  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px

  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px

  button-destructive-hover:
    backgroundColor: "{colors.destructive-hover}"
    textColor: "{colors.destructive-foreground}"

  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: 16px

  card-hover:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: 16px

  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 8px
    height: 44px

  dialog:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
    rounded: "{rounded.xl}"
    padding: 24px

  skeleton:
    backgroundColor: "{colors.neutral-200}"
    rounded: "{rounded.lg}"

  badge-emergency:
    backgroundColor: "{colors.destructive-subtle}"
    textColor: "{colors.destructive-hover}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"

  badge-info:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"

  badge-warning:
    backgroundColor: "{colors.warning-subtle}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"

  fab-emergency:
    backgroundColor: "{colors.emergency}"
    textColor: "{colors.emergency-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px

  icon-background-primary:
    backgroundColor: "{colors.primary-muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 8px
    size: 40px

  menu-item-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    padding: 8px

  code-inline:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "2px 4px"

  alert-destructive-bg:
    backgroundColor: "{colors.destructive-muted}"
    rounded: "{rounded.md}"
    padding: 16px

  icon-warning:
    textColor: "{colors.warning}"
    size: 20px

  icon-success:
    textColor: "{colors.success}"
    size: 20px

  input-border:
    backgroundColor: "{colors.input}"
    height: 1px

  focus-ring:
    backgroundColor: "{colors.primary}"
    height: 2px

  surface-page:
    backgroundColor: "{colors.background}"

  surface-card-alt:
    backgroundColor: "{colors.neutral-100}"

  surface-border:
    backgroundColor: "{colors.neutral-200}"
    height: 1px

  surface-disabled:
    backgroundColor: "{colors.neutral-300}"
    rounded: "{rounded.md}"

  text-placeholder:
    textColor: "{colors.neutral-400}"
    typography: "{typography.body-sm}"

  text-caption:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-xs}"

  text-body-secondary:
    textColor: "{colors.neutral-600}"
    typography: "{typography.body}"

  text-body-strong:
    textColor: "{colors.neutral-700}"
    typography: "{typography.body}"

  text-subheading:
    textColor: "{colors.neutral-800}"
    typography: "{typography.h4}"

  text-inverse:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"

  hero-inverted:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.xl}"
    padding: 24px

  toast:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.md}"
    padding: 16px

  toast-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
    padding: 16px

  separator:
    backgroundColor: "{colors.border}"
    height: 1px

  progress-track:
    backgroundColor: "{colors.neutral-200}"
    rounded: "{rounded.full}"
    height: 8px

  progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    height: 8px

  input-focus:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 8px
    height: 44px
---

## Overview

ProtectMyMobile's visual identity balances **trust, clarity, and urgency**. The UI is designed for UK residents and visitors who need immediate, authoritative guidance on mobile phone theft prevention and recovery.

The current system is an **editorial "data-journalism" language**: warm paper backgrounds, ink-black text, serif display headlines, and a single alert red reserved for emergencies. It draws from UK Government Design System (GDS) principles — clean typography, high contrast, accessible colour choices — while reading like a trusted broadsheet rather than an app.

The overall feel is:
- **Authoritative but approachable** — like a trusted public service or newsroom, not a corporate brand
- **Mobile-first** — most users will encounter this on their phones, often in stressful situations
- **Action-oriented** — every page drives toward a clear next step (prevent, report, recover)

## Colors

The palette is intentionally restrained. Warm paper and ink carry almost the entire UI; a single red carries all danger, error, and emergency meaning. There is no brand blue.

### Ink (primary)
- **primary (#16130F):** Near-black warm ink. Used for primary buttons, inverted hero sections, and emphasis. In dark mode it inverts to paper.
- **primary-foreground (#FAF8F5):** Paper text on ink surfaces.
- **primary-hover (#000000):** Pure black for hover/active states.
- **primary-subtle (#F2EEE6) & primary-muted (#E8E2D6):** Warm tint backgrounds for badges, selected states, and hover highlights.

### Neutral Scale (warm greys)
- **background (#FAF8F5):** Warm paper page background. Replaces pure white everywhere.
- **foreground (#16130F):** Ink for primary text.
- **neutral through neutral-900 (#F5F2EC → #16130F):** A full warm-grey scale for borders, backgrounds, secondary text, and subtle UI elements. The scale **inverts completely in dark mode**, so `bg-neutral-100` etc. are dark-mode safe.
- **muted-foreground (#6B6459):** Warm mid-grey for captions, metadata, placeholders, and disabled states.

### Alert Red
- **destructive (#C8322B):** The single alert red. Used for errors, destructive actions, and emergency meaning.
- **destructive-hover (#A8271F):** Deeper red for hover states on destructive buttons.
- **emergency (#C8322B):** Same red, reserved semantically for the emergency FAB and critical alerts.
- **destructive-subtle (#F9ECE8):** Light red-tinted background for error messages and emergency callouts.

### Semantic Accents
- **warning (#B06000):** Dark amber for cautionary labels and medium-priority alerts.
- **success (#2F6B4F):** Deep green for positive confirmation states (e.g., "SIM blocked successfully").

### Surfaces
- **card (#FAF8F5):** Same paper as the page background — cards are separated by **borders**, not elevation or whiteness.
- **popover (#FAF8F5):** Dropdowns, modals, and command palettes, separated by border + shadow.

### Dark Mode
Dark mode is enabled via `@variant dark` in Tailwind v4 and toggled with the `.dark` class on `<html>` (explicit toggle only — no OS auto-detection). No `dark:` prefixes are needed for core tokens — `bg-background`, `text-foreground`, etc. switch automatically via CSS custom property overrides.

| Token | Light | Dark |
|-------|-------|------|
| background | `#FAF8F5` | `#16130F` |
| foreground | `#16130F` | `#FAF8F5` |
| card | `#FAF8F5` | `#1D1913` |
| primary | `#16130F` | `#FAF8F5` |
| neutral-100 | `#F2EEE6` | `#2B2620` |
| neutral-200 | `#E5DFD5` | `#3A352C` |
| neutral-300 | `#D8D2C8` | `#453F36` |
| muted | `#F2EEE6` | `#2B2620` |
| muted-foreground | `#6B6459` | `#A39B8D` |
| border | `#D8D2C8` | `#3A352C` |
| ring | `#C8322B` | `#E0685F` |
| destructive | `#C8322B` | `#D84A42` |

**Rules:**
- Invert the neutral scale completely: `neutral-100` light becomes a dark surface in dark mode.
- `primary` inverts (ink ↔ paper). Therefore **never pair `bg-primary` or `bg-foreground` with literal `text-white`** — always use `text-primary-foreground` / `text-background`, which invert with the surface.
- Inside inverted (`bg-foreground`) sections, use `bg-background/10`, `border-background/20`, and `text-background/70` instead of `bg-white/10`, `border-white/20`, `text-neutral-300` — the `/background` forms invert correctly; literal white does not.
- Shadows become invisible in dark mode. Rely on border contrast instead.

### Gradients
Gradients are used sparingly — only for hero image overlays where readability of text over photography demands it.

**Rules:**
- Never use gradients for primary buttons — solid colours are more accessible.
- Never use gradients on text (`bg-clip-text text-transparent`); it hurts accessibility.

## Typography

Two typefaces: **Newsreader** (serif) for display headlines (h1–h3), giving the editorial newsroom voice, and **Archivo** (sans) for body text, labels, UI chrome, and h4.

### Scale
All type sizes are fluid and responsive. The tokens below represent the **mobile base**. At the `md` breakpoint (768px), headings scale up; at `lg` (1024px), they reach their maximum desktop size.

| Token | Mobile | Tablet (768px+) | Desktop (1024px+) | Usage |
|-------|--------|-----------------|-------------------|-------|
| h1 | 2.125rem | 2.75rem | 3.5rem | Page titles, hero headlines (Newsreader 500) |
| h2 | 1.625rem | 2rem | 2.25rem | Section headings (Newsreader 700) |
| h3 | 1.375rem | 1.5rem | 1.75rem | Card titles, subsections (Newsreader 700) |
| h4 | 1.0625rem | 1.25rem | 1.5rem | Labels, small headings (Archivo 700) |
| body | 1rem | — | 1.125rem | Paragraph text |
| body-sm | 0.875rem | — | 1rem | Secondary text, descriptions |
| body-xs | 0.75rem | — | — | Metadata, timestamps, captions |
| label | 0.75rem | — | — | Uppercase labels, badges, tags |
| stat-number | 1.875rem | 3rem | 3.75rem | Large statistics, dashboard numbers |

### Rules
- **Headlines** are Newsreader; h1 is medium weight (500) with tight letter-spacing, h2–h3 are 700. Never set headlines in Archivo.
- **Body text** is Archivo 400 with a generous `1.6` line-height for comfortable reading on mobile.
- **Labels** are uppercase-friendly: use uppercase with `letter-spacing: 0.05em` (news.astro category buttons are the reference pattern).
- **Stat numbers** are bold and tightly tracked. They should never wrap — allow truncation with an ellipsis if space is constrained.

## Layout

The layout system is mobile-first, fluid, and constrained.

### Container
- **Max width:** None (fluid), but content is centred with auto margins.
- **Padding:** `16px` on mobile, `24px` at `sm` (640px), `32px` at `lg` (1024px).
- **Safe area:** Respect `env(safe-area-inset-*)` for notched devices.

### Section Spacing
- **Section padding:** `32px` vertical on mobile, `48px` at `md`, `64px` at `lg`.
- **Grid gaps:** `16px` on mobile, `24px` at `sm`, `32px` at `lg`.

### Breakpoints
The project uses Tailwind v4 default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Z-Index Hierarchy
1. **Base content:** 0–10
2. **Sticky headers / breadcrumbs:** 40–50
3. **Modals / dialogs / search:** 100
4. **Toasts / FAB:** 50–60
5. **Focus rings / skip links:** 100+

## Elevation & Depth

The editorial system is flat. Separation comes from **borders and background tints**, not shadows.

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle borders on inputs |
| shadow-md | `0 4px 6px -1px rgba(0,0,0,0.1)` | Dropdowns, sticky chrome |
| shadow-lg | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, command palette |
| shadow-xl | `0 20px 25px -5px rgba(0,0,0,0.1)` | Mobile menus, full-screen overlays |
| shadow-glow-red | `0 8px 24px -12px rgba(200,50,43,0.45)` | Emergency FAB hover |
| shadow-glow-blue | `0 8px 24px -12px rgba(22,19,15,0.3)` | Legacy name — now a quiet ink shadow for CTA emphasis |

### Depth Rules
- Cards sit on the same paper background as the page and **must** use `border border-border` to be perceptible.
- Modals and dialogs receive `shadow-xl` plus a semi-transparent backdrop (`rgba(0,0,0,0.5)`).
- The emergency FAB uses `shadow-glow-red` on hover to create an urgent call for attention.

## Shapes

The editorial system pairs flat, border-defined surfaces with **softly rounded elements** for approachability.

- **Buttons:** `rounded-xl` (16px) for large CTAs; `rounded-lg` (12px) for compact buttons. Fully square buttons read as harsh against the warm paper palette.
- **Cards:** `rounded-xl` (16px) with `border border-border`.
- **Inputs:** `rounded-md` (8px). Slightly sharper than buttons to feel tactile.
- **Heroes / large sections:** `rounded-xl` to `rounded-2xl` (16–24px).
- **Avatars / status indicators / badges / category pills:** `rounded-full` (9999px).

## Components

### Buttons
All buttons meet a **44px minimum touch target** for accessibility.

| Variant | Background | Text | Border | Hover State |
|---------|-----------|------|--------|-------------|
| Primary | `primary` (ink) | `primary-foreground` (paper) | none | `primary-hover` (black) |
| Secondary | `secondary` | `secondary-foreground` | none | `secondary-hover` |
| Outline | `background` | `foreground` | `foreground` (2px) | inverted: `bg-foreground text-background` |
| Ghost | `background` | `foreground` | none | `accent` background |
| Destructive | `destructive` | `destructive-foreground` | none | `destructive-hover` |

**Critical rule:** never write `bg-primary text-white` or `bg-foreground text-white`. Always pair inverting surfaces with their inverting foreground token (`text-primary-foreground`, `text-background`), or dark mode renders white text on a paper surface.

**Loading state:** Reduce opacity to 70%, show a spinning SVG, and set `cursor: wait`. Maintain the 44px height.

### Cards
- Paper background, `rounded-xl`, `padding: 16px` (mobile) / `24px` (desktop).
- Always `border border-border`; shadows only for floating chrome.
- **Hover:** `hover-lift` utility — translate Y `-4px` with a subtle ink shadow.

### Inputs
- `rounded-md`, `height: 44px`, `padding: 8px 12px`.
- Border colour `input` (#D8D2C8). Focus state uses the global `focus-visible` ring: `2px solid primary` with `outline-offset: 2px` (do not add per-input `focus:ring-*` utilities).
- Error state: border changes to `destructive` and a `text-destructive` message appears below.

### Dialog / Sheet
- `rounded-xl` panel on desktop; full-screen sheet on mobile.
- Backdrop: `rgba(0,0,0,0.5)` with `backdrop-blur-sm`.
- Close button: top-right corner, ghost style.

### Skeleton Loaders
- `rounded-lg`, animated `shimmer` gradient from `neutral-200` to `neutral-100`.
- Used for charts, stats cards, and news feeds while Convex data loads.

### Badges
- Pill-shaped (`rounded-full`), `padding: 4px 12px`.
- `label` typography token.
- Variants: `badge-info` (ink tint), `badge-emergency` (red), `badge-warning` (amber).

### Iconography
All icons come from **Lucide React**. They are stroke-based (not filled), keeping the UI light and scalable.

| Size | Dimension | Usage |
|------|-----------|-------|
| xs | 12px (`h-3 w-3`) | Inline metadata, compact lists |
| sm | 16px (`h-4 w-4`) | Buttons, form inputs, badges |
| md | 20px (`h-5 w-5`) | Cards, list items, navigation |
| lg | 24px (`h-6 w-6`) | Feature highlights, empty states |
| xl | 32px (`h-8 w-8`) | Stat cards, dashboard widgets |

**Rules:**
- Icon colour should match adjacent text. If the text is `text-muted-foreground`, the icon should be the same.
- Never use an icon alone without a text label (unless it's a universally understood action like ✕ close, → arrow, or 🔔 notification).
- Emergency icons (AlertTriangle, Siren) should use `text-destructive` or `text-emergency`.
- Loading states replace icons with spinners of the same size.

### Motion
All motion serves a purpose: guiding attention, confirming interactions, or reducing perceived loading time.

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| fade-in | 0.5s | ease-out | Page sections, lazy-loaded content |
| fade-out | 0.3s | ease-in | Dismissing toasts, closing modals |
| slide-up | 0.4s | ease-out | Cards entering viewport, stat counters |
| scale-in | 0.2s | ease-out | Buttons pressed, modals opening |
| pulse-glow | 2s | ease-in-out infinite | Emergency FAB attention loop |
| float | 3s | ease-in-out infinite | Decorative hero elements |
| shimmer | 1.5s | linear infinite | Skeleton loaders |

**Rules:**
- Default entrance delay for staggered lists: `0.1s` per item (`stagger-1` through `stagger-5`).
- All transitions respect `prefers-reduced-motion: reduce` (enforced globally in CSS).
- Never animate `width`, `height`, `top`, or `left`. Use `transform` and `opacity` only.
- Hover transitions: `0.2s ease` for colour, `0.3s ease` for transform/shadow.

## Do's and Don'ts

### Do
- **Do** use ink (`bg-primary` / `bg-foreground`) for main call-to-action buttons and inverted hero sections. Consistency builds trust.
- **Do** pair every inverting surface with its inverting foreground token: `bg-primary text-primary-foreground`, `bg-foreground text-background`, `bg-destructive text-destructive-foreground`.
- **Do** ensure the emergency FAB is always visible on mobile after scrolling past the hero.
- **Do** use `foreground` for primary text and `muted-foreground` for secondary text.
- **Do** use `background` for page surfaces; cards use `bg-card` plus `border border-border`.
- **Do** respect `prefers-reduced-motion`. All animations degrade to instant state changes.
- **Do** print emergency guides with high-contrast black text and visible phone numbers.
- **Do** use `stat-number` typography for dashboard figures to give them visual weight.

### Don't
- **Don't** use alert red (#C8322B) for non-critical actions. Reserve it for the FAB, errors, and genuine alerts.
- **Don't** use arbitrary hex values inline. Map them to the nearest token.
- **Don't** use `bg-white` or `text-white` directly on themed surfaces. Use `bg-card` / `bg-background` and `text-primary-foreground` / `text-background` / `text-destructive-foreground`. (`text-white` is only acceptable on non-inverting fixed-dark imagery overlays.)
- **Don't** use `bg-white/10`, `border-white/20` etc. inside inverted (`bg-foreground`) sections — use `bg-background/10`, `border-background/20` so dark mode inverts correctly.
- **Don't** make touch targets smaller than 44px. This is a hard accessibility rule.
- **Don't** use gradients for primary buttons. Solid colours are more accessible and load faster.
- **Don't** use more than two font weights on the same screen. Stick to 400 + 500/700.
- **Don't** mix radius scales arbitrarily — buttons/CTAs use `rounded-xl`, inputs `rounded-md`, cards `rounded-xl`, pills `rounded-full`.
