# Comunicação › Acompanhamento — Behaviors

- **Filters:** every filter applies as soon as it changes (htmx on the live page; client
  state here).
- **Filtered empty state:** any active filter swaps the default empty state for the filtered
  one. Active filters are:
  - a status tag other than "Todas";
  - a period other than "Todos os períodos";
  - any agenda, type or appointment status picked.
- **Limpar filtros:** resets everything and closes any open popover.
- **Filtros menu:**
  - Its nested field popovers are teleported to `<body>`.
  - Clicks inside them don't close the menu. The original's click-outside ignores
    `.hselect-popover`, and `useDismiss` now takes that selector.
- **Popovers:**
  - Every popover opens on `<body>` with fixed positioning, as in the original.
  - Field lists (`hinline`) sit 4px below the trigger; the period picker and menus sit 6px
    below.
- **Status tags:** switch client-side.

## Shared fixes found here
- `DateRangePopover`:
  - Each month is always 42 cells (6 rows), like the original's `daysOf()`. The panel is 335px
    tall with the footer, so Relatórios gets it too.
  - It can be portaled (`anchor` + `panelRef`).
  - The non-portal CSS now puts it 6px below the trigger.
  - `preset` is optional, for "no period picked".
- `InlineFilter`: renders through `FloatingPanel`, 240px wide. Its "no results" icon is
  `w-6 h-6`, like the original; the same fix applies to the Agendamentos filters.
- `FloatingPanel`: gains `width` (number or "auto") and `gap`.

## Drift noticed on the live site (not changed here)
The Agendamentos listing's action bar has changed on eAgenda. Its period picker now has
"Limpar período", and the trigger sits in a different place.
