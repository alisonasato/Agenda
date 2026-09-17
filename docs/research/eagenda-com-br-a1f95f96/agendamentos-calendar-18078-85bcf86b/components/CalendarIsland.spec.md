# CalendarIsland Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-calendar-18078-85bcf86b/CalendarIsland.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven (view + date state owner)

## DOM Structure
DashboardShell(peek) > topbar header (.cal-topbar-head: CTA + .cal-topbar-center with ‹ h1#calendar-period-title ›) · main > #calendar-fullscreen > #calendar-root.heroui-scope.light > controls + (MiniCalendar | view)

## Computed Styles
Class names are the original's; exact values live in `src/app/agendamentos/calendar/18078/calendar.css`
(calendar-island.css + calendar-heroui.css filtered by `scripts/extract-css-eagenda.mjs`, plus the page's inline styles).
Measured at 1440×900 with the 72px rail: topbar 72,0 1368×64; #calendar-root 72,64 1368×836; period title 20px/700

## States & Behaviors
Holds date/view/display state; ‹ › call shiftDate(view); view swaps TimeGrid (day = 1 column, week = 7) and MonthGrid.

## Text Content (verbatim)
Incluir Agendamento · Anterior · Próximo · 13 – 19 de Setembro 2026

## Responsive Behavior
CTA hidden <1024 (mobile has its own in the controls); title hidden <768.
