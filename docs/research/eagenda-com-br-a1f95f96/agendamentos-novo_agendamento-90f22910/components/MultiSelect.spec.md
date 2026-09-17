# MultiSelect Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/shared/MultiSelect.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven

## DOM Structure
.hautocomplete > label + .hautocomplete-control > .hautocomplete-field (.hautocomplete-rail with chips or placeholder + .hautocomplete-actions) + .hautocomplete-popover (search, options, footer)

## Computed Styles
Class names are the original's; values come from `src/app/eagenda.css` (dashboard.css filtered by
`scripts/extract-css-eagenda.mjs`). Measured at 1440×900: field 1002×36; chips 24px tall, rounded-full, background var(--color-default)

## States & Behaviors
Clicking the field opens the panel; options toggle; chips carry a '×'; the clear button empties everything; the footer counts selections and closes with 'Concluir'.

## Text Content (verbatim)
Buscar tags... · Digite para buscar clientes... · Digite para buscar acompanhantes... · Buscar membros da equipe... · Nenhum resultado encontrado · Concluir

## Responsive Behavior
Full width of its grid cell; chips wrap inside the rail.
