# /clientes/listar — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar is a rail with `.hrail-arrow` buttons when it overflows.

## Click sweep
- **Filtros:** dialog titled "Filtrar clientes" with Nome · CPF/CNPJ · Email · Telefone · Empresa ·
  Documento da Empresa, each a `.hinput--sm` with its own placeholder; footer "Limpar" / "Aplicar".
  Applying shows a count badge on the trigger.
- **Adicionar Cliente / Importar / Consolidar / Exportar:** open modals or download on the live site.
- **Sidebar:** the "Clientes" group renders open, its toggle carries `.sidebar-group-active`, and
  "Listar Clientes" carries `.nav-item-active`.

## Hover states
- Buttons and table rows follow the shared `.hbtn` / `.htable` hover rules.

## Per-state content
- Unfiltered empty state: "Nenhum cliente cadastrado / Os clientes cadastrados ou importados
  aparecerão nesta lista." Filtered: "Nenhum cliente encontrado / Nenhum cliente corresponde à busca
  ou aos filtros aplicados. Ajuste ou limpe os filtros."
- Table keeps 10 fixed empty rows (row height 3.5rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, buttons at right; table 1072 wide.
- **768:** same layout, action bar scrolls.
- **<768:** search full width, buttons wrap below; table 358 wide with no page overflow.
