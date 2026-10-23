# Design System Inspired by 报名及资审汇总

> Auto-extracted from `https://jicai.yzwqa.cn/tender/purchase/appoint-registration-qualification-summary?basicInfoNo=cscec202608210000063225` on 2026-10-23

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

**Key Characteristics:**
- Inter as the heading font
- sans-serif as the body font for all running text
- Light/white background (#f5f5f5) as the primary canvas
- Primary accent `#0081cc` used for CTAs and brand highlights
- 8 shadow level(s) detected — tinted shadows
- Rounded corners (2px+) creating a friendly, approachable feel
- Tags: light, rounded, colorful, compact, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#0081cc`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#ff3333`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#f5f5f5`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#dcfce7`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#bbbbbb`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#fafafa`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#dcfce7` | `--palette-2` | button | large | text-dark |
| 3 | `#f5f5f5` | `--palette-3` | button | large | text-dark |
| 4 | `#0081cc` | `--palette-4` | text-accent | large | text-light |
| 5 | `#bbbbbb` | `--palette-5` | button | medium | text-dark |
| 6 | `#262626` | `--palette-6` | button | small | text-light |
| 7 | `#ff3333` | `--palette-7` | badge | small | text-light |
| 8 | `#fff7e6` | `--palette-8` | button | small | text-dark |
| 9 | `#ff9933` | `--palette-9` | text-accent | small | text-dark |
| 10 | `#ffe8e6` | `--palette-10` | button | small | text-dark |
| 11 | `#e6f4ff` | `--palette-11` | badge | small | text-dark |
| 12 | `#7e8288` | `--palette-12` | badge | small | text-dark |
| 13 | `#d46b08` | `--palette-13` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `Inter`, sans-serif
- **Body Font:** `sans-serif`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H3 | -apple-system | 14px | 600 | 22px | normal |
| H4 | -apple-system | 14px | 500 | 30px | normal |
| Body | -apple-system | 14px | 400 | 22px | normal |
| Small | -apple-system | 14px | 400 | 22px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `32px` | headings |
| H1 | `24px` | headings |
| H2 | `22px` | headings |
| H3 | `18px` | headings |
| H4 | `16px` | headings |
| Body L | `14px` | body / supporting text |
| Body | `13px` | body / supporting text |
| Small | `12px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #262626;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #262626;
  border-radius: 2px;
  padding: 0px 8px;
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #bfbfbf;
  border-radius: 2px;
  padding: 0px 0px;
  font-size: 12px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #0081cc;
  color: #ffffff;
  border-radius: 2px;
  padding: 0px 15px;
  font-size: 14px;
  font-weight: 400;
  border: 0.625px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #262626;
  border-radius: 2px;
  padding: 0px 15px;
  font-size: 14px;
  font-weight: 400;
  border: 0.625px solid rgb(217, 217, 217);
  cursor: pointer;
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #0081cc;
  border-radius: 2px;
  padding: 0px 15px;
  font-size: 14px;
  font-weight: 400;
  border: 0.625px solid rgb(0, 129, 204);
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `16px` | element |
| spacing-3 | `1px` | element |
| spacing-4 | `6px` | element |
| spacing-5 | `4px` | element |
| spacing-6 | `2px` | element |
| spacing-7 | `10px` | element |
| spacing-8 | `13px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `2px` | subtle |
| radius-subtle | `4px` | subtle |
| radius-card | `50px` | card |
| radius-card | `32px` | card |
| radius-subtle | `3px` | subtle |
| radius-button | `6px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(5, 205, 255, 0.1) 0px 2px 0px 0px` | Cards, subtle elevation |
| Low | `rgba(38, 38, 38, 0.02) 0px 2px 0px 0px` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0.5) 1px 1px 2px 0px` | Cards, subtle elevation |
| High | `rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba...` | Modals, floating elements |
| Mid | `rgba(0, 0, 0, 0.05) 2px 2px 5px 0px` | Dropdowns, popovers |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#f5f5f5` as the primary background color
- Use `Inter` for all headings and `sans-serif` for body text
- Use `#0081cc` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`2px`+) consistently for all interactive elements
- Embrace bold color combinations — playful energy is the point
- Apply the shadow system for elevation — use the extracted shadow values

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Inter/sans-serif with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #f5f5f5
Text:        #000000
Accent:      #0081cc
Secondary:   #ff3333
Border:      #fafafa
```

### Example Prompts

1. "Build a hero section with a `#f5f5f5` background, `Inter` heading in `#000000`, and a `#0081cc` CTA button with 2px radius."
2. "Create a pricing card using background `#dcfce7`, border `#fafafa`, `sans-serif` for text, and 24px padding."
3. "Design a navigation bar — `#f5f5f5` background, `#000000` links, `#0081cc` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#f5f5f5` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 2 custom properties extracted from `:root` / `html` stylesheets.

### Spacing Variables

| Variable | Value |
|---|---|
| `--bannerHeight` | `0px` |

### Other Variables

| Variable | Value |
|---|---|
| `--animationDuration` | `0.5s` |
