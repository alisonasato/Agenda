# AgendaSettings Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-configurar-fc2519d1/AgendaSettings.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** input-driven (search) + click-driven (status tags, view tabs, filter popovers)

## DOM Structure
form#formFilter with two rows (search + Nova Agenda + action bar; status tags + Cards/Tabela +
Limpar filtros), then #agendas-container holding either #card_lists (grid of `.hnote` cards) or `.htable`.

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: form 328,96 1072×94; search 263×36;
status tags 206×28; view tabs 157×40; container 1072×618; card 518×618; spine tabs 50×586;
vitals 468×79; card footer 516×77; doc height 905.

## States & Behaviors
Status tags and search filter the cards. Cards ↔ Tabela swaps the container and slides the
indicator. Each filter popover keeps its own selection and shows a count on the trigger.

## Text Content (verbatim)
Buscar pelo identificador da agenda · Nova Agenda · Unidade · Serviço · Usuário · Filtros ·
Organizar · Configurações · Todas · Ativas · Inativas · Cards · Tabela · Limpar filtros

## Responsive Behavior
Two card columns at lg+, one below, with `pl-7` keeping the spine tabs visible; the table scrolls horizontally.
