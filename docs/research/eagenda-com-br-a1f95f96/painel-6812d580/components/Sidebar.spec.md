# Sidebar Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/Sidebar.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** click-driven (accordion groups, search filter, mobile slide-in)

## DOM Structure
aside#sidebar.sidebar > #logoContainer (logo img + mobile close) · search label.hui-search--pill · nav[role=navigation] > .snav-row links / .sidebar-group (button + .sidebar-group-content > ul.sidebar-sublist) / hr.sidebar-zone-divider · .sidebar-footer > .sidebar-plan-card

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: aside 0,0 288×100vh bg #eff2f6; search 20,96 248×36; active row 12,152 264×40 (15px/700, white, 3-layer shadow)

## States & Behaviors
Group open: .is-open, grid-rows 0fr→1fr .22s, chevron 180°. Search: Ctrl+K focus, filters leaves (label+group+keywords, accent-insensitive), empty → 'Nenhuma página encontrada.'. Mobile: .mobile-open translateX(0) .3s.

## Text Content (verbatim)
Painel, Calendário, Novo Agendamento, Agendamentos, Gestão de Agendas, Clientes, Relatórios, Formulários, Comunicação, Integrações, Conta, Ajuda; plan card 'Plano Teste' + chip 'Ativo' + 'Fazer upgrade'.

## Responsive Behavior
≥1024 fixed; <1024 off-canvas with overlay.
