# BookingLimits Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-limites-7f458758/BookingLimits.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven (type tags + three filter popovers)

## DOM Structure
form#formFilter (Adicionar Limite · Listas de Bloqueio · `.hactionbar` with three `.hinline` filters),
then the type row (#limits-type-filters + Limpar filtros), then #limites-sections-container with the
`.htable` (7 columns, 10 empty rows, `.htable-empty` over them).

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: form 328,96 1072×38; action bar 357×38;
type rail 250×28 inside a 1072×32 row; table 1072×566; empty overlay 1064×520 with a 464×150 message;
first header cell 121×38; doc height 900.

## States & Behaviors
Any active filter switches the empty state copy. Popovers close on outside click or Esc and show a
count on their trigger. "Limpar filtros" resets type and every popover.

## Text Content (verbatim)
Adicionar Limite · Listas de Bloqueio · Agenda · Serviço · Intervalo · Todos · Agendamentos · Faltas ·
Limpar filtros · Tipo · Chave · Agenda(s) · Serviço(s) · Intervalo · Qtd. · Ações ·
Nenhum limite configurado · Adicione um limite para controlar o volume de agendamentos e faltas dos clientes.

## Responsive Behavior
Rows stack below md; the table scrolls horizontally; no page overflow at 390.
