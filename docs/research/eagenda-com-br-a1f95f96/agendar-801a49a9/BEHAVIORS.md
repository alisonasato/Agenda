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
- **Listas de bloqueio, limites de agendamentos e listas de acesso** não são verificados aqui, só na tela
  Novo Agendamento do painel.
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
