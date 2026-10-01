# Comunicação › Acompanhamento — Behaviors

- **Filters:** every filter applies as soon as it changes (htmx on the live page; client
  state here).
- **Filtered empty state:** any active filter swaps the default empty state for the filtered
  one. Active filters are:
  - a status tag other than "Todas";
  - a period other than "Todos os períodos";
  - any agenda, type or appointment status picked.
- **Limpar filtros:** resets everything and closes any open popover.
- **Filtros menu:**
  - Its nested field popovers are teleported to `<body>`.
  - Clicks inside them don't close the menu. The original's click-outside ignores
    `.hselect-popover`, and `useDismiss` now takes that selector.
- **Popovers:**
  - Every popover opens on `<body>` with fixed positioning, as in the original.
  - Field lists (`hinline`) sit 4px below the trigger; the period picker and menus sit 6px
    below.
- **Status tags:** switch client-side.

## Shared fixes found here
- `DateRangePopover`:
  - Each month is always 42 cells (6 rows), like the original's `daysOf()`. The panel is 335px
    tall with the footer, so Relatórios gets it too.
  - It can be portaled (`anchor` + `panelRef`).
  - The non-portal CSS now puts it 6px below the trigger.
  - `preset` is optional, for "no period picked".
- `InlineFilter`: renders through `FloatingPanel`, 240px wide. Its "no results" icon is
  `w-6 h-6`, like the original; the same fix applies to the Agendamentos filters.
- `FloatingPanel`: gains `width` (number or "auto") and `gap`.

## Drift noticed on the live site (not changed here)
The Agendamentos listing's action bar has changed on eAgenda. Its period picker now has
"Limpar período", and the trigger sits in a different place.

## Data (fase de lógica)
- A tabela não guarda envios: `src/lib/seiri/sends.ts` calcula, para cada agendamento, quais
  regras de notificação o alcançam e quando cada uma dispara. Mudar uma regra muda esta tela na
  hora.
- Uma regra alcança o agendamento quando tem canal, envia para o cliente principal, vale para a
  agenda dele e — se não for imediata — o status bate com o Filtro de Status da regra.
- **Envio em** é o horário do agendamento para regras imediatas, ou o horário deslocado pelos dias,
  horas e minutos da regra, antes ou depois.
- **Situação** sai de comparar esse horário com agora: "Enviada" se já passou, "Aguardando" se
  ainda não, e "Cancelada" quando o agendamento foi cancelado.
- As tags e os filtros de Agenda, Tipo e status do agendamento filtram essas linhas.

## Verificação
No build estático: a tabela abre com os envios que as duas regras semeadas programam para os
agendamentos da semeadura — o lembrete só aparece nos confirmados, como o filtro da regra manda.
A tag **Aguardando** deixa só as linhas ainda por enviar.

## Diferenças em relação ao original
- As situações "Falhou", "Sem Crédito" e "Bloqueada" existem como filtro, mas o clone não as
  produz: não há envio de verdade nem créditos.
- A coluna Ações mostra “-”, como no original quando não há reenvio disponível.
- O original guarda cada envio como registro próprio e liga o status do agendamento à tela de
  detalhes; aqui a linha é derivada e não leva a lugar nenhum.
