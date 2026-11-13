---
name: VartaCart
description: Warm Organic Conversational Commerce Design System
colors:
  canvas: "#FBFBF8"
  surface: "#FFFFFF"
  tinted: "#F3F6F1"
  mint: "#E8F5EE"
  mint-dark: "#D1FAE5"
  forest: "#0A3622"
  forest-card: "#11472E"
  emerald: "#10B981"
  emerald-dark: "#059669"
  amber: "#F59E0B"
  amber-soft: "#FEF3C7"
  coral: "#E11D48"
  coral-soft: "#FFE4E6"
  text-primary: "#13221B"
  text-secondary: "#475950"
  text-muted: "#6C7D74"
  border-sketch: "#13221B"
  border-light: "#DCE5DF"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  sans:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-sketch:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.forest}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

## Overview

VartaCart's visual language pairs the warmth and trustworthiness of everyday Indian neighborhood commerce with modern, crisp SaaS precision. The palette is anchored by Deep Forest Green (`#0A3622`), Warm Ivory Canvas (`#FBFBF8`), and Soft Mint (`#E8F5EE`), enlivened by WhatsApp Emerald (`#10B981`) and hand-drawn Amber accents (`#F59E0B`).

## Colors

- **Forest Green (`#0A3622`)**: Authoritative base for primary buttons, logos, hero accents, and active dashboard navigation.
- **Ivory Canvas (`#FBFBF8`)**: Warm, non-sterile background replacing harsh blue-white screens.
- **WhatsApp Emerald (`#10B981`)**: Highlights WhatsApp verification status, paid orders, and live store sync.
- **Warm Amber (`#F59E0B`)**: Hand-drawn doodle highlights, warning badges, and medium RTO flags.
- **Coral Burgundy (`#E11D48` / `#9F1239`)**: High-risk RTO signals and urgent human escalation alerts.

## Typography

- **Display**: *Instrument Serif* — elegant, editorial, human serif used for hero titles and major section headings.
- **Interface**: *Plus Jakarta Sans* — legible, friendly, geometric sans-serif for UI cards, forms, and navigation.
- **Technical & Data**: *JetBrains Mono* — used for SKUs, integer paise prices, timestamps, and WhatsApp Cloud API payloads.

## Layout

- Responsive 12-column grid scaling from single-column mobile view to 1360px desktop dashboards.
- Master-detail split layout for the Conversations inbox (4 cols list, 8 cols transcript).

## Elevation & Depth

- Tactile neobrutalist-organic hybrid shadows (`2.5px 2.5px 0px #13221B`).
- Soft ambient blur for modal backdrops and sticky navigation.

## Shapes

- Rounded pill buttons for primary conversion actions.
- 14px–20px radii for dashboard cards.
- Hand-drawn SVG doodle squiggles, sparkles, and curved arrows.

## Components

- **WhatsApp Simulator**: Interactive Kirana phone frame with voice note playback, handwritten OCR zoom, live cart calculator, and UPI modal.
- **KPI Stat Cards**: Revenue, order velocity, conversion rates, and abandonment recovery.
- **Human Takeover Switcher**: Mode toggling between AI and Human with persistent silencing indicators.
- **RTO Shield Drawer**: Risk score (0–100), factor indicators, and neutral template dispatch actions.

## Do's and Don'ts

- **Do** format all currency in Indian Rupees (`₹`) formatted from whole integer paise.
- **Do** highlight live stock and reservation status clearly.
- **Do** provide clear feedback when human takeover silences the AI.
- **Don't** use generic blue gradients or standard flat SaaS bootstrap gray.
- **Don't** use thick colored borders on one side of a card (side-tabs).

