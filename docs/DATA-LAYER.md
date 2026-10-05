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
| `booking.ts` | Os dias e horários que a tela pública de agendamento oferece |
| `csv.ts` | Exportar e importar CSV (ver abaixo) |
| `holidays.ts` | Feriados customizados e nacionais (ver abaixo) |
| `limits.ts` | Limites de agendamentos e listas de bloqueio (ver abaixo) |
| `sends.ts` | Os envios que Acompanhamento mostra (ver abaixo) |

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

## Onboarding
O assistente não guarda nada próprio: ele junta os campos dos sete passos e, ao terminar, escreve
na agenda, nos horários, na tela de agendamento e nas integrações.

## Formulários
`data.surveys` guarda os formulários: tipo, agendas vinculadas, data limite, login obrigatório e o
modelo importado, com a contagem de perguntas e de respostas que a tabela mostra.

## Ações em lote
"Administrar Agendas" não guarda nada próprio além de `data.manualHours`, as linhas que a ação
Incluir Horários cria. As outras cinco ações escrevem nas coleções que já existiam: bloqueios,
agendamentos, agendas, regras e horários.

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

## Tela de agendamento
`data.bookingScreen` guarda a tela pública do mesmo jeito que `orgSettings` guarda as
configurações: um mapa de nome de campo para valor. O original posta os seis passos num formulário
só, e o clone grava do mesmo jeito.

## Integrações
`data.integrations` guarda quais integrações a conta conectou, pelo nome que o card mostra. Como as
páginas de cada integração não foram clonadas, é o próprio card que liga e desliga.

## Acesso do suporte
`data.supportCode` guarda o código de acesso em vigor, para ele sobreviver a um recarregamento, e
`data.supportVisits` o histórico de visitas da equipe de suporte.

## Listas de acesso
`data.accessLists` guarda as listas de controle de acesso: o tipo de chave, os limites por período,
as agendas e os serviços que a lista alcança (vazio = todos) e os clientes convidados.

## Indicações
`data.referrals` guarda quem se cadastrou pelo link de indicação, com o status, as duas recompensas
e os pagamentos. Os quatro KPIs do Programa de Indicações são contados dessas linhas.

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

## Plano e AgendaCoins
`data.plan` descreve a assinatura (nome, ciclo, preço, os dois medidores de uso, a nota e a linha de
limites) e alimenta o cartão "Plano Atual" de `/users/planos`. As duas tabelas de arquivo dessa tela
leem `data.payments` (faturas) e `data.planHistory` (mudanças de plano); nenhuma das duas é
preenchida pelo clone, que não cobra nada.

O saldo de AgendaCoins mora em `data.credits.general`, ao lado dos créditos de SMS, e-mail e
WhatsApp, e cada movimento vira uma entrada em `data.coinTransactions`. `credits` ganhou ainda
`autoRecharge` (coins por mês, 0 quando a recarga mensal está desligada) e `paymentMethod` (vazio
quando não há cartão) — os dois KPIs de `/planos/transactions`. O `AddCreditsModal` compartilhado é
quem credita: soma os coins, grava a transação e, com a recarga marcada, guarda a quantidade mensal.

Como `credits` é o único objeto aninhado de formato fixo, `read()` o mescla com a semente em vez de
substituí-lo inteiro, para que dados gravados antes de um campo existir não o deixem indefinido.

## Tela pública de agendamento
`/agendar/minhaempresa` é a única rota fora do painel: é o que o cliente vê ao abrir o link de uma
agenda. Ela não inventa dados nenhum — lê `bookingScreen` (nome e mensagem da organização),
`units`, `agendas`, `services`, `agendaOptions` (quais campos pedir, senha, recorrência) e
`agendaRules` (antecedência mínima e máxima), e monta o calendário com o mesmo `slotsOf` do painel,
de modo que horários, bloqueios e feriados valem igual dos dois lados.

Confirmar grava um cliente em `clients` e um agendamento em `appointments` com status PENDING, que
é como o original deixa um agendamento externo até a agenda aceitá-lo — ele aparece em seguida na
lista de Agendamentos e no calendário do painel.

## Sua Conta
A tela `/accounts/profile` não tem um cadastro só dela: o nome, o e-mail e o telefone do usuário
são os do membro proprietário em `data.members`, o mesmo registro que "Convidar equipe" edita, de
modo que uma mudança aparece nos dois lugares e no menu "Conectado como" do topo.

`data.profile` guarda só o que é dessa tela: `emailVerified`, `newsletter`, `socialAccounts`
(os provedores vinculados), `extraEmails` (os endereços adicionados além do principal) e
`orgSlug`, o nome da organização que a tabela "Organizações" mostra ao lado das filiais de
`data.accounts`.

## Notificações
`data.notifications` é a caixa de entrada que o sino do topo e `/inbox/notifications/list`
mostram: cada linha tem nível, título, texto, quando e se foi lida. O sino lista as não lidas e a
página lista todas, com os filtros por nível e por status. A preferência de som fica em
`profile.notificationSound`.

Nada ainda cria notificações sozinho — elas vêm da semente. Quando alguma ação do painel passar a
avisar, é nessa coleção que ela escreve.

## Logs e modelos de e-mail da agenda
Os dois botões pequenos de cada card de agenda abrem coleções próprias. `data.agendaEmails` guarda
os modelos de e-mail daquela agenda — tipo, nome e assunto — que `/agendamentos/configurar_agenda/emails`
lista. `data.agendaLogs` guarda o histórico que `/agendamentos/historico` mostra, com `kind`
separando a aba de configurações da aba de horários: na primeira, `field`, `before` e `after` são a
configuração e os dois valores; na segunda, são o dia da semana e o começo e o fim da janela.

Nenhuma das duas é alimentada pelo resto do painel ainda: as linhas vêm da semente. Quando salvar
uma agenda passar a registrar o que mudou, é em `agendaLogs` que a linha entra.

## Acesso de clientes
As duas telas de acesso leem a mesma coleção. `data.accessLists` guarda cada lista com as suas
regras e o `clientIds` de quem ela deixa entrar: a tela de Gestão em Lote mostra as listas, e a de
Gestão Individual mostra o inverso, um cliente por linha com as listas que o alcançam. Tirar um
cliente na tela individual é tirá-lo de todos os `clientIds`.

O "Cliente ID" dessa tela é o `accessKey` do cliente, que vai no link de agendamento próprio dele.

## Grupos de usuários
`data.userGroups` guarda os grupos de permissão da equipe: nome, descrição, os membros de
`data.members` que pertencem a ele e as permissões escolhidas da lista fixa `MEMBER_PERMISSIONS`.
A tela de Convidar equipe abre a lista por um botão da barra de ações.

Os grupos ainda não governam nada: nenhuma tela consulta as permissões para esconder ou liberar
alguma coisa.

## Etapas da tela de agendamento
`data.agendaGroups` guarda cada etapa da tela pública: o nome que aparece para o cliente, o nome
para o link, a ordem entre as etapas da mesma altura, as agendas que ela oferece e o texto da tela.
Uma etapa sem agenda nenhuma é a que escolhe entre outros grupos, como o original explica no campo.

A tela de agendamento ainda não desenha essas etapas; por enquanto elas só existem nos dados.

## Convites de cadastro
Três coleções cobrem o fluxo de convidar clientes a se cadastrarem sozinhos:

- `data.invites` — um convite por lote de e-mails: a lista de destinatários, o texto escolhido
  (`templateId`, vazio = texto padrão do sistema), os campos pedidos no formulário (`fields` e
  `requiredFields`, ids de `INVITE_FIELDS`), se a aprovação é automática, se o cliente cria senha,
  a validade do link em dias, o status e a data de criação.
- `data.submissions` — o que chegou por esses links: nome, e-mail, as respostas dos campos
  opcionais em `answers`, o status e, numa rejeição, o motivo. Só uma linha `PENDING` ainda pode
  ser decidida.
- `data.inviteEmails` — os textos reutilizáveis, um `kind` por momento do fluxo
  (`INVITE_EMAIL_KINDS`). O `isDefault` vale por momento. Excluir um texto devolve os convites que
  o usavam ao padrão do sistema.

Nada sai por e-mail e nenhum acesso é criado: aprovar um cadastro só muda o status da linha.

## Notas de ambiente
- `next dev` não hidrata as rotas que usam `<Suspense>` + `useSearchParams` (Agendamentos, Unidades):
  a página aparece, mas não responde a cliques. O build estático (`GITHUB_PAGES=1 npx next build` e
  servir `out/`) hidrata normalmente — é assim que a fase de lógica vem sendo verificada.
