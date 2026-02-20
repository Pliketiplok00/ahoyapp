# AHOY — Design Rules
> Neo-brutalist mobile-first design system

---

## Philosophy

**Brutalism as identity.** Every element must feel intentional, raw, and high-contrast.
No decoration without purpose. No softness without reason.

Rules are absolute — exceptions require explicit justification.

---

## 1. Shape & Geometry

| Rule | Value |
|------|-------|
| Border radius | **0px everywhere** — no exceptions |
| Borders | `2px solid hsl(var(--foreground))` on cards/buttons |
| Heavy borders | `3px solid hsl(var(--foreground))` on headers/dividers |
| Light borders | `1.5px solid hsl(var(--foreground))` on small elements |

**Box shadows (offset, not blur):**
| Name | Value | Usage |
|------|-------|-------|
| `brut-sm` | `2px 2px 0px hsl(var(--foreground))` | Small buttons, badges |
| `brut` | `4px 4px 0px hsl(var(--foreground))` | Cards, primary elements |
| `brut-lg` | `6px 6px 0px hsl(var(--foreground))` | Hero elements |

Shadows are **always offset**, never blurred. They create the illusion of depth without softness.

---

## 2. Color Palette

All colors defined as HSL CSS variables in `src/index.css`.

| Token | HSL | Role |
|-------|-----|------|
| `--background` | `55 30% 94%` | Warm cream — app background |
| `--foreground` | `220 25% 8%` | Near-black — text, borders, shadows |
| `--card` | `0 0% 100%` | Pure white — card backgrounds |
| `--primary` | `196 90% 55%` | Sky blue — main accent, headers, CTAs |
| `--primary-light` | `196 90% 90%` | Light blue — tinted backgrounds |
| `--secondary` | `220 25% 8%` | Near-black — dark buttons |
| `--accent` | `80 70% 52%` | Lime green — secondary CTAs, tags |
| `--pink` | `330 90% 55%` | Hot pink — tertiary accent |
| `--muted` | `55 20% 88%` | Muted cream — disabled states, bg |
| `--muted-foreground` | `220 12% 45%` | Mid-grey — secondary text |
| `--destructive` | `0 80% 55%` | Red — errors, destructive actions |
| `--stats-bg` | `35 95% 58%` | Amber — stats highlights |

**Hero card colors** (for colored section headers):
```
--hero-blue:  196 90% 55%   (= primary)
--hero-pink:  330 90% 55%   (= pink)
--hero-amber: 35 95% 62%
--hero-teal:  172 55% 48%
--hero-lime:  80 70% 52%    (= accent)
```

**Crew colors** (8 distinct, for member identification):
```
--crew-1: sky blue    196 90% 55%
--crew-2: hot pink    330 90% 55%
--crew-3: amber       35 95% 58%
--crew-4: lime        80 70% 52%
--crew-5: forest      142 60% 38%
--crew-6: purple      260 65% 65%
--crew-7: red         0 80% 55%
--crew-8: teal        200 70% 52%
```

**Status colors:**
```
Active:    primary blue   / light blue bg
Upcoming:  lime green     / light green bg
Completed: mid-grey       / light grey bg
Cancelled: red            / light red bg
```

---

## 3. Typography

| Property | Value |
|----------|-------|
| Display font | `Space Grotesk` — headings, labels, buttons |
| Mono font | `Space Mono` — body text, data, metadata |
| All headings | `UPPERCASE` always |
| Letter spacing (headings) | `-0.01em` |
| Letter spacing (labels) | `tracking-widest` (0.1em+) |

**Scale:**
| Role | Class | Usage |
|------|-------|-------|
| Hero | `font-display font-bold text-4xl–5xl uppercase` | Page heroes |
| Section title | `font-display font-bold text-2xl–3xl uppercase` | Card titles |
| Card title | `font-display font-bold text-xl uppercase` | Booking names |
| Label | `font-mono text-xs font-bold uppercase tracking-widest` | Section labels |
| Body | `font-mono text-sm` | Regular text |
| Meta | `font-mono text-xs text-muted-foreground uppercase` | Timestamps, subtitles |

---

## 4. Spacing & Layout

| Token | Value |
|-------|-------|
| App max width | `430px` (mobile shell) |
| Tab bar height | `72px` |
| Header height | `56px` |
| Page horizontal padding | `px-4` (1rem) or `px-5` (1.25rem) |
| Card internal padding | `p-4` or `p-5` |
| Section spacing | `space-y-4` or `space-y-5` |

The app is always centered with `max-width: 430px; margin: 0 auto`.

---

## 5. Interactive States

| State | Effect |
|-------|--------|
| Active/press | `translate(1px, 1px)` — shadow "collapses" |
| Hover (button) | Shadow reduces from 4px to 2px offset |
| Disabled | `opacity: 40%` |
| Focus (input) | Background changes to `--primary-light`, shadow appears |
| Selected (toggle) | Background fills with accent color + shadow appears |

Buttons never use `active:scale-*` — only `active:translate-x-0.5 active:translate-y-0.5`.

---

## 6. Component Patterns

### Cards
```
background: hsl(var(--card))
border: 2px solid hsl(var(--foreground))
box-shadow: 4px 4px 0px hsl(var(--foreground))
border-radius: 0px
```

### Colored Hero Cards
```
background: hsl(var(--primary))  [or accent/pink/amber]
border: 2px solid hsl(var(--foreground))
box-shadow: 4px 4px 0px hsl(var(--foreground))
```

### Buttons — Primary (dark)
```
background: hsl(var(--secondary))   [near-black]
color: white
border: 2px solid hsl(var(--foreground))
box-shadow: 4px 4px 0px hsl(var(--foreground))
font: Space Grotesk, bold, uppercase
```

### Buttons — Blue
```
background: hsl(var(--primary))
color: hsl(var(--foreground))
border: 2px solid hsl(var(--foreground))
box-shadow: 4px 4px 0px hsl(var(--foreground))
```

### Buttons — Secondary (white)
```
background: hsl(var(--card))
color: hsl(var(--foreground))
border: 2px solid hsl(var(--foreground))
box-shadow: 4px 4px 0px hsl(var(--foreground))
```

### Inputs
```
background: hsl(var(--card))
border: 2px solid hsl(var(--foreground))
font: Space Mono
focus → background: hsl(var(--primary-light)) + shadow 4px
```

### Badges / Status Pills
```
border: 1.5px solid hsl(var(--foreground))
box-shadow: 2px 2px 0 hsl(var(--foreground))
font: Space Mono, bold, uppercase, xs
border-radius: 0px
```

### Section Labels
```
font: Space Mono, bold, xs, uppercase, tracking-widest
color: hsl(var(--muted-foreground))
```

### Bottom Sheets / Modals
```
border: 3px solid hsl(var(--foreground))
border-bottom: none  [anchored to bottom]
background: hsl(var(--card))
animation: slide-up
```

### Progress Bars
```
background (track): hsl(var(--foreground))  [dark track]
fill: hsl(var(--primary))  [or accent]
height: 1rem (h-4)
border-radius: 0px
```

### Crew Avatars
```
shape: square (0px radius)
border: 2px solid hsl(var(--foreground))
background: crew color (hsl(var(--crew-N)))
text: white, bold, initials
```

---

## 7. Page Structure

```
<div class="app-shell">          ← max-w-[430px], centered
  <header class="page-header">   ← sticky or static header
  <main class="page-content">    ← pb for tab bar clearance
  <nav class="tab-bar">          ← fixed bottom, 72px
</div>
```

### Page Header
```
background: hsl(var(--background))  [or primary for colored variant]
border-bottom: 3px solid hsl(var(--foreground))
height: ~56px
```

### Tab Bar
```
background: white
border-top: 3px solid hsl(var(--foreground))
height: 72px
fixed bottom, centered, max-w 430px
```

---

## 8. Animation

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `slide-up` | 300ms | cubic-bezier(0.16, 1, 0.3, 1) | Modals, bottom sheets |
| `fade-in` | 200ms | ease-out | Page transitions |
| `scale-in` | 250ms | cubic-bezier(0.16, 1, 0.3, 1) | Success states |
| `float` | 3s | ease-in-out infinite | Empty state icons |
| Button press | instant | — | translate(1px, 1px) |

---

## 9. What to Avoid

| ❌ Never | ✅ Instead |
|----------|-----------|
| `rounded-*` classes | No border radius |
| `shadow-*` Tailwind shadows | Custom offset box-shadow |
| `active:scale-*` | `active:translate-x-0.5 active:translate-y-0.5` |
| Blur effects | Hard edges |
| Gradient backgrounds | Flat solid colors |
| `text-white` / `text-black` directly | Semantic tokens |
| Inline hex/rgb colors | `hsl(var(--token))` |
| Multiple font weights on same element | Pick one weight |
| Lowercase headings | Always uppercase |
