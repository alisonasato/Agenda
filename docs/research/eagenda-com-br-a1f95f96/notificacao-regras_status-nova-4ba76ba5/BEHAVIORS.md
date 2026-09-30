# Comunicação › Nova Regra por Status — Behaviors

## Conditional blocks
Every conditional block is an Alpine `x-show`, so the clone keeps them mounted with
`display:none` (same reason as on Regras de Notificação: hidden siblings keep the `space-y`
margins). Turning on all three channels and "todas as agendas" gives 966px on both.

## Save bar (shared/SaveBar)
The original's `hsavebar`:
- the dock sits at the end of the form with **Voltar** (back to Notificações por Status) and
  **Salvar Regra** (save icon; a "Salvando..." label is present for the saving state);
- the floating toast ("Regra ainda não salva", pen icon) shows only when the form is
  **dirty and the dock is out of view** (`x-show="dirty && dockHidden"`);
- on desktop the toast is lined up with the dock (`left: 328px; right: 50px` at 1440 with the
  sidebar open); below 1024px it spans the viewport (`left: 0; right: 0`).

At 1440×900 the dock's top is at 893px, so it is in view and the toast never appears; at 390
the page is taller than the viewport and the toast appears as soon as anything changes.

The same bar is used by Novo Agendamento, whose clone had guessed the icons (✓) and showed
the toast whenever the form was dirty; it now uses `SaveBar` too (save/pen icons, the
original's rule; the prototype's "saved" acknowledgement is kept via `forceToast`).

## Status options
Loaded by the original from a JSON script tag (`status_options_json`): Pendente, Recusado,
Confirmado, Cancelado, Atendido, Não Compareceu, Pagamento Pendente.

## Empty lists
Agendas, WhatsApp templates and email templates are empty on the live account; kept empty.

## Data (fase de lógica)
- Sem `?id=`, a página cria uma regra; com `?id=`, carrega aquela regra e salva por cima.
- O seletor de agendas oferece as agendas da conta, e marcar **Aplicar a regra em todas as
  agendas** grava a regra sem agenda nenhuma — que é como a lista sabe separar Regras Gerais de
  Regras por Agenda.
- Salvar grava em `data.statusRules` e volta para Notificações por Status; o toast passa a
  "Regra salva".
- Os campos de cada canal só entram no que é gravado quando o canal está marcado.

## Verificação
No build estático: escolher "Confirmado", marcar todas as agendas e "Envio por SMS" e salvar
cria a linha em Regras Gerais; reabrir pelo lápis traz status, agendas e canal como foram salvos.

## Diferenças em relação ao original
- Herança para Subcontas é gravada, mas não faz nada: o clone não tem subcontas.
- Os modelos de WhatsApp e de email ficam vazios porque nenhum é cadastrado neste clone.
