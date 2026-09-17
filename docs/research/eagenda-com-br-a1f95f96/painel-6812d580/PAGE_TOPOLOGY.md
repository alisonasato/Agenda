# /painel/?version=3 — Page Topology

Source: https://eagenda.com.br/painel/?version=3 (requires login; captured 2026-09-16 with the owner's session).
Route: `/` (`src/app/page.tsx`). Stack on the original: Django + Tailwind v4.3.3 (compiled `dashboard.css`), Alpine.js, htmx, Chart.js 4.4.0.

## Layout
```
body.min-h-screen.flex.flex-row            (bg #F7F9FB, font Nunito)
└ div.flex.flex-row.w-full
  ├ div.sidebar-container                  (0 width; holds overlay + fixed aside)
  │ ├ #sidebarOverlay                      (mobile only, bg-black/50, z-50)
  │ └ aside#sidebar.sidebar                (fixed, 288px, z-60, bg #eff2f6)
  └ #mainContent                           (margin-left 288px ≥1024px)
    ├ nav.topbar                           (sticky top-0, h-16, z-40)
    ├ main > div.max-w-[1550px].px-6.py-8.lg:px-10
    │ ├ OnboardingChecklist   section.honbchecklist
    │ ├ KpiCards              grid 1/2/3 cols (sm/lg), 3 × a.hkpi--solid
    │ ├ TrendChart            .hsection card + Chart.js canvas (260px)
    │ ├ UsageCards            .hwidget-head + grid 2/4 cols (lg), 4 × a.hmcard
    │ └ AgendasSection        .hwidget-head + search + table (md+) / cards (<md)
    └ footer                               (white, border-top)
.help-center-container.hc-bottom-right     (fixed bottom/right 1.5rem, z-40)
```

## Interaction model per section
| Section | Model |
|---|---|
| Sidebar | click: group accordions (`.is-open`, grid-rows 0fr→1fr .22s), search filter (Ctrl+K) |
| Topbar | click: collapse toggle, notifications dropdown, language / account `hmenu` popovers |
| Checklist | static (dismiss button hides it) |
| KPI cards | hover: lift -2px, darker bg, CTA arrow +2px |
| Trend chart | click: period select (30d daily / 90d weekly / 12m monthly), Chart.js tooltip on hover |
| Usage cards | hover only |
| Agendas | input: live name filter → filtered empty state |
| Help center | click: toggle panel, Esc/outside closes |

Entrance animations: `.hui-enter` (fade .42s) and `.hui-reveal` (rise .5s), CSS only, no scroll triggers.
No smooth-scroll library, no scroll-driven behavior.
