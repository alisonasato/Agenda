# Camada de dados (fase de lógica)

O clone não tem servidor: as telas passam a funcionar de verdade lendo e gravando no **navegador**.

## Onde fica
`src/lib/seiri/`

| Arquivo | O que tem |
|---|---|
| `types.ts` | `Agenda`, `Service`, `Tag`, `Client` (com `Address` e `MARITAL_STATUS`), `Appointment`, `WaitingEntry`, `Data` e os rótulos/cores de status |
| `seed.ts` | Os dados iniciais: 2 agendas, 4 serviços, 3 tags, 6 clientes, 14 agendamentos e 4 inscrições na lista de espera. As datas são geradas **relativas a hoje** (de -6 a +12 dias), para os filtros de período terem o que mostrar |
| `store.ts` | `useData()`, `update()`, `reset()` e `nextId()` |
| `slots.ts` | Os slots de 30 minutos do calendário: `slotsOf()`, `slotColor()`, `hourRange()` |
| `select.ts` | Formatação (`formatWhen`, `formatMoney`, `formatDuration`), o filtro de período `inPreset()` e o `expand()` que troca ids por nomes |

## Como funciona
- Tudo vive em **localStorage**, chave `seiri.data.v1`. O primeiro acesso grava o seed; dali em diante
  o navegador é a fonte da verdade e as alterações sobrevivem ao reload.
- `useData()` lê num efeito, depois da hidratação: o HTML pré-renderizado (export estático) não tem
  dados, então cada lista aparece primeiro no seu estado vazio e preenche em seguida.
- `update(fn)` grava e repinta todos os componentes que estão lendo.
- `reset()` apaga o que o navegador guardou e volta ao seed.

## Linhas das tabelas
A conta usada como referência está **vazia em todas as telas**, então o original nunca mostrou uma
tabela preenchida. As linhas são construção deste clone, montadas com as peças do design system
(`htable-row`, `hchip--soft`, `hbtn--icon`) — é o único lugar em que o clone não copia o original.

## Exportar e importar
CSV é gerado e lido no navegador (`src/lib/seiri/csv.ts`): separador `;`, com BOM para o Excel em
pt-BR abrir os acentos. Exportam: Agendamentos, Clientes e o Relatório Consolidado (depois do aviso
de LGPD). Importa: Clientes, pelo modal "Importar Clientes", com as colunas que o original pede
(`cliente_id`, `nome`, `email`, `telefone`, `cpf`, `dt_nascimento`, `genero`, `nacionalidade`,
`profissao`). O original também aceita .xlsx e .xls; aqui, sem servidor, só .csv.

## Horários e bloqueios
`data.hours` guarda os intervalos de trabalho de cada agenda por dia da semana ("Configurar
Horários"); `data.blocks` guarda os períodos bloqueados ("Bloquear Horários"). `src/lib/seiri/slots.ts`
transforma os dois em slots de 30 minutos, que é o que o calendário desenha — o original serve a
mesma coisa pronta em `/agendamentos/calendar/get/`.

## Recorrências
`data.recurrences` guarda as regras de "Agendamentos Recorrentes". Salvar uma regra cria os
agendamentos dela na hora, marcados com `recurrenceId`, e apagar a regra remove os que ainda não
aconteceram.

## Regras de notificação
`data.notificationRules` guarda as regras de notificação: o nome, as agendas que alcança (vazio =
todas), os destinatários, a forma de envio com o texto ou o modelo, e quando enviar — imediato, ou
um deslocamento em dias/horas/minutos antes ou depois do horário, com um filtro de status.

## Modelos e envios
`data.emailTemplates` e `data.whatsappTemplates` guardam os modelos que as regras escolhem, e
"Usado em" conta as regras que apontam para cada um. Os envios não são guardados:
`src/lib/seiri/sends.ts` cruza os agendamentos com as regras e devolve o que Acompanhamento mostra —
quem recebe, por qual canal, quando sai e se já saiu.

## Notificações por status
`data.statusRules` guarda as regras que disparam quando um agendamento chega a um status. Uma
regra sem agendas é uma regra geral; com agendas, vale só para elas. Cada regra pode enviar por
WhatsApp, SMS e email ao mesmo tempo, e a lista abre uma linha por canal.

## Listas de bloqueio
`data.suppressions` guarda os contatos impedidos de agendar. `blockedBy` em
`src/lib/seiri/limits.ts` procura um bloqueio ativo e não vencido cujo e-mail, telefone ou CPF seja
o do cliente — o telefone e o CPF comparados só pelos dígitos — e é isso que o Novo Agendamento
consulta antes dos limites.

## Feriados
`data.holidays` guarda os feriados customizados e `data.holidayRules` o que cada agenda bloqueia.
`src/lib/seiri/holidays.ts` junta os dois: um feriado customizado fecha os dias (e as horas) que
nomeia nas agendas que alcança, e um feriado nacional fecha o dia nas agendas que pediram os
nacionais e não o desmarcaram. O gerador de slots consulta isso junto com os bloqueios manuais, e
o motivo que aparece no horário fechado é o nome do feriado.

## Créditos
`data.credits` guarda os quatro saldos (geral, SMS, email e WhatsApp) e `data.creditPurchases` o
histórico de compras. Os cartões do topo das telas de Comunicação e os saldos de "Pacotes de
Notificações" leem daí.

## Configurações gerais
`data.orgSettings` guarda os oito passos de "Configurações Gerais" como um mapa de nome de campo
para valor — texto ou booleano. Salvar um passo mescla os campos daquele passo no mapa, e cada
campo reabre no que está lá.

## Sub-contas
`data.accounts` guarda as contas da organização. A ligação fica do lado de quem pertence a elas:
`Agenda.accountId` e `Member.accountId`, vazios para a conta principal. Apagar uma sub-conta limpa
esses campos, devolvendo tudo para a conta principal.

## Equipe
`data.members` guarda quem tem acesso à conta: perfil, permissões, e as agendas, serviços e tags a
que o membro está vinculado. Um membro sem agendas tem acesso a todas.

## Unidades
`data.units` guarda as unidades de atendimento. A ligação com as agendas fica do lado da agenda,
em `Agenda.unitId`, então o formulário da unidade reescreve esse campo nas agendas que ele marca.

## Identificador da agenda
`Agenda.slug` é o "Identificador da Agenda". O passo Básicas da configuração da agenda e a tela
"Links de Agendamento" gravam o mesmo campo, e é dele que sai o link amigável
`https://minhaempresa.seiri.com.br/agenda/minhaempresa/<slug>`. Sem slug, a agenda aparece como
"Sem identificador" e a tela pede um.

## Limites de agendamentos
`data.limits` guarda as regras de "Limites de Agendamentos". `src/lib/seiri/limits.ts` conta, para
um agendamento novo, quantos já existem na mesma janela (o mesmo horário, dia, semana, mês ou os
últimos N dias corridos) para a mesma chave — CPF, e-mail, nome, telefone, as combinações deles, ou
o total sem separar por cliente — dentro das agendas e dos serviços que a regra alcança. Um limite
de FALTAS conta só os agendamentos com status NO_SHOW; um de AGENDAMENTOS conta todos menos os
cancelados. "Novo Agendamento" consulta isso antes de gravar.

## Criação e alterações
Cada agendamento guarda `createdAt` (semeado três dias antes dele), `updatedAt` e `changes`, a lista
que a aba "Alterações" da tela de detalhes mostra: uma linha por mudança de status, com data/hora,
responsável e o novo status.

## Pagamento e recibo
`paidExternally` no agendamento vem da caixa "Pagamento realizado externamente" do diálogo de
aceitar, e é o que o recibo mostra. O recibo em si é construção deste clone (o original emite PDF no
servidor) e sai em .txt pelo mesmo `download()` dos CSVs.

## Ajustes de um horário
`data.slotInfo` guarda o que os modais mudam em **um** slot — início, fim, máximo de pessoas e o link
de videoconferência — indexado por "<agenda>|<início>". O gerador de slots aplica isso por cima dos
horários da agenda.

## Cadastro completo do cliente
O modal da lista guarda o essencial; a tela `/clientes/editar/` guarda o resto do que o original
pede — tipo e número de identidade, naturalidade, distrito e os dados da empresa. É de lá que saem
a "Nome da Empresa"/"CNPJ" da tela de detalhes e os filtros de empresa da lista.

## Desativar em vez de apagar
A lixeira da lista de clientes marca `inactive` no cadastro em vez de removê-lo: o cliente sai das
listas e o histórico de agendamentos continua apontando para ele, que é o que o original faz
("Desativar cliente?").

## Consolidar clientes
O modal "Consolidar" agrupa os clientes que repetem os campos escolhidos (e-mail, telefone ou CPF),
mostra quantos grupos e quantos registros seriam fundidos e, ao confirmar, mantém o primeiro cadastro
de cada grupo, preenche os campos vazios dele com os dos outros e reaponta `appointments` e
`waiting` para quem ficou.

## Notas de ambiente
- `next dev` não hidrata as rotas que usam `<Suspense>` + `useSearchParams` (Agendamentos, Unidades):
  a página aparece, mas não responde a cliques. O build estático (`GITHUB_PAGES=1 npx next build` e
  servir `out/`) hidrata normalmente — é assim que a fase de lógica vem sendo verificada.
