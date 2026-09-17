# /agendamentos/listar/ — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar and the status row are rails: they scroll horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Período** (`Próximos 7 dias` by default): popover 650×254 with presets
  Hoje · Próximos 7 dias · Próximos 30 dias · Este mês · Todos os períodos, plus two month
  calendars with ‹ › navigation; today carries `.is-today`.
- **Agenda:** searchable list of the account's agendas; selections show a count badge on the trigger.
- **Serviço:** same widget, empty for this account ("Nenhum resultado encontrado").
- **Filtros:** menu with "Tag" and "Colaborador".
- **Visualizar:** menu with "Ver Agenda" and "Lista de Espera".
- **Status tags:** Todos · Confirmados · Pendentes · Atendidos · Não compareceu · Cancelados.
- **Limpar filtros:** resets search, status and period.
- **Colunas:** toggles for Tags · Responsável · CPF · Email · Telefone · Comentários, divider,
  Respostas Formulários. Each adds/removes its column (`col_tags`, `col_owner`, `col_comment`).
- **Novo Agendamento:** opens the form page (the live site opens it in a new tab).

## Hover states
- `.htag` and `.hbtn--secondary` darken on hover; column rows highlight with `hover:bg-gray-50`.

## Per-state content
- The account has no appointments, so the table always shows the filtered empty state:
  "Nenhum agendamento encontrado / Nenhum agendamento corresponde aos filtros aplicados. Ajuste o
  período ou limpe os filtros." The unfiltered variant reads "Nenhum agendamento por aqui / Os
  agendamentos das suas agendas aparecerão nesta lista."
- The table keeps 10 fixed empty rows (`data-htable-slots="10"`, row height 3.5rem, head 38px).

## Responsive sweep
- **1440:** search 252px at left, buttons at right; table 1072 wide.
- **768:** same layout, action bar starts scrolling.
- **<768:** search takes the full width and the button row wraps below it; table scrolls horizontally.
