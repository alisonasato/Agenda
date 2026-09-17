# TrendChart Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/TrendChart.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** click-driven (period select) + Chart.js hover tooltip

## DOM Structure
.hsection card > head (title/desc + .hselect w-44) · legend row · .hcchart 260px canvas

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: section 328,583 1276×388; select 176×39; chart 1260×260

## States & Behaviors
Bar #0a70d6 radius 6 max 28px + line #008433 2.5px tension .4, no points; y grid rgba(102,112,133,.15); ticks #667085 10px; tooltip white/#e2e8f0. Period labels per periods.ts (tested).

## Text Content (verbatim)
Agendamentos vs. Atendimentos · Volume agendado x efetivamente atendido · Últimos 30 dias / 90 dias / 12 meses

## Responsive Behavior
Full width at all sizes.
