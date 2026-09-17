# Relatórios › Clientes — Page Topology

Source: `https://eagenda.com.br/relatorios/clientes/?version=3`
Route: `/relatorios/clientes`
Page key: `relatorios-clientes-f8ceb518`

## Shell
Same `DashboardShell` as every other dashboard page: Sidebar (group **Relatórios**,
item **Clientes** active) + Topbar + FooterBar + HelpCenter.
Page title: "Relatório de Clientes". No page-scoped CSS — everything comes from
`src/app/eagenda.css`.

## Sections, top to bottom

1. **`#formFilter`** (`.hui-reveal`) — 1062×98 at 1440, 342×130.5 at 390.
   - `.hactionbar` / `.hrail-track` (524×38 at 1440) holding, in order:
     - `.hdaterange` trigger, permanently `is-active` (a period is always applied),
       label `DD/MM – DD/MM`. Opens `DateRangePopover` **with the `onClear` footer**
       ("Limpar período") — this page and the other reports are the only users of it.
     - `InlineFilter` **Agenda** (calendar icon, 1 option).
     - `InlineFilter` **Status** (activity icon, 11 options).
     - `.hactionbar-sep`
     - `#report-apply-wrap` → **Aplicar filtros**, `display:none` until the filter
       selection differs from what is applied.
     - **Limpar filtros** (close-circle icon).
   - Group tag row `.htaggroup` (1062×28 at 1440, 342×64.5 at 390 — it wraps):
     label `Agrupar por:` + 5 `.htag`s (Nome Completo / E-mail / CPF /
     Nome e E-mail / Nome, Email e Telefone). First one active by default.

2. **`#report-results`** (`mt-6 md:mt-8`)
   - `.hwidget-head` (1062×44) — title **Resultados**, description
     `{período completo} · Agrupado por {agrupamento aplicado}`.
   - `#clients-report-table` (1062×606) — `.htable.htable-is-empty` with
     `--htable-head-h: 38px`, 4 columns (`{agrupamento}` / Status /
     Agendamentos / Acompanhantes, the last two `--end`), 10 empty spacer rows,
     `.htable-empty` overlay (464×150 at 1440) and an empty `.htable-footer`.

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page container | 1142×860 | 1142×860 | — | — |
| `#formFilter` | 1062×98 | 1062×98 | 342×130.5 | 342×130.5 |
| `.hactionbar` | 524×38 | 524×38 | 342×42 | 342×42 |
| `.htaggroup` | 1062×28 | 1062×28 | 342×64.5 | 342×64.5 |
| `.hwidget-head` | 1062×44 | 1062×44 | 342×44 | 342×44 |
| `#clients-report-table` | 1062×606 | 1062×606 | 342×606 | 342×606 |
| `.hempty` | 464×150 | 464×150 | — | 302×170 |
| document height | 969 | 969 | 1018 | 1018 |
