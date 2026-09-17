# /agendamentos/limites/lista_bloqueios — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900, 961 at 390); only the table scrolls.
- Action bar and status rail scroll horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Tipo:** popover (240px) listing E-mail · Telefone · CPF, with search, "Limpar"/"Concluir"
  and a count badge on the trigger.
- **Todos / Ativos / Inativos:** switch `.htag--active`.
- **Limpar filtros:** resets search, status and the type filter.
- **Incluir bloqueio:** opens a modal on the live site (out of scope here).
- **Limites de Agendamento:** goes back to /agendamentos/limites.

## Hover states
- Tags, buttons and table rows follow the shared `.htag` / `.hbtn` / `.htable` rules.

## Per-state content
- Unfiltered empty state: "Nenhum bloqueio cadastrado / Contatos impedidos de agendar por e-mail,
  telefone ou CPF aparecerão nesta lista." Filtered: "Nenhum bloqueio encontrado / Nenhum bloqueio
  corresponde aos filtros aplicados. Ajuste a busca ou limpe os filtros."
- Table keeps 10 fixed empty rows (row height 3.25rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, buttons at right; table 1072 wide, empty message 464×150.
- **768:** same rows, action bar starts scrolling.
- **<768:** search full width and the button row wraps below; table 342 wide at 390, no page overflow.
