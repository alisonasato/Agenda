# /planos/transactions — Behaviors

## Data (fase de lógica)
- Os três KPIs leem `data.credits`: `general` como saldo, `autoRecharge` (0 = "Desativada") e
  `paymentMethod` (vazio = "Nenhum").
- A tabela lista `data.coinTransactions`, do mais recente para o mais antigo.
- "Adicionar Créditos" abre o `AddCreditsModal` compartilhado, que agora credita de verdade: soma a
  quantidade em `credits.general`, grava uma transação ("Compra", status "Concluída") e, com a
  recarga mensal marcada, guarda a mesma quantidade em `credits.autoRecharge`. O botão "Cancelar
  recarga mensal ativa" zera esse campo, e o saldo do modal passou a ser o saldo real.
- "Adicionar método de pagamento" grava um cartão de exemplo em `credits.paymentMethod`.

## Verificação
No build estático: com 100.000 coins e a recarga mensal marcada, os KPIs passaram a "100.000",
"100.000 coins/mês" e a tabela ganhou "02/10/2026 22:21 · Compra · +100.000 · Compra de AgendaCoins
com recarga mensal · Concluída". O botão de método de pagamento trocou "Nenhum" pelo cartão.

## Diferenças em relação ao original
- Não há pagamento: o original leva a `/planos/transactions/add_payment_method/` e a um checkout; o
  clone credita direto e registra um cartão de exemplo, porque essas telas não foram clonadas.
- `credits` ganhou `autoRecharge` e `paymentMethod`; como é o único objeto aninhado de formato fixo,
  `read()` passou a mesclá-lo com a semente para não deixar campos novos indefinidos em dados
  gravados antes.
