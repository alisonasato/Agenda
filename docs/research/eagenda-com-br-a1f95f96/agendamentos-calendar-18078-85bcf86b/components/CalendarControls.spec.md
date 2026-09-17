# CalendarControls Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-calendar-18078-85bcf86b/CalendarControls.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven (tabs, Exibição popover); layout swapped in JS at 768px

## DOM Structure
.cal-controls > (mobile: date row + .htabs--fill + .hactionbar with rail arrow | desktop: grid 3 cols — hactionbar with .hinline-trigger · .htabs · hactionbar with 2 hbtn--ghost)

## Computed Styles
Class names are the original's; exact values live in `src/app/agendamentos/calendar/18078/calendar.css`
(calendar-island.css + calendar-heroui.css filtered by `scripts/extract-css-eagenda.mjs`, plus the page's inline styles).
Measured at 1440×900 with the 72px rail: controls 72,64 1368×52 (desktop) / 0,64 390×156 (mobile); tabs 258×40; active tab 83×32 14px/600; trigger 233×32 13px/500; right action bar 344×38

## States & Behaviors
Tab click moves .htabs-indicator (translateX(index*100%), .25s). Exibição popover: 320×438 framed, two radio groups, Concluir closes; outside click/Esc close.

## Text Content (verbatim)
Exibição: · Todos os Horários · Dia · Semana · Mês · Bloquear Horários · Configurar Horários · Tipo de Visualização · Cor dos Eventos · Concluir

## Responsive Behavior
Below md the whole block stacks and the action bar scrolls horizontally with a .hrail-arrow.
