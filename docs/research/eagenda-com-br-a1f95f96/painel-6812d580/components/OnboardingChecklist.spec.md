# OnboardingChecklist Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/OnboardingChecklist.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** static (dismiss)

## DOM Structure
section.honbchecklist > head (title, desc, dismiss) · progress (track/bar/count) · ul > 4 a.honbchecklist-item (first .is-emphasis)

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: 328,96 1276×275; item 1232×36

## States & Behaviors
Dismiss hides the section.

## Text Content (verbatim)
Termine de configurar sua conta · Poucos passos e sua agenda fica completa. · 0/4 · Terminar a configuração da agenda · Adicionar logo e mensagem de boas-vindas · Fazer um agendamento teste · Escolher seu plano

## Responsive Behavior
Labels wrap on mobile.
