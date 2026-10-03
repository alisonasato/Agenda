# Conta › Planos — Page Topology

Source: `https://eagenda.com.br/users/planos/?version=3`
Route: `/users/planos` (title "Administrar Planos")
Page key: `users-planos-0db9b9b5`

## Shell
`DashboardShell`, with the sidebar on Conta › Planos (a hidden item on the live menu too).
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Free-plan alert:** `halert halert--accent`, "Você está no plano gratuito", with a small
   "Assinar Plano Básico" button. Shown only while the account is on the free plan.
2. **Button row:**
   - **Assinar Plano Básico · BRL 45/mês** (primary) → `/users/confirmar-plano/3`
   - **Ver todos os planos** (secondary) → `/users/alterar-plano/`
   - **Detalhes de AgendaCoins** (secondary) → `/planos/transactions/`
3. **Two cards** in `grid lg:grid-cols-2`:
   - **Plano Atual:** crown icon, plan name, an `hchip--default hchip--soft hchip--sm` with the
     cycle, the price as "BRL 0,00 /mês", two `hmeter`s ("Agendamentos neste ciclo" as
     `hmeter--accent`, "Usuários" as `hmeter--danger`), the e-mail note and the limits line.
   - **AgendaCoins:** the balance in `hsection-desc`, the latest movements or the empty state
     "Nenhuma transação ainda" with a "Solicitar créditos de teste" button.
4. **Archive tabs:** `htabs` with "Pagamentos" (carrying an `htabs-count`) and "Histórico". Each
   tab holds a 10-slot `htable`:
   - Pagamentos: Status · Vencimento · Código de Barras · Fatura · Nota Fiscal
   - Histórico: Plano · Status · Data de Início · Valor · Período
   - Both share the empty state "Nada por aqui ainda".
