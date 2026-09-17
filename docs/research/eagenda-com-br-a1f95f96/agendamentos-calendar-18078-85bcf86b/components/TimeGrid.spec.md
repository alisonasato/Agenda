# TimeGrid Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-calendar-18078-85bcf86b/TimeGrid.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** scroll-driven (snap to day columns), static content

## DOM Structure
.cal-fade-in > .cal-tg-scroller > .cal-tg-grid (3.5rem + N day columns): sticky corner, sticky day headers (h-12), sticky time column, one .cal-tg-slots column per day

## Computed Styles
Class names are the original's; exact values live in `src/app/agendamentos/calendar/18078/calendar.css`
(calendar-island.css + calendar-heroui.css filtered by `scripts/extract-css-eagenda.mjs`, plus the page's inline styles).
Measured at 1440×900 with the 72px rail: scroller 336,117 1104×783; grid 1094×1248; day header 146×48; hour row 120px; half-slot 60px

## States & Behaviors
Auto-scrolls today into view. Today's header number: accent circle. Columns from today on: cursor-pointer + aria-label; past days inert. Slot lines drawn by a repeating-linear-gradient.

## Text Content (verbatim)
Dom Seg Ter Qua Qui Sex Sáb · 08:00 … 17:00 · Clique para incluir horário

## Responsive Behavior
Column min width 8.5rem (md+) / 6rem (below); the grid scrolls horizontally instead of shrinking.
