# ConsolidatedReport

`src/components/sites/eagenda-com-br-a1f95f96/relatorios-consolidado-490246d7/ConsolidatedReport.tsx`

Client component holding the whole page body, plus two local sub-components.

## State
| State | Purpose |
|---|---|
| `today` / `range` | frozen on mount; `range` = last 30 days |
| `status` | `all` \| `cancel` \| `done` \| `noshow` (default `all`) |
| `group` | `tag` \| `service` \| `calendar` (default `service`) |
| `agendas`, `services`, `tags` | staged multi-selects inside the Filtros menu |
| `applied` | `{ group }` committed by **Aplicar filtros** |
| `dateOpen`, `exporting` | popover / dialog visibility |

## Sub-components
- **`MoreFilters`** — the Filtros trigger + `#consolidado-more-panel`, three
  `.hmenu-filter-row`s wrapping shared `InlineFilter`s. The trigger's count is the
  number of the three lists that are non-empty.
- **`ExportDialog`** — `halertdialog` with the LGPD text, the acknowledgement
  checkbox and a confirm button disabled until it is ticked.

## Shared pieces used
`ScrollRail` (new), `InlineSelect` (new), `InlineFilter`, `DateRangePopover`
(with `onClear` and `initialMonth`), `useDismiss`, `ROUTES`, and the icons
`CalendarIcon`, `CheckReadIcon`, `ClipboardIcon`, `CloseCircleIcon`, `SearchSolidIcon`
plus the new `GridIcon`, `FunnelIcon`, `DownloadIcon`, `TagIcon`.

## Table
`.htable.htable-is-empty`, `--htable-row-h: 3.25rem`, `--htable-head-h: 38px`,
`SLOTS = 10`, columns Dia / Serviço-Agenda-Tag / Quantidade / Valor.

## Mock data
`AGENDAS = ["Agenda Principal"]`; services and tags are empty, matching the live
account and keeping personal data out of the repo.
