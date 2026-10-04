# /inbox/notifications/list — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.notifications`, cada uma com `level` ("info", "warning", "success" ou
  "error"), título, texto, quando e se foi lida.
- Os dois grupos de filtros combinam: o nível filtra pelo tipo e o status por lida/não lida, e o
  estado vazio troca de texto quando algum filtro está ligado.
- As ações de cada linha marcam como lida (e desmarcam) e removem a notificação.
- "Som ativado" alterna `profile.notificationSound`, que é o que o original guarda no servidor com
  o `hx-post /notificacao/som/toggle`.
- O sino do topo passou a listar as não lidas — antes dizia sempre "Nenhuma notificação não lida" —
  com um ponto no ícone enquanto houver alguma, e "Ver Todos" abre esta página.

## Verificação
No build estático, com as três notificações da semente: "Alerta" deixou só "Saldo de SMS baixo",
"Lidas" só "Agenda publicada", "Não lidas" as outras duas e "Erro" trocou o vazio para "Nenhuma
notificação encontrada". Marcar a primeira como lida gravou `read: true`; remover a última deixou
duas. O botão de som virou "Som desativado" e gravou `notificationSound: false`. No sino ficou a
única não lida, com o ponto no ícone, e "Ver Todos" aponta para `/Agenda/inbox/notifications/list`.

## Diferenças em relação ao original
- A conta verificada não tinha nenhuma notificação, então a marcação de cada linha é construída a
  partir das colunas do cabeçalho, não copiada do original; a semente traz três linhas para que os
  filtros tenham o que mostrar.
- O ícone de som sem som é deste clone: o original só foi visto com o som ligado, e alternar
  mudaria a conta de verdade.
- Não há som nenhum para tocar: o botão só guarda a preferência.
