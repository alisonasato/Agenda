# AppointmentsList Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-listar-96e99b09/AppointmentsList.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven

## DOM Structure
filters + status row (#status-quick-filters .htag + Limpar filtros + Colunas menu) + #appointment-table (.htable with 10 empty rows and .htable-empty over them)

## Computed Styles
Class names are the original's; values come from `src/app/eagenda.css` (dashboard.css filtered by
`scripts/extract-css-eagenda.mjs`). Measured at 1440×900: status rail 585×28; actions 263×32; table 1072×606; empty state 1064×560; header cell 187×38

## States & Behaviors
Status tags switch .htag--active; the columns menu toggles col_tags/col_owner/col_comment; 'Limpar filtros' resets search, status and period.

## Text Content (verbatim)
Todos · Confirmados · Pendentes · Atendidos · Não compareceu · Cancelados · Limpar filtros · Colunas · Colunas visíveis · Identificador · Status · Cliente · Agenda / Serviço · Quando · Ações · Recibo · Nenhum agendamento encontrado

## Responsive Behavior
Table scrolls horizontally below md; the status row becomes a scrollable rail.
