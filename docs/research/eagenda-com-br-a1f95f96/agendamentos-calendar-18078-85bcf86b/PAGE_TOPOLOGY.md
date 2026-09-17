# /agendamentos/calendar/18078/?calendars=18078&version=3 — Page Topology

Source: requires login; captured 2026-09-17 with the owner's session.
Route: `/agendamentos/calendar/18078` (`src/app/agendamentos/calendar/18078/page.tsx`).
The query string (`calendars=18078&version=3`) only selects the agenda and the UI version — no extra state to clone.

Original stack: Django shell (same as /painel) + a React "calendar island" (`calendar-island.js`) rendered into
`#calendar-root`, styled by two extra Tailwind v4 bundles (`calendar-island.css`, `calendar-heroui.css`).

## Layout
```
html.cal-sidebar-peek (clone: the peek CSS is unscoped, loaded only on this route)
body.min-h-screen.flex.flex-row            (height 100dvh, overflow hidden — no page scroll)
├ aside#sidebar                            (72px icon rail; expands to 288px over the content on hover)
└ #mainContent                             (margin-left 4.5rem)
  ├ nav.topbar                             (h-16: CTA "Incluir Agendamento" + ‹ date › + right icons)
  ├ main > #calendar-fullscreen > #calendar-root.heroui-scope
  │ ├ .cal-controls                        (52px: display menu · Dia/Semana/Mês tabs · actions)
  │ └ flex row
  │   ├ aside (264px, xl only)             mini month calendar + "Tudo em dia" panel
  │   └ view: TimeGrid (day/week) | MonthGrid
  └ footer                                 (rendered but display:none on this route)
button "Abrir menu" (fixed top-left, <lg)   opens the mobile sidebar
.help-center-container                      (same floating help button, calendar tutorials)
```

## Interaction model per section
| Section | Model |
|---|---|
| Sidebar rail | hover: `.is-peek-open` → width 288px + shadow, labels fade in (calPeekFade .18s) |
| Topbar | click: ‹ › step by view; CTA is decorative in the clone |
| Controls | click: view tabs (indicator slides .25s), "Exibição" popover with two radio groups |
| Mini calendar | click: day selects the week/day; its own ‹ › steps the month independently |
| Time grid | scroll: vertical hours, horizontal day columns with scroll-snap (auto-scrolled to today) |
| Month grid | static; holiday chips only |

Breakpoints: `xl` (1280) shows the mini calendar; `lg` (1024) switches rail ↔ off-canvas sidebar and shows
the topbar CTA; `md` (768) swaps the controls between the stacked mobile layout and the 3-column desktop one.
