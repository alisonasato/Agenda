# ClientsReport

`src/components/sites/eagenda-com-br-a1f95f96/relatorios-clientes-f8ceb518/ClientsReport.tsx`

Client component — the whole page body below `DashboardShell`.

## State
| State | Purpose |
|---|---|
| `today` / `range` | frozen on mount; `range` = last 30 days (`defaultRange`) |
| `agendas`, `statuses` | staged multi-select values (`InlineFilter`) |
| `group` | staged grouping, one of the 5 `GROUPS` values |
| `applied` | `{ group }` committed by **Aplicar filtros** |
| `dateOpen` | date popover, dismissed via `useDismiss` |

`dirty = group !== applied.group` drives the visibility of `#report-apply-wrap`.

## Shared pieces used
- `../shared/DateRangePopover` — with `onClear` so the "Limpar período" footer renders.
- `../shared/InlineFilter` — Agenda and Status.
- `../shared/useDismiss`, `../shared/icons` (Activity, Calendar, CaretDown, CloseCircle, Users).

## Formatting
`short()` → `DD/MM` (trigger), `long()` → `DD/MM/YYYY` (results description).
Description reads `{DD/MM/YYYY – DD/MM/YYYY} · Agrupado por {label aplicado}`.

## Table
`.htable.htable-is-empty` with `--htable-head-h: 38px`, `SLOTS = 10` spacer rows,
columns `{appliedLabel} / Status / Agendamentos / Acompanhantes` (last two `--end`),
empty state `Nenhum cliente no período` with the `UsersIcon`.

## Mock data
`AGENDAS = ["Agenda Principal"]`. No client rows — matches the live empty account
and keeps personal data out of the repo.
