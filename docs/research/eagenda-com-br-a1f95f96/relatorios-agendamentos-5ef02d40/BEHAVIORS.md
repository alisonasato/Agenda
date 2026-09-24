# Relatórios › Agendamentos — Behaviors

## Data (fase de lógica)
- "Aplicar filtros" gera a prévia: agendamentos do período, filtrados por situação e agenda e
  ordenados por nome ou data, com uma coluna por item marcado em Colunas (docs/DATA-LAYER.md).
- As colunas que o clone não guarda (endereço, nascimento, profissão, formulários…) saem como "—".

## Interaction model
A single form. The original submits it over htmx
(`hx-get=/relatorios/agendamentos/?generate=1`, swapping `#report-preview`), so the
preview only changes on **Aplicar filtros**. The clone keeps the filters live and leaves
the preview on its empty state, matching the untouched live page.

## Aplicar filtros
Always visible here, as a primary button outside the scroll rail — the other two
reports hide a ghost button until something changes. Nothing in the live page marks it
dirty or disabled.

## Limpar filtros
An `<a>` to `?reset=1`; it reloads with the server defaults rather than clearing state
in place.

## Search box rule (applies to every inline filter in the project)
The original's markup carries
`x-show="!(isStatic && staticOptions && staticOptions.length <= 7)"` on
`.hinline-search-wrap`: a static list of **7 options or fewer has no search box**. That
is why Agenda (1 option) opens at 240×104.5 while Colunas (19) opens at 240×334.5. The
shared `InlineFilter` now applies the same rule, as does the appointments list page's
local copy of the widget.

## Defaults
Status `exc_cancel` ("Todos, menos os Cancelados") and Ordenar por `nome` are
pre-selected, so both triggers are `is-active` from first paint and show their value.
Colunas starts with 11 of the 19 columns, so its trigger shows the count badge and is
`is-active` — `InlineFilter` gained that `is-active` state for this page.

## Export modal
Present in the DOM as a `<template>` but unreachable: no element on the page opens
`report-export-modal`. It presumably appears with a generated preview. Not cloned.
