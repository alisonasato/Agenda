# /users/pacotes/notificacoes — Behaviors

## Data (fase de lógica)
- Os três saldos saem de `data.credits` e o histórico de `data.creditPurchases`; Disponível é a
  quantidade comprada menos a utilizada.
- Os mesmos saldos alimentam os quatro cartões de crédito do topo das telas de Comunicação, que
  antes mostravam zero fixo.

## Verificação
No build estático: com saldos 40/60/20 e uma compra de 100 SMS com 60 usados, os três cartões
mostram os saldos e a linha sai "cp1 · 12/09/2026 · SMS · 100 · 60 · 40 · Ativo".

## Diferenças em relação ao original
- Não há como comprar: o clone não tem faturamento, então os créditos só existem nos dados.
  "Solicitar Créditos de Notificação" e "Ver Transações" continuam apontando para rotas que o clone
  ainda não tem.
- O "Extrato de Uso" de cada linha mostra "-", como o original faz quando não há extrato.
