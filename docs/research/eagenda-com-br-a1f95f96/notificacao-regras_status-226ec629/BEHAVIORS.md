# Comunicação › Notificações por Status — Behaviors

## Tabs
Client-side (Alpine `activeTab`): both panels are in the page, the inactive one is
`display:none`, and the indicator slides by `translateX(calc(index * 100%))`.

## Filters on "Regras por Agenda"
Agenda (only "Todas as agendas") and Canal (Todos os canais / Email / SMS / WhatsApp). Their
"all" options carry an empty value, which the combobox treats as "nothing picked": the field
shows its placeholder ("Filtrar por agenda") rather than the option label. `Combobox` now
does the same for every empty value. Both are clearable.

## Adicionar Créditos
The original loads the body over htmx (`/users/add_credits_modal/`); the clone renders it.
- The stepper uses the input's native `stepUp()` / `stepDown()`, so `min=50000` and
  `step=1000` apply exactly as in the original.
- Presets set the amount to 50.000 / 100.000 / 250.000 / 500.000.
- With "recarga mensal" on and an amount, a hint shows the monthly price at BRL 0,0011 per
  coin ("50.000 coins/mês = BRL 55,00"). The "você já tem" warning and "Cancelar recarga
  mensal ativa" only apply to accounts with a recharge; they stay mounted and hidden.
- **Continuar para Pagamento** is disabled until the terms checkbox is ticked (the amount
  is validated by the input's own `required`/`min`). Nothing is charged in the prototype.

## Naming
"AgendaCoins" is the original product's credit currency and is kept as-is; it is content,
not the old brand name, but it will need a decision when the product gets its own currency.

## Not cloned
The rule delete dialog and the "cancel recurring recharge" confirmation — neither is
reachable on an account without rules or recharges.

## Data (fase de lógica)
- As regras vivem em `data.statusRules`. **Regras Gerais** mostra as que valem para todas as
  agendas; **Regras por Agenda** mostra as demais, filtradas pela agenda e pelo canal.
- Uma regra pode marcar mais de um canal, e a tabela abre uma linha por canal — é o que as colunas
  Canal, Template e Conteúdo pedem. Conteúdo traz o texto do SMS; Template, o modelo de WhatsApp ou
  de email.
- O lápis abre o formulário com `?id=` e a lixeira pede confirmação antes de apagar.
- O filtro de agenda passa a oferecer as agendas da conta.

## Verificação
No build estático: salvar uma regra de "Confirmado", em todas as agendas, por SMS, leva de volta
para esta tela com a linha em Regras Gerais — Confirmado, chip SMS, Template “—” e o texto do SMS
em Conteúdo. O lápis abre `?id=sr2` com status, agendas e canal preenchidos; excluir tira a linha.

## Diferenças em relação ao original
- O original edita por `/notificacao/regras_status/<id>/editar`; como o clone é estático, a mesma
  página de criar carrega a regra por `?id=`.
- Os cartões de crédito e Adicionar Créditos continuam sem faturamento por trás.
