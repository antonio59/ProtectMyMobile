---
version: alpha
name: ProtectMyMobile
description: Design system for ProtectMyMobile — a UK mobile phone theft prevention and recovery resource. Built for trust, clarity, and urgency.

colors:
  # Core brand
  primary: "#2563EB"
  primary-foreground: "#FFFFFF"
  primary-hover: "#1D4ED8"
  primary-subtle: "#EFF6FF"
  primary-muted: "#DBEAFE"

  # Secondary / UI chrome
  secondary: "#F1F5F9"
  secondary-foreground: "#0F172A"
  # secondary-hover intentionally omitted; use secondary with opacity modifiers

  # Neutral scale
  background: "#FFFFFF"
  foreground: "#020817"
  neutral: "#FAFAFA"
  neutral-100: "#F5F5F5"
  neutral-200: "#E5E5E5"
  neutral-300: "#D4D4D4"
  neutral-400: "#A3A3A3"
  neutral-500: "#737373"
  neutral-600: "#525252"
  neutral-700: "#404040"
  neutral-800: "#262626"
  neutral-900: "#171717"

  # Muted / subtle text
  muted: "#F1F5F9"
  muted-foreground: "#64748B"

  # Accent (used for highlights, tags, hover states)
  accent: "#F1F5F9"
  accent-foreground: "#0F172A"

  # Destructive / Emergency
  destructive: "#DC2626"
  destructive-foreground: "#FFFFFF"
  destructive-hover: "#B91C1C"
  destructive-subtle: "#FEF2F2"
  destructive-muted: "#FEE2E2"

  # Semantic — UK Government Design System alignment
  emergency: "#D4351C"
  # emergency-foreground omitted; emergency is always on white/light surfaces
  warning: "#D97706"
  warning-subtle: "#FFFBEB"
  success: "#059669"
  # success-subtle omitted; use success with opacity modifiers when needed

  # Surfaces
  card: "#FFFFFF"
  card-foreground: "#020817"
  popover: "#FFFFFF"
  popover-foreground: "#020817"

  # Borders & input
  border: "#E2E8F0"
  input: "#E2E8F0"
  ring: "#3B82F6"

typography:
  font-sans:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5

  h1:
    fontFamily: Inter
    fontSize: 1.875rem
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.02em

  h2:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: -0.01em

  h3:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4

  h4:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.5

  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6

  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5

  body-xs:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5

  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.05em
    fontFeature: "'cv02', 'cv03', 'cv04', 'cv11'"

  stat-number:
    fontFamily: Inter
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
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px

  button-ghost:
    backgroundColor: "transparent"
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
    textColor: "#991B1B"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"

  badge-info:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.primary-hover}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"

  badge-warning:
    backgroundColor: "{colors.warning-subtle}"
    textColor: "#92400E"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"

  fab-emergency:
    backgroundColor: "{colors.emergency}"
    textColor: "{colors.background}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px

  icon-background-primary:
    backgroundColor: "{colors.primary-muted}"
    textColor: "{colors.primary-hover}"
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
    backgroundColor: "{colors.ring}"
    height: 2px

  surface-page:
    backgroundColor: "{colors.neutral}"

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
    textColor: "{colors.neutral-500}"
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
    backgroundColor: "{colors.background}"
    textColor: "{colors.neutral-900}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"

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

The design language draws from UK Government Design System (GDS) principles — clean typography, high contrast, accessible colour choices, and a clear information hierarchy — while adding a contemporary, app-like polish through rounded corners, subtle shadows, and smooth motion.

The overall feel is:
- **Authoritative but approachable** — like a trusted public service, not a corporate brand
- **Mobile-first** — most users will encounter this on their phones, often in stressful situations
- **Action-oriented** — every page drives toward a clear next step (prevent, report, recover)

## Colors

The palette is intentionally restrained. Three functional families carry the UI: blue for trust and primary actions, neutral greys for content and structure, and red for emergencies and destructive actions.

### Primary Blue
- **primary (#2563EB):** The brand colour. Used for buttons, links, focus rings, and interactive accents. Evokes trust and digital security.
- **primary-hover (#1D4ED8):** Darker shade for hover/active states. Ensures clear interaction feedback.
- **primary-subtle (#EFF6FF) & primary-muted (#DBEAFE):** Background tints for info badges, selected states, and hover highlights.

### Neutral Scale
- **background (#FFFFFF):** Clean white page backgrounds. Maximises readability.
- **foreground (#020817):** Near-black for primary text. Provides excellent contrast without the harshness of pure black.
- **neutral through neutral-900 (#FAFAFA → #171717):** A full 10-step grey scale for borders, backgrounds, secondary text, and subtle UI elements.
- **muted-foreground (#64748B):** Slate-grey for captions, metadata, placeholders, and disabled states.

### Emergency Red
- **destructive (#DC2626):** Standard error/destructive colour for form validation and irreversible actions.
- **destructive-hover (#B91C1C):** Deeper red for hover states on destructive buttons.
- **emergency (#D4351C):** The UK GDS red. Reserved exclusively for the emergency floating action button (FAB) and critical alerts. This colour is culturally associated with urgency in the UK.
- **destructive-subtle (#FEF2F2):** Light pink background for error messages and emergency callout boxes.

### Semantic Accents
- **warning (#D97706):** Amber for cautionary labels and medium-priority alerts.
- **success (#059669):** Emerald for positive confirmation states (e.g., "SIM blocked successfully").

### Surfaces
- **card (#FFFFFF):** Elevated content containers on white backgrounds. Use subtle borders or shadows to separate from the page.
- **popover (#FFFFFF):** Dropdowns, modals, and command palettes. Same base as cards but often with stronger shadows.

### Gradients
Gradients are used sparingly — only for hero backgrounds, category tags, and progress bars where a sense of motion or transition is needed.

| Gradient | From | To | Usage |
|----------|------|-----|-------|
| Emergency | `red-500` (#EF4444) | `red-600` (#DC2626) | Emergency hero cards, arrest category badges |
| Primary | `blue-500` (#3B82F6) | `blue-600` (#2563EB) | Statistics progress bars, prevention category badges |
| Neutral | `neutral-500` (#737373) | `neutral-600` (#525252) | Generic metadata tags |
| Dark | `neutral-900` (#171717) | `neutral-800` (#262626) | Dark section overlays |

**Rules:**
- Never use gradients for primary buttons — solid colours are more accessible.
- Keep gradient angles horizontal (`to-r`) or subtle (`to-br`). Avoid steep diagonals.
- Gradients on text require `bg-clip-text text-transparent`, which hurts accessibility. Use only on decorative headlines, never on body text.

## Typography

**Inter** is the sole typeface. It was chosen for its exceptional legibility at small sizes, neutral personality, and extensive weight range. On a practical level, it loads reliably from Google Fonts and feels familiar to UK users of government and banking websites.

### Scale
All type sizes are fluid and responsive. The tokens below represent the **mobile base**. At the `md` breakpoint (768px), headings scale up by roughly 15–25%. At `lg` (1024px), they reach their maximum desktop size.

| Token | Mobile | Tablet (768px+) | Desktop (1024px+) | Usage |
|-------|--------|-----------------|-------------------|-------|
| h1 | 1.875rem | 2.5rem | 3rem | Page titles, hero headlines |
| h2 | 1.5rem | 2rem | 2.25rem | Section headings |
| h3 | 1.25rem | 1.5rem | 1.75rem | Card titles, subsections |
| h4 | 1.125rem | 1.25rem | 1.5rem | Labels, small headings |
| body | 1rem | — | 1.125rem | Paragraph text |
| body-sm | 0.875rem | — | 1rem | Secondary text, descriptions |
| body-xs | 0.75rem | — | — | Metadata, timestamps, captions |
| label | 0.75rem | — | — | Uppercase labels, badges, tags |
| stat-number | 1.875rem | 3rem | 3.75rem | Large statistics, dashboard numbers |

### Rules
- **Headings** use `font-weight: 700` (h1–h2) or `600` (h3–h4) with tight negative letter-spacing for a modern, compact feel.
- **Body text** is `400` weight with a generous `1.6` line-height for comfortable reading on mobile.
- **Labels** are uppercase-friendly but should not be mechanically uppercased in code. Instead, use sentence case with `letter-spacing: 0.05em` to achieve visual separation.
- **Stat numbers** are bold and tightly tracked. They should never wrap — use `word-break: normal` and allow truncation with an ellipsis if space is constrained.

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

Elevation is communicated through shadow and background separation, not through simulated 3D layers.

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle borders on inputs |
| shadow-md | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| shadow-lg | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, command palette |
| shadow-xl | `0 20px 25px -5px rgba(0,0,0,0.1)` | Mobile menus, full-screen overlays |
| shadow-glow-red | `0 10px 40px -10px rgba(239,68,68,0.5)` | Emergency FAB hover |
| shadow-glow-blue | `0 10px 40px -10px rgba(59,130,246,0.5)` | Primary CTA emphasis |

### Depth Rules
- White cards on white pages need either a `border` or `shadow-md` to be perceptible.
- Modals and dialogs receive `shadow-xl` plus a semi-transparent backdrop (`rgba(0,0,0,0.5)`).
- The emergency FAB uses `shadow-glow-red` on hover to create an urgent, pulsating call for attention.

## Shapes

- **Buttons:** `rounded-md` (8px). Large CTAs can use `rounded-xl` (16px) for a friendlier feel.
- **Cards:** `rounded-xl` (16px). This is the project's signature shape.
- **Inputs:** `rounded-md` (8px). Slightly sharper than cards to feel tactile.
- **Avatars / status indicators:** `rounded-full`.
- **Badges:** `rounded-full` for a pill shape.
- **Dialog / modal panels:** `rounded-xl` (16px) or `rounded-2xl` (24px) on desktop.

## Components

### Buttons
All buttons meet a **44px minimum touch target** for accessibility.

| Variant | Background | Text | Border | Hover State |
|---------|-----------|------|--------|-------------|
| Primary | `primary` | `primary-foreground` | none | `primary-hover` |
| Secondary | `secondary` | `secondary-foreground` | none | `secondary-hover` |
| Outline | transparent | `primary` | `primary` | `primary-subtle` background |
| Ghost | transparent | `foreground` | none | `accent` background |
| Destructive | `destructive` | `destructive-foreground` | none | `destructive-hover` |

**Loading state:** Reduce opacity to 70%, show a spinning SVG, and set `cursor: wait`. Maintain the 44px height.

### Cards
- White background, `rounded-xl`, `padding: 16px` (mobile) / `24px` (desktop).
- Optional `border` or `shadow-md` depending on page background.
- **Hover:** `card-lift` utility — translate Y `-4px`, scale `1.01`, and apply `shadow-lg`.

### Inputs
- `rounded-md`, `height: 44px`, `padding: 8px 12px`.
- Border colour `input` (#E2E8F0). Focus state uses `ring: 2px solid ring` (#2563EB) with `outline-offset: 2px`.
- Error state: border changes to `destructive` and a `text-destructive` message appears below.

### Dialog / Sheet
- `rounded-xl` panel on desktop; full-screen sheet on mobile (`rounded-t-2xl` from bottom).
- Backdrop: `rgba(0,0,0,0.5)` with `backdrop-blur-sm`.
- Close button: top-right corner, ghost style.

### Skeleton Loaders
- `rounded-lg`, animated `shimmer` gradient from `neutral-200` to `neutral-100`.
- Used for charts, stats cards, and news feeds while Convex data loads.

### Badges
- Pill-shaped (`rounded-full`), `padding: 4px 12px`.
- `label` typography token.
- Variants: `badge-info` (blue), `badge-emergency` (red), `badge-warning` (amber).

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
- All transitions respect `prefers-reduced-motion: reduce`.
- Never animate `width`, `height`, `top`, or `left`. Use `transform` and `opacity` only.
- Hover transitions: `0.2s ease` for colour, `0.3s ease` for transform/shadow.

## Do's and Don'ts

### Do
- **Do** use `primary` blue for all main call-to-action buttons. Consistency builds trust.
- **Do** ensure the emergency FAB is always visible on mobile after scrolling past the hero.
- **Do** use `foreground` for primary text and `muted-foreground` for secondary text. Use `neutral-600` and `neutral-700` only when you need warmer greys.
- **Do** use `background` for page surfaces and `card` for elevated containers.
- **Do** respect `prefers-reduced-motion`. All animations should degrade to instant state changes.
- **Do** print emergency guides with high-contrast black text and visible phone numbers.
- **Do** use `stat-number` typography for dashboard figures to give them visual weight.

### Don't
- **Don't** use `emergency` red (#D4351C) for non-critical actions. Reserve it for the FAB and genuine alerts.
- **Don't** use arbitrary hex values like `#f3f2f1` or `#e5e7eb` inline. Map them to `neutral-100` and `neutral-200` respectively.
- **Don't** use `bg-white` directly. Use `bg-background` for pages and `bg-card` for elevated surfaces.
- **Don't** make touch targets smaller than 44px. This is a hard accessibility rule.
- **Don't** use gradients for primary buttons. Solid colours are more accessible and load faster.
- **Don't** use more than two font weights on the same screen. Stick to 400 + 600/700.
- **Don't** animate layout properties (width, height, top, left). Use `transform` and `opacity` only for 60fps performance.
