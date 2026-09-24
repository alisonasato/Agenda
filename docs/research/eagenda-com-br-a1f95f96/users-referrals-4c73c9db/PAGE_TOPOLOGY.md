# /users/referrals/?version=3 — Page Topology

Source: requires login; captured 2026-09-23. Route: `/users/referrals`.
Item do grupo **Conta**, escondido no menu simplificado (`hide: "simple"`), como Administrar Agendas.

## Layout
```
DashboardShell (title "Programa de Indicações", sidebar entry "Programa de Indicações")
└ main > div.max-w-[1550px].px-4.py-8.sm:px-6.lg:px-10
  ├ hsection "Seu link de indicação"   hcopyfield com o link + botão Copiar
  ├ hkpi-group                         4 KPIs (indicações, créditos, 1º pagamento, fidelidade)
  └ "Histórico de indicações"
    ├ form#formFilter   busca + tags de status (Todos · Pendente · 1º Pagamento · Fidelizado · Cancelado)
    └ #referral-table   htable de 6 colunas, 10 linhas vazias
```

## Table columns
`Organização · Status · Recompensa 1º Pgto · Bônus Fidelidade · Pagamentos · Data`
(sem coluna de ações; as três últimas são numéricas).

## Mock data
O link do original carrega o código da conta; o clone usa
`https://seiri.com.br/users/create_user/?ref=A1B2C3D4E5F6`. Os quatro KPIs ficam zerados, como na conta real.

## Interaction model
| Section | Model |
|---|---|
| Copiar | click-driven: copia o link e troca o rótulo para "Copiado!" |
| Busca | input-driven |
| Status | click-driven: `.htag--active` alterna o filtro |
