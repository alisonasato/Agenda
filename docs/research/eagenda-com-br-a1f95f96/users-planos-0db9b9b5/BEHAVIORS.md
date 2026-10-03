# /users/planos — Behaviors

## Data (fase de lógica)
- O cartão "Plano Atual" lê `data.plan`: nome, ciclo, preço, os dois medidores
  (`appointmentsUsed/appointmentsMax`, `usersUsed/usersMax`), a nota e a linha de limites.
- O alerta "Você está no plano gratuito" só aparece enquanto `plan.price` é 0.
- O cartão "AgendaCoins" mostra `data.credits.general` como saldo e as cinco últimas entradas de
  `data.coinTransactions`; sem nenhuma, cai no vazio "Nenhuma transação ainda".
- As abas listam `data.payments` e `data.planHistory`; a contagem da aba "Pagamentos" vem do
  tamanho de `data.payments`.

## Verificação
No build estático, comprando 100.000 AgendaCoins em `/planos/transactions`: o cartão passou a
mostrar "Saldo: 100.000" e a linha "Compra de AgendaCoins com recarga mensal +100.000". Os
medidores desenham 0 de 300 e 1 de 1, e as duas tabelas ficam no estado vazio porque a conta não
tem faturas nem mudanças de plano.

## Diferenças em relação ao original
- Não há cobrança: "Assinar Plano Básico" e "Ver todos os planos" não levam a lugar nenhum, porque
  as telas `/users/confirmar-plano/<id>` e `/users/alterar-plano/` não foram clonadas.
- "Solicitar créditos de teste" aponta para `/planos/transactions`, onde a compra de fato acontece,
  em vez de abrir o modal de pedido do original.
- As colunas Fatura e Nota Fiscal mostram "—": o clone não gera documentos.
