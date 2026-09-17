# FooterBar Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/FooterBar.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** hover

## DOM Structure
footer > nav (FAQ · Termos · Privacidade · Contato) + right group (© eAgenda · Mupi Systems · Instagram/LinkedIn icons)

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: 288,1682 1356×45; 12px #6b7280

## States & Behaviors
Links darken on hover.

## Text Content (verbatim)
FAQ · Termos · Privacidade · Contato · © eAgenda · Mupi Systems

## Responsive Behavior
column → md:row.
