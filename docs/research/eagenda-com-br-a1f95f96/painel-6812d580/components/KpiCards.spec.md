# KpiCards Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/KpiCards.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** hover

## DOM Structure
grid > 3 × a.hkpi.hkpi--solid (--hkpi-solid: accent / #f4256c / #f5a524) > .hkpi-body (glyph, label, value) + .hkpi-cta

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: card 409×148; value 30px/840; CTA 86×28 12px

## States & Behaviors
Hover: lift, darker bg, CTA arrow shift.

## Text Content (verbatim)
Agendamentos hoje 0 · Agendamentos amanhã 0 · Agendas cadastradas 1 · Acessar · Saiba Mais

## Responsive Behavior
1 col → sm 2 → lg 3.
