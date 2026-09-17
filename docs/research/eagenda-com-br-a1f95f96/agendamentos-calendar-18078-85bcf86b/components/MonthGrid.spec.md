# MonthGrid Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-calendar-18078-85bcf86b/MonthGrid.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** static

## DOM Structure
.cal-fade-in > weekday header (grid-cols-7) + week rows (flex-1 grid-cols-7) > day cells (.group, number + event list)

## Computed Styles
Class names are the original's; exact values live in `src/app/agendamentos/calendar/18078/calendar.css`
(calendar-island.css + calendar-heroui.css filtered by `scripts/extract-css-eagenda.mjs`, plus the page's inline styles).
Measured at 1440×900 with the 72px rail: cell ≈157×150 at 1440; day number 11px/600; event chip 11px with rounded-md .cal-ev px-2 py-[3px]

## States & Behaviors
Today: number in an accent circle (w-5 h-5). Outside days: text-slate-500. Cells with events show a count badge; chips hover to brightness(.94). Last row drops its bottom border.

## Text Content (verbatim)
Dom Seg Ter Qua Qui Sex Sáb · Independência do Brasil (7 Set) · Nossa Senhora Aparecida (12 Out)

## Responsive Behavior
Same grid at every width; cells shrink with the viewport.
