# /agendamentos/detalhes/&lt;id&gt; — Behaviors

## Data (fase de lógica)
- O agendamento vem do `?id=` na URL, lido do navegador (docs/DATA-LAYER.md). Id desconhecido mostra
  "Agendamento não encontrado."
- "Criado em" vem de `createdAt`, semeado três dias antes de cada agendamento; "Última alteração"
  passa a `updatedAt` na primeira mudança de status.

## Click sweep
- **Botões de decisão** seguem o status, como no original: Pendente → Aceitar · Rejeitar;
  Confirmado → Marcar atendido · Não compareceu · Cancelar. Status final (atendido, não compareceu,
  cancelado) **não mostra botão nenhum** — a regra `.appt-head-status:not(:has(button, a))` do
  original esconde a fileira inteira.
- Cada um abre a confirmação do calendário e só então grava, registrando uma linha na aba
  **Alterações** com data/hora, responsável e o novo status.
- **WhatsApp** e **E-mail** abrem `wa.me` e `mailto:` do cliente; **Recibo** abre o recibo;
  **Agendamentos** e **Calendário** voltam para as listas.
- **Ver cadastro** vai para os detalhes do cliente. **Editar** no card Comentário abre o modal de
  comentário.
- As abas **Notificações / Alterações** trocam a tabela sem recarregar.

## Per-state content
- Notificações fica sempre no estado vazio: este clone não envia nada.
- Cobrança e Acompanhantes repetem os textos do original; nenhum dos dois existe no modelo.

## Responsive sweep
- **<768:** uma coluna de cards; cabeçalho em duas linhas.
- **768–1279:** duas colunas.
- **1280+:** três colunas, e a partir de 1024 o cabeçalho vira uma linha só com os botões à direita.

## Diferenças em relação ao original
- **Configurar link** (Atendimento) não tem ação: depende da integração de videoconferência.
- Cobrança e Acompanhantes são só os textos vazios, porque o clone não tem pagamento nem
  acompanhantes no modelo.
- O original manda notificações e registra cada envio; aqui a aba Notificações fica vazia.
