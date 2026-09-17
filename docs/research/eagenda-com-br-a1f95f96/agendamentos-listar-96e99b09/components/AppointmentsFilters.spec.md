# AppointmentsFilters Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-listar-96e99b09/AppointmentsFilters.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven + input-driven

## DOM Structure
form#formFilter > .hui-search + right group (a.hbtn--primary + .hactionbar with .hdaterange, three .hinline filters, separators, Exportar) + .hrail-arrow

## Computed Styles
Class names are the original's; values come from `src/app/eagenda.css` (dashboard.css filtered by
`scripts/extract-css-eagenda.mjs`). Measured at 1440×900: form 328,96 1072×38; search 252×36; date popover 650×254 at left 778

## States & Behaviors
Each trigger opens its own popover, closed by outside click or Esc. Selections show a count badge. Period presets set the trigger label.

## Text Content (verbatim)
Buscar por cliente ou identificador · Novo Agendamento · Próximos 7 dias · Agenda · Serviço · Filtros · Visualizar · Exportar · Tag · Colaborador · Ver Agenda · Lista de Espera · Limpar · Concluir

## Responsive Behavior
Search goes full width below md and the button row wraps under it.
