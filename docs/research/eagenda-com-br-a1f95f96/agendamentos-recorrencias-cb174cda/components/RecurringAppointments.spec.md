# RecurringAppointments Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-recorrencias-cb174cda/RecurringAppointments.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** input-driven (search) + click-driven (three filter popovers)

## DOM Structure
form#formFilter (search + Novo Agendamento Recorrente + `.hactionbar` with Agenda/Serviço/Tag),
then the section header row (h2 "Recorrências" + Limpar filtros), then
#recorrencias-table-container with the `.htable` (7 columns, 10 empty rows, `.htable-empty` over them).

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: form 328,96 1072×38; search 288×36;
action bar 326×38; header row 1072×32 with the h2 at 107×28; table 1072×566;
empty overlay 1064×520 with a 389×130 message; doc height 900.

## States & Behaviors
Any active filter switches the empty state copy; popovers close on outside click or Esc and show a
count on their trigger; "Limpar filtros" resets everything.

## Text Content (verbatim)
Buscar por identificador · Novo Agendamento Recorrente · Agenda · Serviço · Tag · Recorrências ·
Limpar filtros · Criado Em · Identificador · Agenda · Serviço · Total · Futuros · Ações ·
Nada por aqui ainda · Assim que houver registros, eles aparecerão nesta tabela.

## Responsive Behavior
Rows stack below md; the table scrolls horizontally; no page overflow at 390.
