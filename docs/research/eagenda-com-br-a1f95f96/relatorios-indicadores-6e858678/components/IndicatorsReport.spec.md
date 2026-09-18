# IndicatorsReport

`src/components/sites/eagenda-com-br-a1f95f96/relatorios-indicadores-6e858678/IndicatorsReport.tsx`

## State
| State | Purpose |
|---|---|
| `period` | `7` \| `30` \| `90` \| `180` \| `custom`, default `90` |
| `agendas`, `services` | staged multi-selects |
| `situation` | Filtros › Situação, default `ALL` |
| `customFrom`, `customTo` | the two date pickers |
| `applied` | snapshot committed by **Aplicar filtros**; drives the header window |

`dirty` compares the staged values with `applied`; `span` is `comparisonWindow(...)` for
the applied preset, or for the applied custom range when both dates are set.

## Sub-components
- **`MoreFilters`** — Filtros trigger + `#indicadores-more-panel` with the Situação select;
  its count is 1 when Situação is not *Todos*.
- **`KpiCard`** — `.hkpi` body (label, value with optional `$` prefix, blank caption) and
  an empty sparkline; rendered as an `<a target="_blank">` with the "Acessar" pill when the
  KPI has a `status` (deep link into `/agendamentos/listar`).

## Shared pieces
`ScrollRail`, `InlineSelect`, `InlineFilter`, the new `DatePicker`, `useDismiss`, `ROUTES`,
and `calendarDates` (`comparisonWindow`, `daysBetween`, `formatBR`, `parseBR`,
`pickerCells` — all new, covered by `calendarDates.test.mjs`).
New icons: `ChevronsLeftIcon`, `ChevronsRightIcon`, `ChartEmptyIcon`.
