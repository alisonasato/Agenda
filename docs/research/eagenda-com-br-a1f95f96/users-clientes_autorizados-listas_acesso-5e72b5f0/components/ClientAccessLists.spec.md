# ClientAccessLists Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/users-clientes_autorizados-listas_acesso-5e72b5f0/ClientAccessLists.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** input-driven (search) + click-driven (two filter popovers)

## DOM Structure
form#formFilter (search + Nova Lista + `.hactionbar` with Agenda/Serviço, a separator and the
"Gestão Individual" link), then a row holding only "Limpar filtros", then #acl-table-container
with the `.htable` (7 columns, 10 empty rows, `.htable-empty` over them).

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: form 328,96 1072×38; search 288×36;
action bar 402×38; table 1072×606; empty overlay 1064×560 with a 389×130 message; doc height 900.

## States & Behaviors
Search or either popover switches the empty state copy; popovers close on outside click or Esc and
show a count on their trigger; "Limpar filtros" resets all three.

## Text Content (verbatim)
Buscar por nome ou email do cliente · Nova Lista · Agenda · Serviço · Gestão Individual ·
Limpar filtros · Lista · Configurações · Permissões · Clientes · Limites · Status · Ações ·
Nada por aqui ainda · Assim que houver registros, eles aparecerão nesta tabela.

## Responsive Behavior
Rows stack below md; the table scrolls horizontally; no page overflow at 390.
