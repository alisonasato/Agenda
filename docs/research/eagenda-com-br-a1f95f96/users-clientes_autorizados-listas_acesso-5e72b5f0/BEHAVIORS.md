# /users/clientes_autorizados/listas_acesso — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar scrolls horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Agenda:** empty for this account. **Serviço:** lists the account's service.
  Each popover is 240px with search, "Limpar"/"Concluir" and a count badge on the trigger.
- **Limpar filtros:** resets the search and both popovers. It sits alone on its row, aligned right —
  this page has no status tags, unlike the other list pages.
- **Nova Lista:** opens a modal on the live site (out of scope here).
- **Gestão Individual:** links to the per-client page, which is not cloned.

## Hover states
- Buttons and rows follow the shared `.hbtn` / `.htable` rules.

## Per-state content
- Unfiltered empty state: "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta
  tabela." Filtered: "Nenhum resultado encontrado / Nenhum registro corresponde aos filtros
  aplicados. Ajuste ou limpe os filtros para ver mais resultados."
- Table keeps 10 fixed empty rows (row height 3.5rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, buttons at right; table 1072 wide, empty message 389×130.
- **768:** same rows, action bar starts scrolling.
- **<768:** search full width and the button row wraps below; the table scrolls horizontally.
