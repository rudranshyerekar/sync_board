# SyncBoard — Design.md
### UI/UX Design System, Tokens & Component Specifications

**Companion to:** Architecture.md (§5 Frontend Folder Structure), SyncBoard-PRD.md (§15 UI/UX Page Specifications)
**Purpose:** Single source of truth for every visual decision — colors, typography, spacing, component behavior, and responsive breakpoints. Reference this when building any UI component to ensure visual consistency.

---

## Table of Contents

1. Design Philosophy
2. Color System
3. Typography
4. Spacing & Layout
5. Component Specifications
6. Icons & Imagery
7. Motion & Animation
8. Responsive Breakpoints
9. Dark Mode (Optional, v2)
10. Accessibility

---

## 1. Design Philosophy

SyncBoard's UI should feel **fast, clean, and alive**. The visual design serves three goals:

- **Clarity** — at a glance, you should know: what board you're on, what state each card is in, who's online, and whether someone else is touching the same thing you are.
- **Responsiveness** — every user action should produce immediate visual feedback (optimistic updates, hover states, drag shadows), even before the server confirms it.
- **Unobtrusiveness** — real-time indicators (presence dots, typing animations, editing banners) should inform without distracting from the primary task of managing cards.

**Design references:** The mockups in `docs/images/` are the visual targets. This document codifies the design system behind them.

---

## 2. Color System

### 2.1 Base Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#6366F1` | Primary actions, active states, links (Indigo 500) |
| `--color-primary-hover` | `#4F46E5` | Primary button hover (Indigo 600) |
| `--color-primary-light` | `#EEF2FF` | Primary tint backgrounds (Indigo 50) |
| `--color-secondary` | `#8B5CF6` | Secondary accents, badges (Violet 500) |
| `--color-success` | `#22C55E` | Success states, online presence dot (Green 500) |
| `--color-warning` | `#F59E0B` | Warning states, idle/away presence (Amber 500) |
| `--color-danger` | `#EF4444` | Destructive actions, errors (Red 500) |
| `--color-info` | `#3B82F6` | Informational elements (Blue 500) |

### 2.2 Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#FFFFFF` | Main background |
| `--color-bg-secondary` | `#F9FAFB` | Secondary backgrounds (sidebars, panels) |
| `--color-bg-tertiary` | `#F3F4F6` | Column backgrounds, input backgrounds |
| `--color-border` | `#E5E7EB` | Default borders |
| `--color-border-hover` | `#D1D5DB` | Borders on hover |
| `--color-text-primary` | `#111827` | Primary text (Gray 900) |
| `--color-text-secondary` | `#6B7280` | Secondary text, placeholders (Gray 500) |
| `--color-text-tertiary` | `#9CA3AF` | Muted text, timestamps (Gray 400) |

### 2.3 Presence Colors

| Status | Color | Dot Size |
|--------|-------|----------|
| Online | `#22C55E` (Green 500) | 10px solid |
| Idle | `#F59E0B` (Amber 500) | 10px solid |
| Away | `#F97316` (Orange 500) | 10px solid |
| Offline | `#9CA3AF` (Gray 400) | 10px, hollow ring |

### 2.4 Card Priority Colors

| Priority | Background | Border-left |
|----------|-----------|-------------|
| Urgent | `#FEF2F2` | 4px `#EF4444` |
| High | `#FFF7ED` | 4px `#F97316` |
| Medium | `#FFFBEB` | 4px `#F59E0B` |
| Low | `#F0FDF4` | 4px `#22C55E` |
| None | `#FFFFFF` | None |

---

## 3. Typography

### 3.1 Font Stack

- **Primary font:** `Inter` (Google Fonts) — clean, modern, excellent for UI
- **Monospace font:** `JetBrains Mono` or `Fira Code` — for code/technical content if needed
- **Fallback stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 12px | 400 | 16px | Timestamps, badges, meta |
| `--text-sm` | 14px | 400 | 20px | Secondary text, card descriptions |
| `--text-base` | 16px | 400 | 24px | Body text, input text |
| `--text-lg` | 18px | 600 | 28px | Section headings, card titles |
| `--text-xl` | 20px | 600 | 28px | Page subtitles |
| `--text-2xl` | 24px | 700 | 32px | Page titles |
| `--text-3xl` | 30px | 700 | 36px | Dashboard/hero headings |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (Base: 4px)

| Token | Value | Common Usage |
|-------|-------|-------------|
| `--space-1` | 4px | Tight inline padding |
| `--space-2` | 8px | Small gaps, icon padding |
| `--space-3` | 12px | Input padding, card internal spacing |
| `--space-4` | 16px | Standard padding, card gaps |
| `--space-5` | 20px | Section padding |
| `--space-6` | 24px | Large padding, column gaps |
| `--space-8` | 32px | Page-level padding |
| `--space-10` | 40px | Major section spacing |
| `--space-12` | 48px | Page top/bottom margins |

### 4.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small elements |
| `--radius-md` | 8px | Cards, buttons, inputs |
| `--radius-lg` | 12px | Modals, panels, drawers |
| `--radius-xl` | 16px | Large containers |
| `--radius-full` | 9999px | Avatars, presence dots, pills |

### 4.3 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift (buttons, cards at rest) |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards on hover, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, drawers, floating elements |
| `--shadow-drag` | `0 12px 24px rgba(0,0,0,0.15)` | Card being dragged |

---

## 5. Component Specifications

### 5.1 Card (Kanban)

```
┌─────────────────────────────┐
│ [Priority Bar - 4px left]   │
│                             │
│  Card Title                 │
│  Short description...       │
│                             │
│  🏷️ Labels    📅 Due Date   │
│  👤 Assignee avatar         │
│                             │
│  [Editing indicator banner] │ ← Only when another user is editing
└─────────────────────────────┘

Width: Fill column (100%)
Padding: 12px
Border-radius: 8px
Background: White
Border: 1px solid var(--color-border)
Hover: Shadow elevates to --shadow-md
Dragging: Shadow elevates to --shadow-drag, slight scale(1.02), opacity 0.9
```

### 5.2 Column (Kanban)

```
Width: 280px (fixed, horizontally scrollable if many columns)
Background: var(--color-bg-tertiary)
Border-radius: 12px
Padding: 12px
Header: Column title + card count + "Add card" button
Gap between cards: 8px
```

### 5.3 Button Variants

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary | `--color-primary` | White | None | `--color-primary-hover` |
| Secondary | Transparent | `--color-primary` | 1px `--color-primary` | `--color-primary-light` bg |
| Ghost | Transparent | `--color-text-secondary` | None | `--color-bg-tertiary` bg |
| Danger | `--color-danger` | White | None | Darker red |

**All buttons:** `padding: 8px 16px`, `border-radius: 8px`, `font-weight: 600`, `font-size: 14px`, `cursor: pointer`, smooth transition (150ms)

### 5.4 Avatar

```
Sizes: sm (28px), md (36px), lg (48px)
Shape: Circle (border-radius: 9999px)
Border: 2px solid white (for stacking/overlap in presence list)
Fallback: Initials on colored background (derived from user name hash)
Presence dot: Positioned bottom-right, size 10px, with 2px white ring
```

### 5.5 Modal / Drawer

```
Drawer (Card Detail):
  - Slides in from right
  - Width: 480px (or 40% of viewport, whichever is larger, max 600px)
  - Overlay: rgba(0,0,0,0.3) with backdrop-blur(2px)
  - Close: Click overlay, Escape key, or X button

Modal (Create/Invite/Confirm):
  - Centered
  - Max width: 480px
  - Border-radius: 12px
  - Shadow: --shadow-lg
```

### 5.6 Toast / Notification

```
Position: Top-right corner, stacked vertically
Width: 360px
Duration: 4 seconds (auto-dismiss), or persistent for errors
Types: success (green left-bar), error (red), info (blue), warning (amber)
Animation: Slide in from right, fade out
```

### 5.7 Presence List

```
Layout: Horizontal avatar stack in board header
  - Online users first, then idle/away
  - Overlapping by 8px when >3 users
  - "+N" badge if more than visible limit (e.g., 5)
  - Each avatar shows presence dot
  - Tooltip on hover: "Username — Online/Idle/Away"
```

---

## 6. Icons & Imagery

- **Icon library:** Heroicons (pairs naturally with Tailwind) or Lucide React
- **Icon size:** 16px (inline), 20px (buttons/actions), 24px (navigation)
- **Icon color:** Inherits text color by default; use semantic colors for status icons
- **No placeholder images** — use generated initials for avatars, colored backgrounds for empty states

---

## 7. Motion & Animation

### 7.1 Timing

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-fast` | 100ms | ease-out | Button press, focus ring |
| `--duration-normal` | 200ms | ease-in-out | Hover transitions, color changes |
| `--duration-slow` | 300ms | ease-in-out | Drawer/modal open/close, page transitions |

### 7.2 Specific Animations

| Element | Animation |
|---------|-----------|
| Card drag | Scale(1.02), shadow elevates, slight rotation (2deg) |
| Card drop | Smooth position interpolation (200ms) |
| Presence dot | Pulse animation for "just came online" (1 cycle) |
| Typing indicator | Three dots bouncing sequentially (infinite loop while active) |
| Toast notification | Slide in from right (300ms), fade out (200ms) |
| Editing banner | Fade in (200ms), subtle pulse on avatar |
| Drawer | Slide in from right (300ms ease-out) |
| Modal | Scale from 0.95 to 1.0 + fade in (200ms) |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout Adjustments |
|-----------|-------|-------------------|
| Mobile | < 640px | Single column, full-width cards, bottom nav |
| Tablet | 640px – 1024px | 2-3 visible columns, collapsible sidebar |
| Desktop | 1024px – 1440px | Full board view, sidebar visible |
| Wide | > 1440px | Max content width 1440px, centered |

**Primary target:** Desktop (1024px+). Mobile is a secondary concern for v1 but layouts should not break on smaller screens.

---

## 9. Dark Mode (Optional, v2)

Not in scope for v1, but the color system is designed with tokenization so dark mode can be added by swapping token values without touching component code. When implemented:

- Swap `--color-bg-*` tokens to dark equivalents
- Swap `--color-text-*` tokens
- Adjust shadows (more subtle on dark backgrounds)
- Presence dot colors remain unchanged (they're semantic)

---

## 10. Accessibility

- **Color contrast:** All text meets WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
- **Focus indicators:** Visible focus ring (`2px solid var(--color-primary)`, offset 2px) on all interactive elements
- **Keyboard navigation:** All actions reachable via keyboard; Escape closes modals/drawers
- **Screen reader:** Semantic HTML, ARIA labels on icon-only buttons, live regions for real-time updates (presence changes, new comments)
- **Reduced motion:** Respect `prefers-reduced-motion` — disable non-essential animations

---

*End of Design.md — reference this when building any UI component. Update token values here if the visual direction evolves during implementation.*
