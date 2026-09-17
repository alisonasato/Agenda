# Relatórios › Clientes — Behaviors

## Interaction model
Server-rendered form. Nothing re-queries on change: selections are staged and only
take effect when **Aplicar filtros** is submitted. The clone mirrors this with an
`applied` state separate from the working state.

## Date range
- Always has a period applied, so the trigger carries `is-active` from first paint.
- Default window is **the last 30 days ending today** (`defaultRange`), shown as
  `DD/MM – DD/MM` in the trigger and `DD/MM/YYYY – DD/MM/YYYY` in the results header.
- The popover is the shared `DateRangePopover` plus a footer button
  **Limpar período** (`.hdaterange-footer > .hdaterange-clear`). The appointment
  list does not render that footer — hence the optional `onClear` prop.

## Aplicar filtros
`#report-apply-wrap` is `display:none` and only appears once the staged grouping
differs from the applied one (the original toggles it from Alpine on any filter
change; the clone keys it off the grouping, the only staged value that changes the
rendered output). Pressing it commits the grouping, which re-labels both the results
description and the first table column.

## Limpar filtros
Resets agendas, statuses and grouping back to **Nome Completo** and re-commits, so
the apply button hides again. It does not reset the period on the live site.

## Table
The live account has no appointments in any period, so the table is always
`htable-is-empty`: 10 aria-hidden spacer rows keep the 606px height and the
`.htable-empty` overlay shows **Nenhum cliente no período**. The first column
header follows the *applied* grouping, not the staged one.

## Responsive
- ≥768: action bar and tag row sit on one line each.
- <768: the action bar fills the width (42px tall) and the tag row wraps to two
  lines (64.5px), pushing the document to 1018px.
