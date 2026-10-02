# Conta › Administrar Agendas — Behaviors

- **Modals:** each card opens its modal. They close on Cancelar, ×, a backdrop click or
  Escape. Nothing is applied in the prototype.
- **Bloquear / Desbloquear:** "Motivo do Bloqueio" shows (and is enabled) only for
  Bloquear.
- **Agenda targets:** "Selecionar todas as agendas" hides the picker (`display:none`).
- **Lists:** the agenda pickers are empty, as on the live account. "Responsável" lists the
  account user, shown with a mock email.
- **Time fields (new `shared/TimePicker`):** a port of `hTimePicker`.
  - A native time input, plus Hora (00–23) / Min (every 5) columns.
  - The popover is teleported and scrolls to the selected values when it opens.
- **Date fields (`shared/DatePicker`):** now teleported like the original's `hDatePicker`.
  - They were absolute under the field, 4px away; a scrolling modal would have clipped them.
  - The placement is now `shared/useAnchoredPopover`, shared with `PhoneInput` and
    `TimePicker`.
- **Label styling:** the page's own CSS makes labels bold inside its modals. The clone
  scopes that rule to `#agenda-admin`, the page container.

## Shared changes made here
- `Modal`:
  - `subtitle`;
  - `asForm` (the form wraps header, body and footer);
  - a new `md` size.
- `PhoneInput`:
  - uses `useAnchoredPopover`;
  - focuses the country search only once the popover is placed. Before, the focus call ran
    while the popover was still invisible, so the browser ignored it.
- New icons: `ClockSolidIcon`, `LockDuoIcon`, `CalendarPlusIcon`, `CalendarBlankIcon`,
  `PowerIcon`, `TuningIcon`, `CopyIcon`.

## Data (fase de lógica)
- As seis **Ações em Lote** agora agem sobre os dados do navegador, cada uma na coleção que já
  existia:
  - **Bloquear / Desbloquear Horários** escreve (ou remove) em `data.blocks`, que é o que o
    calendário já lia;
  - **Incluir Horários** cria uma linha em `data.manualHours` e acrescenta o intervalo à semana das
    agendas em `data.hours`;
  - **Cancelar Agendamentos** passa para CANCELED os agendamentos das agendas no período;
  - **Ativar / Desativar Agendas** liga e desliga `Agenda.active`;
  - **Alterar Configuração** reescreve antecedência mínima e máxima, prazo de cancelamento e máximo
    por horário em `data.agendaRules`;
  - **Copiar Configuração** replica regras, horários e opções da agenda de origem nas escolhidas.
- **Horários Manuais** lista o que a ação Incluir Horários criou, com excluir.
- **Configuração de Agendas** é a visão global: status, horários livres da semana, duração,
  antecedência mínima–máxima, prazo de cancelamento e máximo por horário, com o lápis abrindo a
  configuração daquela agenda. A busca filtra pelo nome.

## Verificação
No build estático: a tabela de configuração abre com as duas agendas semeadas
(6 e 5 horários livres, 60 min, 1h – 7d, máx. 2); "Ativar / Desativar Agendas" com Desativar e
todas as agendas marca as duas como Inativa, nos dados e na tabela.

## Diferenças em relação ao original
- "Alterar Configuração" grava só os quatro campos que o modelo do clone tem; responsável, datas
  limite, idades e descrição são de tela.
- Desbloquear remove os bloqueios das agendas escolhidas sem olhar o horário, porque o clone guarda
  o bloqueio inteiro, não minuto a minuto.
