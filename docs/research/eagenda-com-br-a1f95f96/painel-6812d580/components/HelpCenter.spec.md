# HelpCenter Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/HelpCenter.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** click-driven

## DOM Structure
.help-center-container.hc-bottom-right > button.help-center-button + .help-center-panel (header, 3 items, footer)

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: button 48×48 #001f54 at bottom/right 24px; panel 340px, bottom 4rem

## States & Behaviors
Toggle; Esc/outside closes; active icon rotates 180°.

## Text Content (verbatim)
Precisa de ajuda? · Tutoriais relacionados a esta página · Entendendo o painel inicial · Configurar sua primeira agenda · Link de agendamento · Ver todos os tutoriais

## Responsive Behavior
Panel max-width 100vw-3rem.
