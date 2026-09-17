# UsageCards Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/UsageCards.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** hover

## DOM Structure
.hwidget-head (title + hbtn 'Plano Teste') · grid > 4 × a.hmcard--{accent|warning|success} (icon, chevron, label, value/limit, .hmeter)

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: card 307×138; value 24px/800 #0a70d6; hbtn 123×32

## States & Behaviors
Meter width = value/limit.

## Text Content (verbatim)
Utilização · Agendamentos/Mês 0/100 · Usuários 1/2 · Unidades 0/2 · Contas 0/1

## Responsive Behavior
2 cols → lg 4.
