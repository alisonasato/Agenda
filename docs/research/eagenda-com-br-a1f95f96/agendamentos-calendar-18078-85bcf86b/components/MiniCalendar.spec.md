# MiniCalendar Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-calendar-18078-85bcf86b/MiniCalendar.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven

## DOM Structure
aside.w-[264px] (xl only) > month header with ‹ ›, weekday initials grid, week rows (grid-cols-7 rounded-full) > day buttons · divider · empty-state panel

## Computed Styles
Class names are the original's; exact values live in `src/app/agendamentos/calendar/18078/calendar.css`
(calendar-island.css + calendar-heroui.css filtered by `scripts/extract-css-eagenda.mjs`, plus the page's inline styles).
Measured at 1440×900 with the 72px rail: aside 72,116 264×784; month label 13px/700; day button 32×32 12px; week row 231×32

## States & Behaviors
Selected week row: bg-accent/10 (others hover:bg-slate-100). Today: text-accent + inset ring 1.5px rgba(10,112,214,.55). Month ‹ › move only the mini calendar.

## Text Content (verbatim)
Setembro 2026 · D S T Q Q S S · Tudo em dia · Sem pendências nem agendamentos nos próximos 30 dias.

## Responsive Behavior
Hidden below xl (1280).
