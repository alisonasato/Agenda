# AppointmentsReport

`src/components/sites/eagenda-com-br-a1f95f96/relatorios-agendamentos-5ef02d40/AppointmentsReport.tsx`

Client component rendering the whole `#appointments-report-filter-form`, filters and
preview together.

## State
| State | Purpose |
|---|---|
| `today` / `range` | frozen on mount; `range` = last 30 days |
| `agendas` | multi-select, starts empty |
| `status` | default `exc_cancel` |
| `ordering` | default `nome` |
| `columns` | `DEFAULT_COLUMNS`, the 11 the original pre-selects |
| `dateOpen` | date popover, dismissed via `useDismiss` |

## Shared pieces used
`ScrollRail`, `InlineFilter`, `InlineSelect`, `DateRangePopover` (`onClear` +
`initialMonth={range.from}`), `useDismiss`, `ROUTES`, and the icons `CalendarIcon`,
`CaretDownIcon`, `CheckReadIcon`, `CloseCircleIcon`, `FunnelIcon` plus the new
`SortIcon`, `SlidersIcon` and `ReportIcon`.

## Data
`COLUMNS` holds all 19 column labels in the original's order; `DEFAULT_COLUMNS` the 11
selected ones. `AGENDAS = ["Agenda Principal"]` stands in for the live account's agenda.

## Preview
Static empty state — report icon, "Nenhum relatório foi gerado até o momento" and the
hint text. The inner wrapper keeps the original's `animation-delay: .04s`.
