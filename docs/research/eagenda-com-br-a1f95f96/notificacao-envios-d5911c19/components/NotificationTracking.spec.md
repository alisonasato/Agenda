# NotificationTracking

`src/components/sites/eagenda-com-br-a1f95f96/notificacao-envios-d5911c19/NotificationTracking.tsx`

- **State:** `sendDate`, `agendas`, `types`, `more` {statuses, date} and `status` (the tag).
  A `resetKey` remounts the action bar on "Limpar filtros".
- **Local parts:**
  - `DateFilter`: an `.hdaterange` trigger with the portaled `DateRangePopover`.
  - `MoreFiltersMenu`: the "Filtros" menu, absolute under its `.hinline` (clone-only CSS rule
    in inline-styles.css).
- **Shared:** `InlineFilter`, `ScrollRail`, and the new icon `SearchEmptyIcon`.
