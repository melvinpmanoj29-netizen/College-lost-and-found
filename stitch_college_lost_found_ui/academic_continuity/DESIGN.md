---
name: Academic Continuity
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style

This design system is built on the principles of **Modern SaaS Minimalism**, specifically tailored for a high-utility college environment. The brand personality is efficient, trustworthy, and systematic. It aims to reduce the anxiety of losing a personal item by providing a clear, structured interface that feels like an institutional tool rather than a social media app.

The aesthetic prioritizes high-quality typography and precise spacing over decorative elements. It uses a "functional flat" approach: surfaces are distinguished by subtle borders and tonal shifts rather than heavy shadows or gradients. The result is a UI that feels lightweight, fast, and professional, drawing inspiration from high-productivity tools like Linear and Notion.

## Colors

The color palette is engineered for clarity and accessibility.
- **Primary (#2563EB):** Reserved for the "Happy Path"—submitting a found item, claiming a lost one, and primary navigation.
- **Neutral/Background (#F9FAFB):** A very light cool gray used for the application canvas to allow white cards to pop.
- **Surface (#FFFFFF):** All interactive containers and content cards use pure white to denote "active" or "content" areas.
- **Functional Colors:** Success, Warning, and Danger colors are used strictly for status indicators (e.g., "Returned," "Pending Verification," "Deleted").
- **Secondary Text (#64748B):** Used for metadata, descriptions, and labels to create a clear visual hierarchy against primary headings.

## Typography

The design system utilizes **Inter** for its neutral, systematic character. The hierarchy is "top-heavy," meaning headings are significantly bolder and tighter in letter-spacing than body text to allow for quick scanning of item titles.

- **Headlines:** Use a semi-bold (600) or bold (700) weight with slight negative letter-spacing to appear more compact and professional.
- **Body:** Standardized on 16px for optimal readability across various student demographics.
- **Labels:** Small labels use a medium weight (500) or uppercase tracking (0.05em) for status badges and metadata headers.
- **Contrast:** Always use the primary black/gray text color for titles and the Slate/Gray secondary color for descriptions and timestamps.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. The main content area is capped at 1280px to maintain line-length readability on ultrawide monitors.

- **The 8px Grid:** All margins, paddings, and component heights must be multiples of 4px, but ideally 8px (e.g., 8, 16, 24, 32).
- **Grid System:** Use a 12-column grid for desktop views. Item cards should typically span 3 columns (4 per row) or 4 columns (3 per row) depending on content density.
- **Mobile:** Transition to a single-column layout with 16px horizontal margins.
- **Consistency:** Use 16px (md) for internal card padding and 24px (lg) for vertical section spacing.

## Elevation & Depth

This design system avoids high-contrast shadows in favor of **Tonal Layering and Low-Contrast Outlines**.

- **Level 0 (Background):** #F9FAFB. No border.
- **Level 1 (Cards/Surfaces):** #FFFFFF. Border: 1px solid #E2E8F0. No shadow for standard cards.
- **Level 2 (Interactive/Hover):** When hovering over a card or button, apply a very soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
- **Level 3 (Modals/Overlays):** Elevated above all else with a centered backdrop blur (4px) and a medium shadow to focus attention.

Depth is communicated primarily through the 1px border contrast between the white surface and the gray background.

## Shapes

The shape language is **Soft and Precise**. A 0.25rem (4px) base radius is used for small components like checkboxes and inputs, while larger components like cards and modals use 0.5rem (8px). 

- **Small (4px):** Checkboxes, radio buttons, tags/badges.
- **Default (6px):** Standard buttons, input fields, select menus.
- **Large (8px):** Item cards, image containers, container boxes.
- **Extra Large (12px):** Modals, large feature sections.

Avoid fully rounded "pill" shapes for buttons to maintain a more professional, "tool-like" SaaS aesthetic.

## Components

### Buttons
- **Primary:** Background #2563EB, Text #FFFFFF. No gradient. Solid fill.
- **Secondary:** Background #FFFFFF, Border 1px #E2E8F0, Text #1E293B.
- **Ghost:** No background/border. Text #64748B. Used for "Cancel" or less frequent actions.

### Input Fields & Selects
- 1px border (#E2E8F0). Focus state uses a 2px ring of Primary color with 20% opacity.
- Placeholder text in #94A3B8.
- Label text positioned above the input in `label-md` style.

### Item Cards
- White background, 1px border.
- Image at the top with a fixed 16:9 aspect ratio.
- Title in `headline-sm`, metadata (location, date) in `body-sm` with Slate/Gray color.

### Status Badges
- **Lost:** Background #FEE2E2 (Light red), Text #B91C1C (Dark red).
- **Found:** Background #DBEAFE (Light blue), Text #1E40AF (Dark blue).
- **Resolved:** Background #D1FAE5 (Light green), Text #065F46 (Dark green).

### Toasts & Alerts
- Positioned at the top-right.
- Minimal icons to denote success/error.
- Use a white background with a colored left-border (4px) representing the status.

### Tables & Pagination
- Clean, border-bottom only for rows (#F1F5F9).
- No vertical lines.
- Pagination uses "Previous/Next" text buttons and simple numbered ghost buttons for high efficiency.