# AgendasSection Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/AgendasSection.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** input-driven (name filter)

## DOM Structure
.hwidget-head · .hgrid-toolbar search · md: .htable (7 cols, 5 fixed slots with .htable-row--empty) · <md: cards

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: table 328,1324 1276×326; header 12px/600 #667085; cell h 56

## States & Behaviors
Filter accent-insensitive; no match → .htable-empty 'Nenhum resultado encontrado'. Settings icon rotates 90° on hover.

## Text Content (verbatim)
Minhas Agendas de Atendimento · Gerencie suas agendas e monitore a ocupação · Painel Configuração · Buscar agendas pelo nome... · Agenda/Hoje/Amanhã/Próx 7 dias/Taxa Ocupação/Status/Ações · Sem horários disponíveis · Ativo (agenda name mocked)

## Responsive Behavior
Columns appear at md/lg/xl; cards below md.
