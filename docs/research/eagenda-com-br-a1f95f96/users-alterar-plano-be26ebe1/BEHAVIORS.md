# /users/alterar-plano — Behaviors

## Data (fase de lógica)
- Os quatro planos saem de `PLAN_OFFERS`, uma constante: é catálogo do produto, não dado do
  usuário, então não mora no `store`.
- O botão Mensal/Anual troca o preço exibido e revela a linha "BRL <total> cobrados por ano",
  exatamente como o `x-text`/`x-show` do original.
- O ciclo escolhido viaja no link do "Selecionar Plano", para a tela de confirmação já abrir na
  frequência certa.

## Verificação
No build estático: a tela abre no ciclo Mensal com os quatro cards. Clicar em "Anual" trocou o
Plano Básico de `BRL 45 /mês` para `BRL 40,67 /mês` e acendeu "BRL 488 cobrados por ano", e o CTA
virou `/Agenda/users/confirmar-plano/?id=3&frequencia=anual`.

## Diferenças em relação ao original
- Os preços são os capturados do site em 2026-10-04; nada consulta um servidor.
- A aba `ppu` do original (pagamento por uso) está vazia nessa conta e não foi clonada.
