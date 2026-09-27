# /agendamentos/limites/ — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900, 957 at 390); only the table scrolls.
- The action bar and the type rail scroll horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Agenda:** lists the account's agendas. **Serviço:** empty for this account.
- **Intervalo:** POR HORÁRIOS · POR DIA · POR SEMANA · POR MÊS · DIAS CORRIDOS.
- Each popover is 240px with search, "Limpar"/"Concluir" and a count badge on the trigger.
- **Todos / Agendamentos / Faltas:** switch `.htag--active`.
- **Limpar filtros:** resets the type and all three popovers.
- **Adicionar Limite:** opens a modal on the live site; **Listas de Bloqueio** goes to another page.

## Hover states
- Tags and buttons follow the shared `.htag` / `.hbtn` rules.

## Per-state content
- Unfiltered empty state: "Nenhum limite configurado / Adicione um limite para controlar o volume de
  agendamentos e faltas dos clientes." Filtered: "Nenhum limite encontrado / Nenhum limite corresponde
  aos filtros aplicados. Ajuste ou limpe os filtros."
- Table keeps 10 fixed empty rows (row height 3.25rem, head 38px).

## Responsive sweep
- **1440:** buttons at left, filters at right; table 1072 wide, empty message 464×150.
- **768:** same rows, action bar starts scrolling.
- **<768:** the button row and the filter bar stack; table 342 wide at 390, no page overflow.

## Data (fase de lógica)
- **Adicionar Limite** abre o modal clonado de `/agendamentos/limites/add`: os dois checkboxes
  "Aplicar o limite a todas as agendas em conjunto" e "…a todos os serviços" vêm marcados e, ao
  desmarcar, revelam o multi-select da agenda e do serviço. Depois vêm Tipo de limite (FALTAS ou
  AGENDAMENTOS, obrigatório), Quantidade máxima, Período (POR HORÁRIOS, POR DIA, POR SEMANA, POR MÊS,
  DIAS CORRIDOS) e Definição do Limite (CPF, Usuário Cadastrado, Email, Nome, Telefone, as três
  combinações, IP de Origem, Chave Customizada, Total de Agendamentos).
- Como no original, **Período em dias** só aparece quando o período é DIAS CORRIDOS, e o campo
  Período perde o `md:col-span-2` nessa hora.
- Salvar grava em `data.limits`; a tabela mostra Tipo, Chave, Agenda(s), Serviço(s), Intervalo, Qtd.
  e as ações editar e excluir. Agenda(s)/Serviço(s) mostram "Todas"/"Todos" quando o limite vale
  para todas.
- Os filtros Agenda, Serviço, Intervalo e as tags Todos/Agendamentos/Faltas filtram essas linhas;
  **Limpar filtros** volta tudo.
- O limite vale de verdade: **Novo Agendamento** conta os agendamentos (ou as faltas) que já existem
  na mesma janela para a mesma chave e, se o limite já foi atingido, não grava e a barra de salvar
  passa a "Limite atingido" com o nome do cliente e a regra que barrou.

## Verificação
`node --experimental-strip-types src/lib/seiri/limits.test.mjs` cobre as regras: um por dia,
"Mesmos Nome e Telefone" juntando dois cadastros, cancelado não conta, FALTAS só conta NO_SHOW,
a janela de N dias corridos e o limite preso a outra agenda.

No build estático: criar "AGENDAMENTOS · 1 · 7 DIAS CORRIDOS · Mesmos Nome e Telefone" mostra a
linha na tabela com Agenda(s) "Todas" e Serviço(s) "Todos"; a tag **Faltas** esvazia a tabela com
"Nenhum limite encontrado".

## Diferenças em relação ao original
- "Chave Customizada" e "IP de Origem" não têm de onde tirar um valor neste clone: caem no próprio
  cliente, como "Usuário Cadastrado". O original ainda mostra campos extras para a chave
  customizada, que ficaram de fora.
- O original grava pelo servidor (`hx-post`); aqui o modal grava direto nos dados do navegador.
- O aviso de limite atingido reaproveita o toast da barra de salvar, porque o original mostra a
  mensagem numa resposta HTMX que este clone estático não tem.
