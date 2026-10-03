# Conta › Detalhes de AgendaCoins — Page Topology

Source: `https://eagenda.com.br/planos/transactions/?version=3`
Route: `/planos/transactions` (title "Detalhes de AgendaCoins")
Page key: `planos-transactions-c4495e75`

## Shell
`DashboardShell`, with the sidebar on Conta › Planos (the live menu has no entry of its own).
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Button row:**
   - **Adicionar Créditos** (primary) opens the `add-credits-modal` the Comunicação pages already
     use (`hx-get /users/add_credits_modal/` on the live site).
   - **Adicionar método de pagamento** (secondary) → `/planos/transactions/add_payment_method/`.
2. **Three KPIs** (`hkpi`, 1/2/3 columns): "Saldo atual (AgendaCoins)", "Recarga automática"
   ("Desativada" when off) and "Método de pagamento" ("Nenhum" when none).
3. **Transações:** an `hwidget-head` and a 10-slot `htable` with Data/Hora · Tipo · Valor ·
   Descrição · Status, sharing the "Nada por aqui ainda" empty state.
