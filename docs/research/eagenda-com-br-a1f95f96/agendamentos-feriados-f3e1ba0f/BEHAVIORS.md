# /agendamentos/feriados — Behaviors

## Scroll sweep
- The page itself scrolls (doc height 1688 at 1440×900) — the only cloned page tall enough to do so.
- No scroll-driven effects; the topbar stays sticky as everywhere else.

## Click sweep
- **Editar Configuração** (pencil, one per agenda row): opens "Feriados de <agenda>" as a modal
  on the live site. Out of scope here.
- **Adicionar Feriado:** opens the custom-holiday modal on the live site. Out of scope here.
- No search, filters or tabs on this page.

## Hover states
- Rows and buttons follow the shared `.htable` / `.btn-icon` rules.

## Per-state content
- Configuração table: one row per active agenda, with `.hchip--default` chips reading "Não"/"Sim"
  for the two blocking options. Its empty state exists but stays hidden while there is a row.
- Feriados Customizados and Feriados do Sistema are both empty on this account and show
  "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta tabela."
- The system table declares pagination (`data-htable-paginate="true"`) but the
  `.htable-pagination` element is `hidden` while the list is empty — keeping it visible would add
  24px to the page height.

## Responsive sweep
- **1440:** three sections at 1062 wide; tables 359 / 358 / 566 tall.
- **768:** same stack, tables scroll horizontally.
- **<768:** section heads stack over their buttons; table 342 wide at 390, no page overflow.
