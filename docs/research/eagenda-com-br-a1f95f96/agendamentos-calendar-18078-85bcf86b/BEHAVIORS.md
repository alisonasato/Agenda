# /agendamentos/calendar/ — Behaviors

## Scroll sweep
- The page itself never scrolls (`html, body { height: 100dvh; overflow: hidden }`); only the grid scrolls.
- `.cal-tg-scroller` has `scroll-snap-type: x proximity`, day columns `scroll-snap-align: start` with
  `scroll-margin-left: 3.5rem` (the sticky time column). On load it is scrolled so today is the first visible column
  (measured scrollLeft: 352 at 390px, 264 at 768px — both clamped to the maximum).
- Column min width comes from the island CSS: `minmax(6rem, 1fr)` below md, `minmax(8.5rem, 1fr)` at md+.
- No smooth-scroll library; entrance uses `.cal-fade-in` (opacity + 6px rise, .25s).

## Click sweep
- **View tabs:** `.htabs-tab.is-active`; `.htabs-indicator` slides with `transform .25s cubic-bezier(.32,.72,0,1)`.
- **‹ / ›:** step one day / week / month. Titles (desktop → mobile):
  - day `Quinta-feira, 17 de Setembro 2026` → `Qui, 17 set 2026`
  - week `13 – 19 de Setembro 2026` → `13 – 19 set 2026`; crossing a month `27 Setembro – 3 Outubro 2026` → `27 set – 3 out 2026`; crossing a year → `27 dez – 2 jan 2027`
  - month `Setembro 2026` (same in both)
- **Exibição:** framed popover (fixed, 320px, max-height min(80vh,30rem)) with two radio groups —
  "Tipo de Visualização" (Todos os Horários · Todos os Horários, sem agrupamento · Agendamentos, agrupados por horário ·
  Agendamentos, sem agrupamento) and "Cor dos Eventos" (Ocupação do Horário · Por agenda · Por status · Por serviço),
  plus a "Concluir" footer button. The trigger shows the selected view type.
- **Mini calendar day:** selects that date; the selected week row keeps `bg-accent/10`; today keeps an accent ring
  (`shadow-[inset_0_0_0_1.5px_rgba(10,112,214,0.55)]`).
- **Empty slots:** only today and future days get `cursor-pointer` + `aria-label="Clique para incluir horário"`
  (past days are inert). Clicking opens a create-appointment modal — out of scope for the clone.
- **Mobile menu button** (fixed, <lg): opens the off-canvas sidebar with its overlay.

## Hover sweep
- **Sidebar rail:** `.is-peek-open` on hover → `width: 288px !important` + `0 16px 40px rgba(15,23,42,.14), 0 4px 12px rgba(15,23,42,.08)`, `transition: width .22s`; labels/search/footer fade in (`calPeekFade .18s ease .06s`), and the minimal logo swaps for the full one (opacity .18s).
- **Mini calendar week rows:** `hover:bg-slate-100` (except the selected week).
- **Events:** `.cal-ev:hover { filter: brightness(.94) }` (transition .12s).

## Per-state content
- Week (13–19 Sep 2026) and day views: no appointments; hours 08:00–17:00, one 120px row per hour with a
  60px half-slot gradient (`.cal-tg-slots` repeating-linear-gradient, line `--cal-line: #cbd5e1`).
- Today's column header: white number on an accent circle (`w-6 h-6 rounded-full bg-accent`).
- Month view: 5 week rows (35 cells) for September 2026; the 7 Sep cell shows the holiday chip
  "Independência do Brasil" (`background-color: rgb(251,240,224); color: rgb(154,89,0)`) plus a count badge.
  October shows 12 Oct. Live labels come back mixed pt/en ("Our Lady of Aparecida"); the clone uses Portuguese.
- Left panel with no pending items: "Tudo em dia" / "Sem pendências nem agendamentos nos próximos 30 dias."

## Responsive sweep
- **1440 / 1280+:** rail sidebar, mini calendar visible, controls in 3 columns, topbar CTA at left 2.5rem.
- **1024–1279:** mini calendar hidden (`xl:flex`), everything else unchanged.
- **768–1023:** topbar CTA hidden, mobile menu button appears, grid columns min 8.5rem.
- **<768:** controls stack (date row with its own ‹ › + CTA icon, full-width tabs, scrollable action bar with a rail
  arrow), topbar keeps only the icon buttons, grid columns min 6rem.
