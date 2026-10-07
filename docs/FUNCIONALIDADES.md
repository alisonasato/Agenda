# O que dá para fazer no Seiri

Guia de todas as funcionalidades do protótipo, tela por tela, na ordem do menu lateral.

O Seiri é um sistema de agendamento online. Este protótipo reconstrói o painel do eAgenda tela a
tela e já funciona de verdade: criar, editar, filtrar e excluir gravam os dados e o resto do sistema
enxerga a mudança. O que ainda não funciona está marcado em cada tela, em **Limites**, e resumido no
fim, em [O que o protótipo ainda não faz](#o-que-o-protótipo-ainda-não-faz).

## Antes de começar

- **Onde acessar:** https://alisonasato.github.io/Agenda/ (atualizado a cada mudança no `main`), ou
  `npm run dev` na sua máquina.
- **Onde ficam os dados:** no próprio navegador (`localStorage`, chave `seiri.data.v1`). Não há
  servidor nem login. Cada navegador tem os seus dados; abrir em outro computador, em outro
  navegador ou numa janela anônima começa do zero.
- **Dados de exemplo:** o primeiro acesso já traz uma conta preenchida para testar: 2 agendas,
  4 serviços, 3 tags, 6 clientes, cerca de 14 agendamentos (com datas próximas de hoje), lista de
  espera, regras de notificação, uma equipe de 2 pessoas e mais alguns registros em outras telas.
- **Voltar ao início:** não há botão para isso. Para restaurar os dados de exemplo, apague os dados
  do site no navegador (ou só a chave `seiri.data.v1` nas ferramentas de desenvolvedor) e recarregue.
- **Busca no menu:** o campo de busca do menu lateral encontra qualquer tela pelo nome ou por
  palavras relacionadas (por exemplo, "etiquetas" leva a Tags).
- **Padrões que se repetem:** quase toda lista tem busca, filtros em botões, "Limpar filtros",
  paginação de 10 linhas e dois estados vazios (lista vazia e "nada corresponde aos filtros"). Toda
  exclusão pede confirmação. Formulários longos mostram um aviso flutuante quando há mudança ainda
  não salva.

---

## Painel

`/` — a tela inicial.

- **Checklist de primeiros passos:** os passos levam às telas certas; "Fazer um agendamento teste"
  aparece concluído quando já existem agendamentos. O × dispensa o checklist.
- **Agendamentos de hoje e de amanhã:** cartões que abrem a lista já filtrada pelo dia.
- **Utilização:** medidor de agendamentos do mês e botão para o plano.
- **Gráfico Agendamentos vs. Atendimentos:** barras de agendamentos (sem os cancelados) e linha de
  atendidos, para os últimos 30 dias, 90 dias ou 12 meses.
- **Minhas Agendas de Atendimento:** por agenda, quantos agendamentos há hoje, amanhã e nos próximos
  7 dias, a taxa de ocupação e o status, com atalho para configurar.

**Topo da tela (em todas as páginas):**
- **Sino:** lista as notificações não lidas e "Ver Todos" abre a caixa de entrada.
- **Ajuda:** painel com tutoriais da página atual.
- **Conta:** Minha Conta, Meus agendamentos (abre as agendas) e o seletor "Barra lateral azul".
- **Recolher menu:** esconde a barra lateral (no celular, abre e fecha o menu).

**Limites:** o checklist só sabe deduzir o passo do agendamento teste. O seletor de idioma, o
"Barra lateral azul" e "Sair" não mudam nada. Os tutoriais apontam para `seiri.com.br/docs`, que
não foi verificado.

---

## Calendário

`/agendamentos/calendar/…`

- **Visões dia, semana e mês**, com setas para avançar e voltar e um minicalendário para pular para
  uma data.
- O calendário desenha **os horários da agenda**, não só os agendamentos: horário livre, parcialmente
  ocupado ou lotado, cada um com sua cor. Bloqueios e feriados aparecem fechados, com o motivo.
- **Exibição:** escolhe o tipo de visualização e a cor dos eventos (ocupação, agenda, status ou
  serviço).
- **Clicar num horário** abre "Detalhes do Horário", com quem está agendado e estes botões:
  - **Bloquear Horário** (só aquela meia hora, com motivo);
  - **Editar Horário** (início, fim e máximo de pessoas só daquele horário);
  - **Videoconferência** (Google Meet, Teams, Zoom ou outro, com o link; o link passa a aparecer na
    coluna Local);
  - **Incluir Agendamento** ou **Encaixar Agendamento** (abre o formulário já com dia e hora);
  - **Sincronizar Google Agenda** (só a confirmação).
- **Ações por agendamento**, conforme o status, sempre com confirmação:
  - Pendente: Confirmar (com a opção "Pagamento realizado externamente"), Recusar, Editar;
  - Confirmado: Registrar Chegada, Não Compareceu, Cancelar, Editar.
- **Editar tags** e **Editar comentário** direto na linha.
- **Recibo:** mostra o agendamento e baixa em .txt.
- **Bloquear Horários:** bloqueia um período em uma ou várias agendas (datas, horários e motivo).
- **Configurar Horários:** define o expediente de cada dia da semana (vários intervalos por dia,
  com máximo de pessoas); dia sem intervalo fica "Fechado".

**Limites:** o recibo é uma construção do protótipo (o original gera PDF). Sincronizar com o Google
não sincroniza nada.

---

## Novo Agendamento

`/agendamentos/novo_agendamento`

- Escolha agenda, serviço (só os da agenda), dia, horário, status, tags e um ou mais clientes.
- Salvar cria **um agendamento por cliente escolhido** e abre a lista de agendamentos.
- **Regras que barram o agendamento:** se o cliente está numa [lista de bloqueio](#listas-de-bloqueio)
  ou já atingiu um [limite de agendamentos](#limites-de-agendamentos), nada é gravado e a barra de
  salvar diz por quê.

**Limites:** as ações "Incluir na lista de espera" e "Encaixar no horário" gravam um agendamento
comum (para a lista de espera, use a tela [Lista de Espera](#lista-de-espera)). "Aguardando
Pagamento" é gravado como Pendente. Acompanhantes, membros da equipe, "Adicionar cliente" e os
avisos por e-mail/SMS são só de tela. O responsável gravado é sempre a proprietária da conta.

---

## Agendamentos

`/agendamentos/listar`

- **Busca** e **filtros** por status (Todos, Confirmados, Pendentes, Atendidos, Não compareceu,
  Cancelados) e período (Hoje, Próximos 7 dias, Próximos 30 dias, Este mês, Todos ou um intervalo no
  calendário).
- **Colunas:** liga e desliga Tags, Responsável, CPF, Email, Telefone, Comentários e Respostas de
  Formulário.
- **Ações na linha**, conforme o status e com confirmação (as mesmas do calendário). Agendamento
  cancelado não tem ação.
- **Editar** (dia, horário, status e comentário), editar tags, responsável e comentário, **Recibo**
  e **excluir**.
- Telefone com link para WhatsApp e e-mail com link para enviar mensagem.
- **Exportar:** baixa um CSV com as linhas visíveis.
- **Confirmar Agendamentos** (menu Minha Agenda) abre esta lista já filtrada nos pendentes.

### Detalhes do agendamento

`/agendamentos/detalhes?id=…`

- Dados do agendamento, do cliente e do serviço, com "Criado em" e "Última alteração".
- Botões de decisão conforme o status (Aceitar/Rejeitar; Marcar atendido/Não compareceu/Cancelar).
  Cada decisão entra na aba **Alterações** com data, responsável e novo status.
- Atalhos para WhatsApp, e-mail, recibo, cadastro do cliente e editar comentário.

**Limites:** a aba Notificações fica sempre vazia (nada é enviado). Cobrança, Acompanhantes e
"Configurar link" de videoconferência são só de tela.

---

## Minha Agenda

### Configuração (agendas)

`/agendamentos/configurar`

- Cada agenda aparece num cartão com: horários da semana, agendamentos futuros, horários livres,
  duração, máximo por horário, antecedência e serviços. O chip passa de "Problemas" a "Funcionando"
  quando a agenda tem horários.
- Visão em **cartões** ou **tabela**, busca e filtro Todas/Ativas/Inativas.
- **Nova Agenda**, **Configurar**, **Ver Agenda**, link público, **Desativar** e **Excluir**.
- **Organizar:** muda a ordem das agendas, usada em todas as telas.
- **Configurações:** atalhos para Serviços, Tags, Endereços, Acessos, Feriados e Limites.
- Atalhos de cada agenda para os **modelos de e-mail** e o **histórico de alterações**.
- Convite para ativar o WhatsApp (abre a tela de ativação).

### Criar ou configurar uma agenda

`/agendamentos/configurar/agenda/add` (com `?id=` para editar)

Seis passos, gravados juntos ao salvar:

1. **Básicas:** nome, identificador do link (gerado a partir do nome), serviços oferecidos (com
   duração e valor totais) e "Copiar de outra agenda".
2. **Horários:** duração, intervalo, máximo por horário, granularidade, antecedência mínima e máxima,
   prazos de cancelamento, dias úteis, feriados, datas de início e fim, e a tabela semanal (vários
   intervalos por dia, botões para copiar a segunda-feira para os outros dias). A coluna "Horários
   Gerados" mostra os horários que a agenda vai oferecer.
3. **Formulários:** que dados pedir ao cliente (e-mail, telefone, CPF, documento, nascimento, gênero,
   nacionalidade, naturalidade, profissão, endereço, observação) e quais são obrigatórios; formulário
   de cada etapa.
4. **Notificações:** avisos internos, por e-mail, cópias e e-mail ao cliente.
5. **Avançadas:** bloquear agendamento externo, só clientes autorizados, senha, distribuição
   automática, acompanhantes, atendimento em grupo, recorrência, lista de espera e valor padrão.
6. **Acessos:** responsável e quem mais tem acesso.

As opções valem na [tela pública de agendamento](#tela-pública-de-agendamento): dados pedidos, senha,
recorrência e bloqueio externo.

**Limites:** "Horários Extras e Limites", "Regras de lembrete", "Regras de status", "Agendas
Vinculadas" e "Personalização Visual" são só de tela. Na primeira etapa, unidade, endereço,
descrição e proprietário não são gravados.

### Modelos de e-mail da agenda

`/agendamentos/configurar_agenda/emails?id=…`

- Lista os modelos de e-mail daquela agenda (um por status), com a contagem e o saldo de AgendaCoins.
- **Adicionar Créditos** e **excluir** modelo.

**Limites:** "Editar" leva ao editor geral de [Modelos de Email](#modelos-de-email).

### Histórico da agenda

`/agendamentos/historico?id=…`

- Duas abas: alterações de configuração (campo, valor anterior e novo, com amostra de cor) e de
  horários (dia, começo e fim).
- Filtro por usuário e paginação.

**Limites:** as linhas vêm dos dados de exemplo; salvar uma agenda ainda não grava histórico.

### Ativar WhatsApp

`/agendamentos/configurar/whatsapp-ativacao`

- Mostra o código e o QR Code para enviar pelo WhatsApp, com contagem regressiva de 10 minutos.
- **Gerar novo código** reinicia a contagem.

**Limites:** o número de destino é fictício e nada confirma a ativação.

### Links de Agendamento

`/agendamentos/link_agendamento`

- Para cada agenda ativa: o link público, com **Copiar**, **WhatsApp**, **QR Code** (com download do
  PNG) e **Abrir**.
- Agenda sem identificador mostra um aviso e um campo para criar um (espaços viram hífens). É o
  mesmo identificador do passo Básicas.
- **Gerador:** monta um link com várias agendas escolhidas.

### Limites de Agendamentos

`/agendamentos/limites`

- Crie limites por **quantidade de agendamentos** ou **de faltas**, por horário, dia, semana, mês ou
  N dias corridos, para todas ou algumas agendas e serviços.
- Escolha como identificar "a mesma pessoa": CPF, e-mail, nome, telefone, combinações deles,
  usuário cadastrado ou o total geral.
- Filtros por agenda, serviço, intervalo e tipo; editar e excluir.
- **O limite vale de verdade:** o Novo Agendamento é barrado quando o limite já foi atingido.

**Limites:** "IP de Origem" e "Chave Customizada" se comportam como "Usuário Cadastrado".

### Listas de Bloqueio

`/agendamentos/limites/lista_bloqueios`

- Bloqueie um e-mail, telefone ou CPF, com motivo e data para expirar (em branco = para sempre).
- Ativar/desativar, editar, excluir; busca e filtros por tipo e situação.
- **O bloqueio vale de verdade:** o Novo Agendamento é barrado para o cliente bloqueado. Telefones
  são comparados só pelos dígitos.

### Serviços

`/agendamentos/servicos`

- Cadastre serviços com cor, valor, duração, máximo de pessoas, agendas, tags, colaboradores e ordem.
- Busca, filtro por agenda, editar e excluir.

### Tags

`/agendamentos/tags`

- Crie, edite e exclua tags e escolha a que serviços elas se aplicam. As tags servem para marcar e
  filtrar agendamentos.

### Lista de Espera

`/agendamentos/listar/espera`

- Inclua um cliente na lista de espera de uma agenda, com serviço e horário desejado (o cliente é
  criado se o nome for novo).
- Busca, filtros por situação, agenda e período; remover.

### Agendamentos Recorrentes

`/agendamentos/recorrencias`

- Crie uma regra de repetição: agenda, serviço, dia, horário, situação, clientes, tags, dias da
  semana, "a cada N semanas", data final e quantidade máxima.
- Salvar **gera os agendamentos**, que aparecem na lista e no calendário.
- A tabela mostra quantos agendamentos a regra gerou e quantos ainda vão acontecer.
- **Excluir** apaga a regra e os agendamentos futuros dela; os que já passaram ficam.

**Limites:** acompanhantes e membros da equipe são só de tela.

### Feriados

`/agendamentos/feriados`

- Por agenda, escolha bloquear feriados nacionais e estaduais e desmarque feriados específicos.
- **Feriados customizados:** um dia ou um período, dia inteiro ou só algumas horas, para todas ou
  algumas agendas.
- **Os feriados valem de verdade:** fecham os horários no calendário e na tela pública, com o nome do
  feriado como motivo.

**Limites:** feriados estaduais podem ser marcados, mas não fecham nenhum dia (não há a lista por
estado).

---

## Clientes

### Listar Clientes

`/clientes/listar`

- **Adicionar Cliente:** nome, e-mail, telefone, CPF, nascimento, gênero, nacionalidade, profissão,
  estado civil e endereço. Avisa quando já existe cadastro com o mesmo e-mail ou documento.
- **Importar:** arquivo CSV com as colunas `cliente_id`, `nome`, `email`, `telefone`, `cpf`,
  `dt_nascimento`, `genero`, `nacionalidade`, `profissao`; "Baixar modelo" traz o arquivo de
  exemplo. Linhas repetidas (mesmo nome, e-mail ou CPF) são ignoradas, e o resultado diz quantos
  entraram.
- **Consolidar:** encontra cadastros duplicados por e-mail, telefone ou CPF, mostra a revisão e funde
  (fica o primeiro cadastro, completado com os dados dos outros, e os agendamentos passam para ele).
- **Exportar:** baixa um CSV dos clientes ativos.
- **Filtros:** nome, CPF/CNPJ, e-mail, telefone, empresa e documento da empresa.
- Visualizar, editar e **desativar** (o cliente sai das listas, mas o histórico de agendamentos fica).

**Limites:** só CSV (o original também aceita Excel). O CEP desta tela não busca o endereço.

### Detalhes do cliente

`/clientes/detalhes?id=…`

- Todos os dados do cadastro e os 10 agendamentos mais recentes.

### Editar cadastro completo

`/clientes/editar?id=…`

- Além dos dados básicos: tipo e número de identidade, naturalidade, distrito e dados da empresa
  (nome e CNPJ).
- **Buscar CEP** preenche logradouro, bairro, estado e cidade (pela internet, no ViaCEP).

### Acesso de Clientes

`/users/clientes_autorizados` e `/users/clientes_autorizados/listas_acesso`

- **Listas de acesso (gestão em lote):** crie listas que dizem quem pode agendar e com que limites:
  tipo de chave (e-mail, telefone, CPF, passaporte, contrato, código de convite), máximo de
  agendamentos por período, validade, data máxima, agendas e serviços, login obrigatório, texto de
  ajuda e mensagem de acesso negado.
- **Gestão individual:** cada cliente autorizado, com o seu "Cliente ID", quantos agendamentos já
  teve e em que listas está. Copiar o link próprio do cliente ou removê-lo de todas as listas.

**Limites:** as listas ainda não barram ninguém na tela pública. A lista externa (API) não é
consultada. Importar/Exportar clientes autorizados não fazem nada.

### Convites de Cadastro

`/users/convites-cadastro`

- Crie um convite com uma lista de e-mails colada, o texto do e-mail, os campos que a pessoa deve
  preencher (e quais são obrigatórios), aprovação automática, criação de senha e validade do link.
- Busca, filtro por status, editar e excluir (excluir apaga também os cadastros recebidos por ele).

### Cadastros Recebidos

`/users/convites-cadastro/cadastros`

- Veja quem se cadastrou por um convite, com as respostas.
- **Aprovar** ou **rejeitar** um a um ou em lote; a rejeição pode guardar um motivo.

### Textos do convite

`/users/convites-cadastro/textos-de-email`

- Textos reutilizáveis para cada momento (convite, pré-cadastro recebido, cadastro aprovado,
  agendamento liberado), com as variáveis disponíveis e um texto padrão por momento.

**Limites dos convites:** nenhum e-mail é enviado e não há página onde a pessoa se cadastre. Os
cadastros recebidos vêm dos dados de exemplo, e aprovar só muda o status. A planilha anexada ao
convite não é lida.

---

## Relatórios

Todos usam os agendamentos gravados e só recalculam ao clicar **Aplicar filtros**.

- **Clientes:** clientes com agendamentos no período, agrupados por nome ou outra chave, com as
  situações e a quantidade.
- **Consolidado:** quantidade e valor por dia, agrupados por serviço, agenda ou tag, com filtros de
  status, agendas, serviços e tags. **Exportar** pede o aceite do aviso de LGPD e baixa um CSV.
- **Agendamentos:** prévia dos agendamentos do período, por situação e agenda, ordenada por nome ou
  data, com até 19 colunas à escolha.
- **Indicadores Gerenciais:** oito indicadores (total, clientes únicos, cancelamentos, faturamento,
  ocupação, não comparecimento, retorno e ticket médio) comparados com o período anterior, e
  gráficos por dia e por agenda. Períodos prontos ou personalizado.

**Limites:** colunas que o protótipo não guarda saem como "—". Acompanhantes contam zero. O relatório
de Agendamentos não exporta.

---

## Formulários

`/pesquisas/controle`

- Crie formulários (pesquisas) com nome, descrição, tipo, agendas vinculadas, data limite, login
  obrigatório e modelo importado. Editar e excluir.

**Limites:** não há editor de perguntas nem página para responder, então perguntas e respostas não
mudam.

---

## Comunicação

Os cartões de saldo (créditos gerais, SMS, e-mail e WhatsApp) no topo destas telas mostram os saldos
de [Pacotes de Envio](#pacotes-de-envio).

### Regras de Notificação

`/notificacao/regras`

- Regras de aviso por **SMS** (com contador de 160 caracteres), **e-mail** (com modelo) ou
  **WhatsApp** (com modelo e prévia).
- Para quem: cliente, acompanhantes, responsável e equipe; para todas ou algumas agendas.
- Quando: envio imediato ou N dias/horas/minutos antes ou depois do horário, com filtro de status.
- Vincular formulário de pesquisa. Busca, editar e excluir.

### Notificações por Status

`/notificacao/regras_status`

- Regras que disparam quando o agendamento chega a um status (pendente, recusado, confirmado,
  cancelado, atendido, não compareceu, pagamento pendente), por WhatsApp, SMS e/ou e-mail.
- Abas **Regras Gerais** (todas as agendas) e **Regras por Agenda**, com filtro por agenda e canal.

### Modelos de Email

`/notificacao/email_template`

- Modelos com editor de texto rico, variáveis clicáveis (inseridas no texto) e textos de exemplo.
- "Usado em" mostra quantas regras usam cada modelo.

### Modelos de WhatsApp

`/notificacao/whatsapp_template`

- Modelos de mensagem com tipo e texto; "Usado em" mostra quantas regras os usam.

### Acompanhamento

`/notificacao/envios`

- Mostra os envios que as regras programam para cada agendamento: canal, destinatário, quando sai e
  situação (Aguardando, Enviada, Cancelada). Muda na hora quando uma regra muda.
- Filtros por situação, período, agenda, tipo e status do agendamento.

### Pacotes de Envio

`/users/pacotes/notificacoes`

- Saldos de SMS, e-mail e WhatsApp e o histórico de pacotes (comprado, usado e disponível).

**Limites da comunicação:** **nenhuma mensagem é enviada de verdade.** O Acompanhamento é calculado,
não registrado, e nunca mostra "Falhou" ou "Sem Crédito". Não dá para comprar pacotes de envio. Não
há envio de e-mail de teste. A herança para sub-contas das regras por status é gravada, mas não tem
efeito.

---

## Integrações

`/integracoes`

- Cartões de Atendimento Presencial, Google Calendar, Zoom, Microsoft Teams/Skype, Sites, Emails,
  RD Station, Mercado Pago, API e Webhook, com busca.
- **Conectar/Desconectar** marca a integração como conectada.
- Aba **Integrações da Equipe:** membros, cargos, integrações e agendas de cada um.

**Limites:** conectar só registra a escolha; nenhuma integração fala com o serviço de verdade.
Documentação e Suporte não levam a lugar nenhum.

---

## Conta

### Tela de Agendamento

`/users/tela_agendamento`

- Personaliza a página pública em seis passos: modelo de tela, identidade (nome, sigla, telefone,
  mensagem, cores, logotipo e banner), localização com busca de CEP, exibição e grupos (etapas).
- **Etapas da tela pública** (`/users/grupos/novo`): nome, nome para o link, ordem, agendas e texto
  de cada etapa.

**Limites:** imagens são escolhidas, mas não guardadas. Na tela pública, por enquanto só o nome e a
mensagem são usados; cores, etapas e o resto ainda não mudam a página.

### Configurações Gerais

`/users/organization/business`

- Oito passos de configuração da empresa: dados da conta (com CPF, telefone e data de nascimento),
  segmento e termo para o cliente, país, fuso horário, idioma, modelos de página e de agenda,
  primeiro dia da semana, privacidade (captcha), e-mails (SMTP) e dados fiscais.

**Limites:** tudo é guardado, mas quase nada muda outras telas ainda.

### Administrar Agendas

`/painel/controle`

Ações em lote sobre várias agendas de uma vez:
- **Bloquear/Desbloquear Horários** num período;
- **Incluir Horários** (horários manuais, com intervalo e máximo de pessoas);
- **Cancelar Agendamentos** de um período;
- **Ativar/Desativar Agendas**;
- **Alterar Configuração** (antecedência mínima e máxima, prazo de cancelamento e máximo por
  horário);
- **Copiar Configuração** de uma agenda para outras.

Também lista os horários manuais criados e uma tabela com a configuração de todas as agendas.

**Limites:** "Alterar Configuração" grava só os quatro campos acima. Desbloquear remove os bloqueios
inteiros das agendas escolhidas, sem olhar o horário.

### Convidar equipe

`/users/adm_equipe`

- Cadastre membros com perfil (proprietário, administrador, colaborador ou visualização), permissões
  e a que agendas, serviços e tags têm acesso.
- Busca e filtros; excluir (menos o proprietário).
- **Grupos de Usuários** (`/users/listar_grupos`): grupos com membros e permissões.
- **Histórico de atividades** (`/users/logs`): o que cada membro fez nos agendamentos.

**Limites:** permissões e grupos ainda não restringem nada no sistema. O histórico vem dos dados de
exemplo.

### Administrar Unidades

`/users/unidades_atendimento`

- Cadastre unidades (locais de atendimento) com link, contatos, descrição, endereço (com busca de
  CEP) e as agendas que atendem nelas.
- Indicadores de unidades, agendas vinculadas e unidades com contato; busca e filtros.
- As unidades aparecem como primeira escolha na tela pública.

### Administrar Contas

`/users/organizacao/contas`

- Cadastre sub-contas (filiais) com sigla para o link, contatos, endereço e administrador (um membro
  existente ou um novo).
- Indicadores de usuários, agendas e agendamentos dos próximos 30 dias; excluir devolve agendas e
  membros para a conta principal.

**Limites:** não há tela para mover agendas para uma sub-conta, então os números ficam em zero.

### Programa de Indicações

`/users/referrals`

- Link de indicação para copiar, quatro indicadores (indicações, recompensas, 1º pagamento,
  fidelizadas) e o histórico com busca e filtro por status.

**Limites:** o link é fictício; as indicações vêm dos dados de exemplo.

### Planos e AgendaCoins

`/users/planos`, `/users/alterar-plano`, `/users/confirmar-plano`, `/planos/transactions`

- **Planos:** plano atual com medidores de uso, saldo e últimas transações de AgendaCoins, faturas e
  histórico de planos.
- **Alterar plano:** os quatro planos com preço mensal ou anual.
- **Confirmar plano:** frequência de pagamento, pessoa física ou jurídica (CPF/CNPJ), endereço com
  busca de CEP e aceite dos termos.
- **Extrato de AgendaCoins:** saldo, recarga mensal e método de pagamento. **Adicionar Créditos**
  credita as coins (com opção de recarga mensal) e registra a transação.

**Limites:** nada é cobrado. A confirmação do plano para antes do pagamento. Adicionar créditos e
"Adicionar método de pagamento" funcionam sem pagamento nenhum (o cartão é de exemplo). Faturas e
notas fiscais não são geradas.

---

## Ajuda

- **Passo a Passo** (`/onboarding`): assistente de configuração em 7 etapas, com animações: perfil
  da empresa, primeira agenda e serviços, horários da semana (com pausa para almoço), endereço (com
  busca de CEP), avisos ao cliente e Google Calendar. No fim, cria a agenda com os horários e mostra
  o link público.
- **Aplicativo** (`/users/gerar-qrcode-config`): QR Code para o aplicativo.
- **Autorizar Suporte** (`/users/suporte/autorizar`): depois de aceitar o termo, gera um código de
  acesso para a equipe de suporte (com copiar e gerar novo) e mostra o histórico de visitas.
- **Suporte via WhatsApp, Tutoriais e Vídeos no YouTube:** itens do menu sem destino.

**Limites:** o assistente não cria os serviços nem as regras de aviso que pergunta. O QR Code do
aplicativo só leva ao endereço da plataforma. O código de suporte não dá acesso a ninguém.

---

## Minha Conta e notificações

### Minha Conta

`/accounts/profile`

- Editar nome e telefone (muda também na equipe e no menu do topo).
- Gerenciar e-mails: adicionar, tornar principal e remover.
- Vincular Facebook, Google e Microsoft.
- Inscrever-se ou sair das novidades.
- Organizações a que o usuário pertence.

**Limites:** alterar senha só valida o formulário; encerrar conta não apaga nada; vincular contas não
faz login em lugar nenhum; nenhum e-mail de verificação é enviado.

### Caixa de notificações

`/inbox/notifications/list`

- Notificações do sistema com filtros por nível (informação, alerta, sucesso, erro) e por lidas/não
  lidas; marcar como lida e remover.
- **Som ativado/desativado** (só guarda a preferência).

**Limites:** nada no sistema cria notificações ainda; as que aparecem vêm dos dados de exemplo.

---

## Tela pública de agendamento

`/agendar/minhaempresa` (cada agenda tem um link direto, `?agenda=<identificador>`)

É o que o cliente vê ao abrir o link de agendamento:

1. Escolhe a unidade (se houver), a agenda e o serviço.
2. Vê o calendário do mês, com os dias que têm vaga. Dias sem vaga, feriados, dias passados e dias
   além da antecedência máxima ficam indisponíveis.
3. Escolhe um horário (respeitando a antecedência mínima e as vagas).
4. Preenche os dados que a agenda pede (e a senha, se a agenda tiver).
5. Confirma e recebe o comprovante com o código.

O agendamento entra como **Pendente**, aparece na lista e no calendário do painel, e o cliente é
cadastrado.

**Limites:** acompanhantes, pagamento e formulários de pesquisa ficam de fora. As listas de acesso e
as listas de bloqueio ainda não são verificadas aqui. A aparência não segue a Tela de Agendamento.

---

## O que o protótipo ainda não faz

- **Não há servidor nem login.** Os dados ficam só no navegador; não há usuários de verdade, senha
  ou permissões aplicadas.
- **Nada é enviado.** Nenhum e-mail, SMS ou WhatsApp sai do sistema.
- **Nada é cobrado.** Planos, créditos e pacotes não passam por pagamento.
- **Integrações não se conectam** a Google, Zoom, Teams, Mercado Pago, RD Station ou outros.
- **Arquivos não são guardados.** Logotipos, banners e imagens são escolhidos, mas não armazenados.
- **Uma página que falta:** a de cadastro por convite, onde quem recebe o convite preenche os
  próprios dados. O editor de perguntas dos formulários, que também faltava, está feito.
- **Fora de escopo, não pendências:** as páginas de detalhe de cada integração, e as quatro do
  rodapé (FAQ, Termos, Privacidade, Contato). Estas últimas não são telas do painel: ficam no site
  de divulgação, em `www.eagenda.com.br`, com navegação própria e sem a moldura do painel. No
  clone os quatro links apontam para os endereços equivalentes da Seiri.
- **O banco de dados real** já tem uma proposta em [`docs/database/`](database/README.md), mas o app
  ainda não usa.

Para os detalhes técnicos de como cada coleção de dados funciona, veja
[`docs/DATA-LAYER.md`](DATA-LAYER.md). As notas de cada tela, com o que foi comparado com o original,
estão em `docs/research/eagenda-com-br-a1f95f96/`.
