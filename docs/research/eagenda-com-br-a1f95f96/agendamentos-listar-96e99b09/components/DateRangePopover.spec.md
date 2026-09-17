# DateRangePopover Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-listar-96e99b09/DateRangePopover.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven

## DOM Structure
.hdaterange-popover > .hdaterange-body > .hdaterange-presets-col + .hdaterange-cal-wrap (‹ ›, two .hdaterange-cal grids)

## Computed Styles
Class names are the original's; values come from `src/app/eagenda.css` (dashboard.css filtered by
`scripts/extract-css-eagenda.mjs`). Measured at 1440×900: popover 650×254; two months side by side; today marked with .is-today

## States & Behaviors
Presets switch the active item and the trigger label; ‹ › move both months together.

## Text Content (verbatim)
Hoje · Próximos 7 dias · Próximos 30 dias · Este mês · Todos os períodos

## Responsive Behavior
Same popover at every width (it is anchored to its trigger in the clone).
