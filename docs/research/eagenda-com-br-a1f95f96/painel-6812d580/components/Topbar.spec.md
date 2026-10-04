# Topbar Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/Topbar.tsx`
- **Screenshot:** not saved (browser pane cannot write files); reference is the live page, see ../PAGE_TOPOLOGY.md
- **Interaction model:** click-driven (dropdowns)

## DOM Structure
nav.topbar > #sidebarCollapseToggle.tbtn · h1 (title) · actions: md:hidden '…' hmenu, bell dropdown, md:block language hmenu, lg:inline-flex activity button, account hmenu

## Computed Styles
All styling uses the original's class names; exact values live in `src/app/eagenda.css` (compiled `dashboard.css` filtered by `scripts/extract-css-eagenda.mjs` + inline page styles). Verified sizes at 1654px viewport: topbar 288,0 1356×64; h1 24px/700 slate-900

## States & Behaviors
Popovers close on outside mousedown / Esc (useDismiss). Trigger gets bg-slate-100 while open. Toggle icons swap via body.sidebar-collapsed.

## Text Content (verbatim)
Notificações · Nenhuma notificação não lida · Você está em dia! · Ver Todos · Conectado como · Minha Conta · Meus agendamentos · Barra lateral azul · Sair · English/Deutsch/Español/Français/Português

## Responsive Behavior
px-3 → md:px-6; buttons hide/show at md/lg.

## Account menu destinations (fase de lógica)
Checked against the live site on 2026-10-03:
- **Minha Conta** → `/accounts/profile/` — cloned as `/accounts/profile`.
- **Meus agendamentos** → `/agendamentos/meus-agendamentos/`, which lists what the signed-in user
  booked as a *client* of some organisation. The owner account has none, and the original answers
  with a 302 to `/agendamentos/configurar/`; the clone links straight there, which is the same page
  the original lands on.
- **Sair** → `/accounts/logout/`. The clone has no sign-in, so it stays inert.
- **Ver Todos** (notifications) -> `/inbox/notifications/list/`, not cloned yet.
