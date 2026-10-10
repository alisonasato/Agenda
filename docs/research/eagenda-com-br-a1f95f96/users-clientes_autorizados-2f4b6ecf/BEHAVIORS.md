# /users/clientes_autorizados — Behaviors

## Data (fase de lógica)
- A página não tem coleção própria: lista os clientes de `data.clients` que alguma lista de
  `data.accessLists` nomeia em `clientIds`. É a visão inversa da tela de Gestão em Lote.
- "Cliente ID" é o `accessKey` do cliente, que também entra no link que o botão de copiar coloca na
  área de transferência.
- "Agendamentos" conta os agendamentos do cliente com status ATTENDED.
- "Limites" mostra quantas listas alcançam o cliente, com o nome quando é uma só.
- Os filtros de Agenda e Serviço comparam com as agendas e os serviços de cada lista; uma lista sem
  agenda ou sem serviço vale para todos, como o original trata "acessar todas".
- "Remover" tira o cliente de todas as listas — ele sai desta tela e continua no cadastro.
- A semente ganhou a lista "Pacientes do convênio" com dois clientes, para que esta tela e a de
  Gestão em Lote tenham o que mostrar.

## Verificação
No build estático, com a semente nova: as duas linhas saem com o Cliente ID em mono, "1 realizados",
o chip "1 Pacientes do convênio" e "Ativo". Buscar "carla" deixa só a Carla Monteiro. Remover a Ana
tira a linha e deixa `clientIds: ["c3"]` na lista. "Gestão em Lote" leva para
`/Agenda/users/clientes_autorizados/listas_acesso`, que mostra a mesma lista.

## Diferenças em relação ao original
- "Exportar" baixa `individual_client_access.xlsx` (aba "Sheet1"), montado no navegador por
  `accessExport.ts`. Medido no original: 13 colunas — Cliente ID, Nome, Email, Telefone, CNPJ,
  Comentários, Total de Agendamentos no Período Atual, Limite de Agendamentos, Período, Data limite de
  Agendamento, Link expira em, Status, Link de Agendamento —, cabeçalho em negrito, borda fina,
  centralizado no alto, sem larguras de coluna; o "Total" sai como texto e o "Limite" como número.
  Leituras do clone, não vistas no original (a conta de referência tinha uma linha, com zero):
  - "Total ... no Período Atual" conta os agendamentos do cliente (sem os cancelados) no período da
    própria lista: hoje, a semana de domingo a sábado, o mês, ou os 15/30/N dias que terminam hoje;
    sem período, todos.
  - "Comentários" sai vazio: o cliente do clone não guarda comentários.
  - Sai todo cliente que está em alguma lista, não só as linhas filtradas na tela; se estiver em
    várias, vale a primeira lista.
  - "Link de Agendamento" é absoluto, porque a planilha é aberta longe da página; "Copiar Link" usa o
    mesmo endereço.
- "Importar" não faz nada: o original sobe uma planilha e lê as linhas no servidor.
- "Novo Cliente" abre a tela de listas com `?action=create`, porque o formulário próprio do cliente
  autorizado não foi clonado.
