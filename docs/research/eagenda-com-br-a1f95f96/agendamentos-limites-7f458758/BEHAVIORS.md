# /agendamentos/limites/ — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900, 957 at 390); only the table scrolls.
- The action bar and the type rail scroll horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Agenda:** lists the account's agendas. **Serviço:** empty for this account.
- **Intervalo:** POR HORÁRIOS · POR DIA · POR SEMANA · POR MÊS · DIAS CORRIDOS.
- Each popover is 240px with search, "Limpar"/"Concluir" and a count badge on the trigger.
- **Todos / Agendamentos / Faltas:** switch `.htag--active`.
- **Limpar filtros:** resets the type and all three popovers.
- **Adicionar Limite:** opens a modal on the live site; **Listas de Bloqueio** goes to another page.

## Hover states
- Tags and buttons follow the shared `.htag` / `.hbtn` rules.

## Per-state content
- Unfiltered empty state: "Nenhum limite configurado / Adicione um limite para controlar o volume de
  agendamentos e faltas dos clientes." Filtered: "Nenhum limite encontrado / Nenhum limite corresponde
  aos filtros aplicados. Ajuste ou limpe os filtros."
- Table keeps 10 fixed empty rows (row height 3.25rem, head 38px).

## Responsive sweep
- **1440:** buttons at left, filters at right; table 1072 wide, empty message 464×150.
- **768:** same rows, action bar starts scrolling.
- **<768:** the button row and the filter bar stack; table 342 wide at 390, no page overflow.
