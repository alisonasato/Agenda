# /painel/?version=3 — Behaviors

## Scroll sweep
- Topbar is `sticky top-0` with `bg-[#F7F9FB]` (forced by inline style); no change on scroll.
- No scroll-triggered animations, snap points or smooth-scroll libraries.

## Click sweep
- **Collapse toggle (≥1024px):** adds `body.sidebar-collapsed` → `.sidebar{margin-left:-288px}`, `#mainContent{margin-left:0;width:100vw}`, `transition: margin-left .3s` (+ `width .3s` on main). Toggle icon swaps with opacity/rotate (.22s/.28s).
- **Collapse toggle (<1024px):** adds `aside.mobile-open` (translateX(-100%) → 0, .3s ease-in-out) and shows `#sidebarOverlay` (`opacity-100`). Overlay click or the ✕ in the sidebar header closes.
- **Sidebar group:** `.sidebar-group.is-open`, `aria-expanded=true`; chevron rotates 180° (.26s). Only one group open at a time.
- **Notifications:** `.dropdown-panel` under the bell (right-0 top-12 w-80). Empty state "Nenhuma notificação não lida / Você está em dia!".
- **Idioma:** menu with flags — English, Deutsch, Español, Français, Português (active + check).
- **Conta:** "Conectado como <email>", Minha Conta, Meus agendamentos, "Barra lateral azul" switch, divider, Sair (danger).
- **Period select:** options Últimos 30 dias / 90 dias / 12 meses (default 12m). Labels: 30 × `dd/mm`, 13 weekly × `dd/mm` starting today-90d, 12 × `Mmm/yy`.
- **Help button:** panel 340px, "Precisa de ajuda?" + 3 tutorials + "Ver todos os tutoriais"; button icon rotates 180° when active.
- **Checklist ✕:** dismisses the checklist (server POST on the original).

## Hover sweep
- `.snav-row` / `.snav-sub`: bg `#e2e7ee`, color `#101828` (.15s).
- `.hkpi--link`: translateY(-2px), bg mixed 90% with black, CTA bg `#ffffffe6`, arrow translateX(2px), glyph scale(1.06).
- `.help-center-button`: bg `#2a4a86`, translateY(-1px), bigger shadow.
- Settings icon in table rotates 90° (.3s) on button hover.

## Responsive sweep
- **≥1280 (xl):** table shows "Taxa Ocupação".
- **≥1024 (lg):** fixed sidebar visible; KPI grid 3 cols; usage grid 4 cols; "Atividade recente" button visible.
- **≥768 (md):** table replaces mobile cards; language button visible; "…" menu hidden.
- **<768:** agenda cards; topbar shows "…", bell, account.
- **<640 (sm):** KPI grid 1 col; "Configurar" replaces "Painel Configuração".
