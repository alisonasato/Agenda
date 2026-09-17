# AgendaNoteCard Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-configurar-fc2519d1/AgendaNoteCard.tsx`
- **Screenshot:** not saved; reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** static (links and buttons open modals on the live site)

## DOM Structure
.hnote (with `--hnote-color`) > .hnote-tabs (7 `.hnote-tab`, one per weekday) + .hnote-hooks +
.hnote-page > header.hnote-head (.hnote-mark, .hnote-title, .hnote-quick, .hnote-chips) +
.hnote-body (.hnote-vitals ×3, schedule section, .hnote-rules, .hnote-facts) + footer.hnote-foot.

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: card 518×618; spine 50×586; vitals 468×79;
footer 516×77. The spine colour comes from the per-agenda `--hnote-color` (#48CFAE in the live account).

## States & Behaviors
Hovering a vital or a weekday tab highlights it; the "Problemas" chip is a button with
`hover:brightness-95`. With no schedule the card shows the `.hnote-row--none` line.

## Text Content (verbatim)
Problemas · Videoconferência · Agendamentos futuros · Horários livres · Última data ·
Horários de atendimento · Ver/Editar todos os horários · Nenhum horário configurado ·
Duração · Opções a cada · Máx./horário · Antecedência · Pede ao cliente · Notificações ·
Confirmar · Novos · E-mail · Configurar · Ver Agenda

## Responsive Behavior
Card fills its grid cell (518 wide at 1440, 330 at 390); the spine tabs stay outside the page edge.
