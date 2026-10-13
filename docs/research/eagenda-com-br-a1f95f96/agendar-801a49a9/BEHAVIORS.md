# /agendar/<org> — Behaviors

## Data (fase de lógica)
- A tela lê `data.bookingScreen` para o nome e a mensagem da organização, e `data.agendas` para as
  agendas que oferece: só as ativas e sem "Bloquear agendamento externo" (`blockExternalBooking`).
- As unidades vêm de `data.units`; com nenhuma, a etapa de unidade não aparece.
- Os serviços vêm de `data.services` filtrados pela agenda; sem serviços, a agenda vai direto para
  o calendário.
- O calendário usa o mesmo `slotsOf` do painel, então respeita horários, bloqueios e feriados. Um
  dia fica sem ponto quando passou, quando está além da "Antecedência Máxima" da agenda ou quando
  não sobrou vaga; a barra distingue "sem vaga" de "feriado".
- Os horários respeitam a "Antecedência Mínima" e as vagas de cada slot.
- O formulário é montado a partir de "Dados solicitados no agendamento" (`data.agendaOptions`):
  e-mail, telefone, CPF, documento, nascimento, sexo, nacionalidade, naturalidade, profissão,
  endereço e o campo de observações, cada um obrigatório quando a agenda assim o marca.
- A senha da agenda e a recorrência só aparecem quando `password` e `allowRecurring` estão ligados.
- Confirmar cria o cliente em `data.clients` e o agendamento em `data.appointments` com status
  PENDING, que é como o original deixa um agendamento vindo de fora até a agenda aceitar.
- O link de cada agenda (`?agenda=<identificador>`) abre a tela já naquela agenda.
- **Cada etapa tem um endereço, e o Voltar/Avançar do navegador percorre as etapas.** Lido no script da
  página do original em 12/10/2026 (`_commitUrl`, `_restoreFromUrl`, `popstate`): o fluxo fica na query
  string, com `unidade`, `modo` (`servico` ou `data`; "Por Agenda" é o padrão e não se escreve), `agenda`
  (o identificador), `servico`, `data` (AAAA-MM-DD) e `hora` (HH:MM, que é também a etapa do formulário).
  Qualquer um deles pula a tela de boas-vindas. Cada escolha, e cada "Voltar" ou "Alterar" da tela, grava uma
  entrada nova no histórico; reabrir, recarregar ou colar o endereço reconstrói o passo. Uma data ou hora
  que a agenda não oferece (ou que não existe, como 30/02) vale como não escolhida e a tela fica na etapa
  anterior. Outros parâmetros do endereço (a chave `?cliente=` do Acesso Individual) ficam como estão.
  `bookingUrl.ts` lê e escreve esses parâmetros; a tela os deriva do endereço, sem estado duplicado.
- **Uma única agenda, ou um único serviço, vem escolhido**, como no original (`_autoSelectAgenda`): com uma
  agenda só, a tela vai direto ao serviço ou ao calendário.
- **Listas de bloqueio e limites barram o visitante** ao confirmar (`publicBooking.ts`, as mesmas regras do
  Novo Agendamento): um e-mail, telefone ou documento bloqueado recebe "Não foi possível concluir o
  agendamento com os dados informados. Entre em contato com <empresa>." (sem o motivo, que é da equipe), e
  um limite atingido diz qual é ("Você já atingiu o limite de 1 agendamento(s) por dia."). O script da página
  do original só mostra o `errors` que o servidor devolve; o texto das duas recusas não está nele, então a
  redação é do clone. Nada é gravado numa recusa.
- **Quem já é cliente é reaproveitado:** o e-mail ou o telefone digitado que já é de um cliente ativo faz o
  agendamento ser dele (e contar nos limites dele), no lugar de cadastrar outro com os mesmos dados, como
  o modal "Adicionar cliente" do Novo Agendamento. Telefone casa com ou sem o +55 e com qualquer pontuação.
- **Agendas "Somente Agendamento Autorizado" pedem identificação** (`access.ts`), antes do calendário e depois
  do serviço (a lista pode valer só para um serviço). O script da página pública do original não tem nada
  sobre isso (relido em 12/10/2026: nenhuma ocorrência de acesso, autorização ou chave), então é leitura do
  clone do que a lista guarda: o passo "Identifique-se" pede o tipo de chave da primeira lista em vigor
  (rótulo do tipo e texto de ajuda da lista); o link próprio `?cliente=` dispensa o passo, e quem o link
  nomeia mas não está em lista nenhuma vê a mensagem de acesso negado, sem campo. Uma chave que não abre
  mostra a mensagem de acesso negado da lista, ou "Acesso restrito: este agendamento é só para clientes
  autorizados." quando ela está em branco. Quem entra agenda como o cliente da lista (os dados dele
  aparecem preenchidos e travados; só "Observações" se edita) e passa pelo bloqueio e pelos limites
  gerais como todo mundo. Confirmar ainda confere "Agendar até" e o máximo por período da lista.
  "Login obrigatório" e a lista externa não valem.
- O recibo mostra o que foi agendado, não o que o endereço diz depois: o Voltar do navegador depois de
  confirmar não troca a agenda nem o dia do recibo (o original também ignora o `popstate` depois de enviar).
- Diferenças deste endereço: o clone guarda o `modo` mesmo com a agenda escolhida (o original o tira, e o
  restabelece ao "Alterar"); "Todas as unidades" fica fora do endereço, como no original, mas não é
  zerada pelo Voltar; uma agenda sem identificador entra pelo id.

## Verificação
No build estático, em 1280×900: "Agendar" abre o passo 1 com as abas e as duas agendas; escolher a
Agenda Principal mostra os três serviços; "Consulta inicial" abre o calendário de Outubro/2026 com
pontos de 5 a 10, barra vermelha em 1–3 (sem vaga) e amarela em 12 (feriado), e a legenda; o dia 5
lista 07:00–17:30; 09:00 leva ao formulário com o resumo "Segunda-feira, 5 de outubro · 09:00 ·
Consulta inicial · R$ 180,00" e os campos Nome/E-mail/Telefone; confirmar grava o cliente e o
agendamento PENDING e mostra o recibo com agenda, dia, valor e código. Em 375×812 tudo empilha sem
rolagem horizontal. `?agenda=agenda-principal` pula a tela inicial e a escolha da agenda.

## Lacunas conhecidas desta tela
Achadas ao comparar a lista de funções do script do original com a tela do clone:
- **"Por Data"** é só um rótulo: mostra a mesma lista de agendas de "Por Agenda". O original tem um
  calendário que junta os dias livres de todas as agendas (`buildDateFirstCalendar`, `selectDateFirst`).
- **O recibo não tem endereço próprio.** O original manda para `/<org>/<chave secreta>/` com `#recibo`
  (e `#acompanhantes`, `#pagamento`), e recarregar volta ao recibo; aqui, recarregar volta ao formulário.
- **Cancelar e editar o agendamento** pelo recibo (`cancelAppointment`, `openEdit`) e responder à pesquisa.
- **A aparência da Tela de Agendamento** (modelo, cores, logotipo) não vale aqui, só o nome e a mensagem.
- Sem descrição, imagem nem "Ler mais" nas agendas (`openDescModal`), porque o clone não as guarda.

## Diferenças em relação ao original
- No original o formulário de dados, o recibo e os formulários de pesquisa vêm prontos do servidor;
  aqui são montados a partir das opções da agenda.
- Acompanhantes, pagamento pelo Mercado Pago, o modal de editar o agendamento e o de responder uma
  pesquisa ficam de fora: todos dependem de rotas do servidor que o clone não tem.
- As agendas do clone não têm imagem nem descrição, então o card mostra sempre a inicial e não há
  o "Ler mais".
- O rodapé do original lista contato, redes sociais e o link de Login; o clone não tem login, então
  mostra só a barra de copyright e a zona de links.
