# Relatórios › Consolidado — Page Topology

Source: `https://eagenda.com.br/relatorios/consolidado?version=3` (no trailing slash)
Route: `/relatorios/consolidado`
Page key: `relatorios-consolidado-490246d7`

## Shell
`DashboardShell` as usual — sidebar group **Relatórios**, item **Consolidado** active.
Page title: "Relatório Consolidado". No page-scoped CSS.

## Sections, top to bottom

1. **`#formFilter`** (`.hui-reveal`) — a single action bar, 1072×38 at 1440, 342×42 at 390.
   The bar is a scroll rail (`ScrollRail`): `.hactionbar` with `.hrail-arrow--prev/--next`
   that appear only while the track can scroll. Track contents, in order:
   - `.hdaterange` trigger, always `is-active`, label `DD/MM – DD/MM`, default window
     = the last 30 days. Popover 650.45×335 **opening on the range start month**
     (Agosto 2026 for the 19/08–17/09 default), with the "Limpar período" footer.
   - `InlineSelect` **Status** (check-circle icon) — Todos / Cancelados / Atendidos /
     Faltantes, default Todos. Popover 240×213.
   - `InlineSelect` **Agrupamento** (4-square icon) — Tag / Serviço / Agenda,
     default Serviço. Popover 240×177.
   - **Filtros** menu (funnel icon) → `#consolidado-more-panel` (≈228×122) with three
     `.hmenu-filter-row`s, each a full-width `InlineFilter` (226×38): Agendas,
     Serviços, Tags.
   - `.hactionbar-sep`
   - `#report-apply-wrap` → **Aplicar filtros**, hidden until the grouping changes.
   - **Limpar filtros** — an `<a>` to `?reset=1`, not a button.
   - `.hactionbar-sep`
   - **Exportar** (download icon) → opens the LGPD dialog (384×280).

   There is no "Agrupar por" tag row here; the grouping lives in the action bar.

2. **`#report-results`** (`mt-6 md:mt-8`)
   - `.hwidget-head` (1072×44) — **Resultados** + `{período} · Agrupado por {agrupamento}`.
   - `#consolidado-table` (1072×566) — `.htable.htable-is-empty` with
     `--htable-row-h: 3.25rem` and `--htable-head-h: 38px`, columns
     Dia / Serviço-Agenda-Tag / Quantidade / Valor (last two `htable-col--num htable-col--end`),
     10 empty spacer rows and the `.htable-empty` overlay (464×150).

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page container | 1152×760 | 1152×760 | 390×756 | 390×756 |
| `#formFilter` | 1072×38 | 1072×38 | 342×42 | 342×42 |
| `.hactionbar` | 872.78×38 | 872.78×38 | 342×42 | 342×42 |
| `.hactionbar-track` | 866.78×32 | 866.78×32 | 336×36 | 336×36 |
| `.hwidget-head` | 1072×44 | 1072×44 | 342×44 | 342×44 |
| `#consolidado-table` | 1072×566 | 1072×566 | 342×566 | 342×566 |
| `.hempty` | 464×150 | 464×150 | — | — |
| document height | 900 | 900 | 889 | 889 |
| rail arrows (prev/next) | none/none | none/none | none/flex | none/flex |
| date popover | 650.45×335 | 650.45×335 | — | — |
| Status / Agrupamento popovers | 240×213 / 240×177 | 240×213 / 240×177 | — | — |
| export dialog | 384×280 | 384×280 | — | — |

Note: a first measurement of `.hactionbar` read 985.17px because the earlier interaction
sweep had already revealed "Aplicar filtros". On a freshly loaded page it is 872.78px.
