# Conta › Administrar Agendas — Behaviors

- **Modals:** each card opens its modal. They close on Cancelar, ×, a backdrop click or
  Escape. Nothing is applied in the prototype.
- **Bloquear / Desbloquear:** "Motivo do Bloqueio" shows (and is enabled) only for
  Bloquear.
- **Agenda targets:** "Selecionar todas as agendas" hides the picker (`display:none`).
- **Lists:** the agenda pickers are empty, as on the live account. "Responsável" lists the
  account user, shown with a mock email.
- **Time fields (new `shared/TimePicker`):** a port of `hTimePicker`.
  - A native time input, plus Hora (00–23) / Min (every 5) columns.
  - The popover is teleported and scrolls to the selected values when it opens.
- **Date fields (`shared/DatePicker`):** now teleported like the original's `hDatePicker`.
  - They were absolute under the field, 4px away; a scrolling modal would have clipped them.
  - The placement is now `shared/useAnchoredPopover`, shared with `PhoneInput` and
    `TimePicker`.
- **Label styling:** the page's own CSS makes labels bold inside its modals. The clone
  scopes that rule to `#agenda-admin`, the page container.

## Shared changes made here
- `Modal`:
  - `subtitle`;
  - `asForm` (the form wraps header, body and footer);
  - a new `md` size.
- `PhoneInput`:
  - uses `useAnchoredPopover`;
  - focuses the country search only once the popover is placed. Before, the focus call ran
    while the popover was still invisible, so the browser ignored it.
- New icons: `ClockSolidIcon`, `LockDuoIcon`, `CalendarPlusIcon`, `CalendarBlankIcon`,
  `PowerIcon`, `TuningIcon`, `CopyIcon`.
