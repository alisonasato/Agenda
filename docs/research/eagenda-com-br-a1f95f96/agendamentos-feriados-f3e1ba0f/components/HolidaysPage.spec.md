# HolidaysPage Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-feriados-f3e1ba0f/HolidaysPage.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** static (both buttons open modals on the live site)

## DOM Structure
Three sections, each `.hwidget-head` (title + description, optional action) followed by an `.htable`:
config (4 columns, 6 slots, one real row), custom holidays (5 columns, 6 slots, empty) and
system holidays (2 columns, 10 slots, empty, hidden pagination in the footer).

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: each head 1062×44; tables 1062×359, 1062×358 and
1062×566; "Adicionar Feriado" 168×36; empty message 389×130; doc height 1688.

## States & Behaviors
Static. The config table hides its empty state while it has rows; the other two show
"Nada por aqui ainda". The system table's pagination element stays hidden while empty.

## Text Content (verbatim)
Configuração de Feriados das Suas Agendas Ativas · Indique, por agenda, se feriados nacionais e
estaduais devem bloquear o atendimento. · Agenda · Bloquear em Feriados Nacionais · Bloquear
Feriados Estaduais · Ações · Feriados Customizados · Lista de feriados locais, recessos, dias sem
atendimento e períodos com atendimento reduzido. · Adicionar Feriado · Dia · Horário · Descrição ·
Aplicar nas Agendas · Feriados do Sistema · Lista de feriados já existentes no sistema. Na
configuração da agenda, indique se é para considerar os feriados nacionais ou estaduais. ·
Nada por aqui ainda · Assim que houver registros, eles aparecerão nesta tabela.

## Responsive Behavior
Sections stack at every width; tables scroll horizontally below md.
