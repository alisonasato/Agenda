# Combobox Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/shared/Combobox.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven

## DOM Structure
.hcombobox > hidden input + label + .hcombobox-control (trigger is-filled | is-disabled | .hcombobox-input) + .hcombobox-actions (clear + chevron) + .hcombobox-popover > ul.hcombobox-options

## Computed Styles
Class names are the original's; values come from `src/app/eagenda.css` (dashboard.css filtered by
`scripts/extract-css-eagenda.mjs`). Measured at 1440×900: field 1002×62 (label 20px at 13px/600, control 36px); popover anchored under the field

## States & Behaviors
Opens on click/focus; typing filters; picking sets the value and closes; clear '×' resets. With no options it renders the disabled placeholder ('Selecione a agenda primeiro'). Empty search shows 'Nenhum resultado encontrado'.

## Text Content (verbatim)
Escolha a agenda · Selecione · Selecione a agenda primeiro · Selecione o dia primeiro · Nenhum resultado encontrado

## Responsive Behavior
Full width of its grid cell at every size.
