# /agendamentos/recorrencias — Behaviors

## Data e botões (fase de lógica)
- A tabela lista as recorrências do navegador (docs/DATA-LAYER.md). "Total" conta os agendamentos
  que a regra criou e "Futuros" os que ainda vão acontecer.
- **Novo Agendamento Recorrente** abre o modal xl do original: Agenda* · Serviço · Dia* · Horário* ·
  Situação*, o bloco **Participantes** (Clientes · Acompanhantes · Responsável pelo atendimento ·
  Membros da equipe · Tags) e o bloco **Recorrência** (Identificador · Dias da semana* em sete
  pílulas · Intervalo "A cada N semanas" · Data final · Quantidade máxima), mais a caixa "Incluir
  estes agendamentos nas suas regras de notificações".
- Salvar **gera os agendamentos**: uma ocorrência por dia da semana marcado, semana a semana pelo
  intervalo, até a data final ou a quantidade máxima, um agendamento por cliente escolhido. Eles
  aparecem na lista de agendamentos e no calendário como qualquer outro.
- Na linha, **Ver agendamentos** abre a lista e **Excluir** apaga a regra junto com os agendamentos
  futuros dela, deixando os que já passaram.
- A busca e os filtros Agenda / Serviço / Tag filtram as linhas.

## Verificação
No build estático: uma regra em "Agenda Principal" às 09:00, com Seg e Qua marcados e quantidade 6,
criada em 27/09/2026 (domingo), gerou 28/09, 30/09, 05/10, 07/10, 12/10 e 14/10; a linha mostrou
"Consultas semanais · Agenda Principal · Consulta inicial · 6 · 6"; Excluir levou os agendamentos de
20 para 14 e a tabela voltou ao estado vazio.

## Diferenças em relação ao original
- "Acompanhantes" e "Membros da equipe" são campos de tela: o modelo não guarda nem um nem outro.
- As pílulas dos dias da semana usam classes utilitárias que o original tem no próprio bundle e que
  não saem na folha extraída; aqui o estado marcado vem de estilo inline, com o mesmo resultado.

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar scrolls horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Agenda / Serviço:** list the account's agenda and service. **Tag:** empty for this account.
  Each popover is 240px with search, "Limpar"/"Concluir" and a count badge on the trigger.
- **Limpar filtros:** resets the search and all three popovers.
- **Novo Agendamento Recorrente:** opens a modal on the live site (out of scope in the clone).

## Hover states
- Buttons and rows follow the shared `.hbtn` / `.htable` rules.

## Per-state content
- Unfiltered empty state: "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta
  tabela." Filtered: "Nenhum resultado encontrado / Nenhum registro corresponde aos filtros
  aplicados. Ajuste ou limpe os filtros para ver mais resultados." (Same copy the painel's agenda
  table uses.)
- Table keeps 10 fixed empty rows (row height 3.25rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, button + filters at right; table 1072 wide, empty message 389×130.
- **768:** same rows, action bar starts scrolling.
- **<768:** search full width and the button row wraps below; the table scrolls horizontally.
