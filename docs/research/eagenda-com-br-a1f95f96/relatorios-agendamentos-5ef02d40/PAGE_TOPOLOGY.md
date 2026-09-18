# Relatórios › Agendamentos — Page Topology

Source: `https://eagenda.com.br/relatorios/agendamentos/?version=3`
Route: `/relatorios/agendamentos`
Page key: `relatorios-agendamentos-5ef02d40`

## Shell
`DashboardShell`, sidebar group **Relatórios**, item **Agendamentos** active. Because
a top-level nav link is also called "Agendamentos", the sidebar item carries
`key: "relatorioAgendamentos"` and the page passes that as `active` — matching the live
page, which highlights only the Relatórios entry.

## Structure
Unlike the other two reports the whole page is one `<form>`
(`#appointments-report-filter-form`) — the preview lives inside it.

1. **Filter row** (`flex flex-col md:flex-row md:items-center gap-3`)
   - `ScrollRail` action bar (925.61×38 at 1440, 342×42 at 390) holding:
     - `.hdaterange` trigger, always `is-active`, last 30 days.
     - `InlineFilter` **Agenda** (calendar icon, 1 option, no selection → not `is-active`).
     - `InlineSelect` **Status** — Todos / Todos, menos os Cancelados / Somente Cancelados,
       default `exc_cancel`.
     - `InlineSelect` **Ordenar por** — Nome / E-mail / Hora do Agendamento, default Nome.
     - `InlineFilter` **Colunas** — 19 options, 11 pre-selected, so the trigger shows `11`.
     - `.hactionbar-sep` + **Limpar filtros** (`<a>` to `?reset=1`).
   - **Aplicar filtros** sits *outside* the rail in `md:ml-auto`, as a primary button
     (134.39×32) with the funnel icon — always visible, unlike the other reports where it
     only appears once a filter changes.

2. **`#report-preview`** (`mt-6 md:mt-8`, with an inner `mt-6 md:mt-8 hui-reveal`
   carrying `animation-delay: .04s`)
   - `.hwidget-head` (1072×24) — just the title **Prévia do relatório**, no description.
   - `.hui-card.hui-card--flush.hempty` (1072×318) — report icon,
     **Nenhum relatório foi gerado até o momento** and the hint to adjust the filters.

The original also ships an "Exportar Relatório" modal (`#report-export-modal-title`,
format CSV/XLS/PDF + LGPD acknowledgement) in a `<template>`, but nothing on the page
opens it while no report has been generated, so the clone does not render it.

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page container | 1152×492 | 1152×492 | 390×538 | 390×538 |
| form | 1072×428 | 1072×428 | 342×474 | 342×474 |
| filter row | 1072×38 | 1072×38 | 342×90 | 342×90 |
| `.hactionbar` | 925.61×38 | 925.61×38 | 342×42 | 342×42 |
| `.hactionbar-track` | 919.61×32 | 919.61×32 | 336×36 | 336×36 |
| `#report-apply-btn` | 134.39×32 | 134.39×32 | 134.39×36 | 134.39×36 |
| `#report-preview` | 1072×358 | 1072×358 | 342×360 | 342×360 |
| `.hwidget-head` | 1072×24 | 1072×24 | 342×24 | 342×24 |
| empty card | 1072×318 | 1072×318 | 342×320 | 342×320 |
| document height | 900 | 900 | 844 | 844 |
| rail track scroll | 983/920 | 983/920 | — | — |
| popovers Agenda / Status / Ordenar / Colunas | 240×104.5 / 240×177 / 240×177 / 240×334.5 | same | — | — |
