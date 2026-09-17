# /agendamentos/recorrencias — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar scrolls horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Agenda / Serviço:** list the account's agenda and service. **Tag:** empty for this account.
  Each popover is 240px with search, "Limpar"/"Concluir" and a count badge on the trigger.
- **Limpar filtros:** resets the search and all three popovers.
- **Novo Agendamento Recorrente:** opens a modal on the live site (out of scope in the clone).

## Hover states
- Buttons and rows follow the shared `.hbtn` / `.htable` rules.

## Per-state content
- Unfiltered empty state: "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta
  tabela." Filtered: "Nenhum resultado encontrado / Nenhum registro corresponde aos filtros
  aplicados. Ajuste ou limpe os filtros para ver mais resultados." (Same copy the painel's agenda
  table uses.)
- Table keeps 10 fixed empty rows (row height 3.25rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, button + filters at right; table 1072 wide, empty message 389×130.
- **768:** same rows, action bar starts scrolling.
- **<768:** search full width and the button row wraps below; the table scrolls horizontally.
