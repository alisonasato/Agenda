# NewAppointmentForm Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-novo_agendamento-90f22910/NewAppointmentForm.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven (dependent fields) + submit

## DOM Structure
form > .hformpanel with three .hformsection blocks + .hsavebar (dock + toast)

## Computed Styles
Class names are the original's; values come from `src/app/eagenda.css` (dashboard.css filtered by
`scripts/extract-css-eagenda.mjs`). Measured at 1440×900: panel 328,96 1062×850; section 1044×382 (first); save bar dock 1062×53; doc height 1100

## States & Behaviors
Dia unlocks after Agenda, Horário after Dia. The toast is hidden until a field changes. Submitting shows an acknowledgement (no backend in the clone).

## Text Content (verbatim)
Dados do agendamento · Participantes · Notificações · Adicionar cliente · Adicionar acompanhante · Enviar confirmação por e-mail · Incluir nas suas regras de notificações · Enviar confirmação por SMS · O envio automático de SMS está desabilitado no seu plano. · Voltar · Salvar Agendamento

## Responsive Behavior
Two columns at md+, single column below 768 (measured 298px cells at 390).
