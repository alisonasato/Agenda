# Relatórios › Consolidado — Behaviors

## Data (fase de lógica)
- Uma linha por dia e chave de agrupamento (serviço, agenda ou tag), com a quantidade e a soma dos
  preços dos serviços (docs/DATA-LAYER.md). Período, status e os filtros de agenda, serviço e tag valem.
- Serviço sem preço entra como zero no valor.

## Interaction model
Same staged-filter model as [Relatórios › Clientes](../relatorios-clientes-f8ceb518/BEHAVIORS.md):
the form is server-rendered and nothing re-queries until **Aplicar filtros** is pressed.

## Action bar as a scroll rail
The original wraps the bar in Alpine's `hScrollRail()`; the clone uses
`shared/ScrollRail`. Both arrows are `display:none` while the track fits, and the
"next" arrow appears once the content overflows (at 390 the prev arrow stays hidden
until the user scrolls). This is JS-driven, not a CSS media query.

## Date range
Default window is the last 30 days ending today, always applied (`is-active` from
first paint). The popover opens on the **month the range starts in**, not the
current month — for the 19/08–17/09 default it opens on Agosto 2026, which is a
6-week month and makes the popover 335px tall instead of 301px. That is what the
shared popover's `initialMonth` prop exists for; both report pages pass `range.from`.
The footer carries **Limpar período**.

## Status and Agrupamento
Single-value filters (`InlineSelect`): the trigger shows `label` + the chosen
`.hinline-value`, options carry radio-style checks (`is-radio`/`is-checked`), there is
no search box, and the footer still offers Limpar / Concluir. "Limpar" restores the
default (Todos / Serviço).

## Filtros menu
A `dialog` popover stacking three full-width multi-selects (Agendas, Serviços, Tags).
Its trigger counts how many of the three have a selection (`.hinline-count`) and turns
`is-active` when that count is above zero.

## Aplicar filtros / Limpar filtros
`#report-apply-wrap` stays `display:none` until the grouping differs from what is
applied; committing it re-labels the results description. **Limpar filtros** is a link
to `?reset=1`, so it reloads the page with the server defaults rather than resetting
state in place.

## Exportar
Opens an LGPD acknowledgement dialog (`halertdialog`, warning icon). The **Exportar**
button inside is `disabled` until the checkbox is ticked. The clone reproduces the
dialog and the gating; it does not download a file, since there is no data.

## Table
Always empty on the live account, so the `filtered` empty variant shows:
**Nenhum agendamento no período**. (The `default` variant, "Nada por aqui ainda", only
renders when no filters are applied at all — unreachable here because a period always is.)
