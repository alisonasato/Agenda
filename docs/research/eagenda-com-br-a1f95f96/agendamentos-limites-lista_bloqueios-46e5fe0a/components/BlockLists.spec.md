# BlockLists Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-limites-lista_bloqueios-46e5fe0a/BlockLists.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** input-driven (search) + click-driven (status tags, type filter)

## DOM Structure
form#formFilter (search + Incluir bloqueio + `.hactionbar` with the Tipo filter, a separator and the
link back to the limits page), the status row (#suppression-status-filters + Limpar filtros), then
#suppression-table-container with the `.htable` (8 columns, 10 empty rows, `.htable-empty` over them).

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: form 328,96 1072×38; search 288×36;
action bar 317×38; status rail 208×28; table 1072×566; empty overlay 1064×520 with a 464×150 message;
doc height 900.

## States & Behaviors
Search, status or type switch the empty state copy. The type popover closes on outside click or Esc
and shows a count on the trigger. "Limpar filtros" resets all three.

## Text Content (verbatim)
Buscar por contato ou motivo · Incluir bloqueio · Tipo · Limites de Agendamento · Todos · Ativos ·
Inativos · Limpar filtros · Situação · Tipo · Chave · Motivo · Incluído em · Incluido por ·
Expira em · Ações · Nenhum bloqueio cadastrado · Contatos impedidos de agendar por e-mail, telefone
ou CPF aparecerão nesta lista.

## Responsive Behavior
Rows stack below md; the table scrolls horizontally; no page overflow at 390.
