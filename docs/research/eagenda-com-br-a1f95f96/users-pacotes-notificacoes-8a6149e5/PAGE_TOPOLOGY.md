# Comunicação › Pacotes de Envio — Page Topology

Source: `https://eagenda.com.br/users/pacotes/notificacoes/?version=3`
Route: `/users/pacotes/notificacoes` (title "Pacotes de Notificações")
Page key: `users-pacotes-notificacoes-8a6149e5`

## Shell
`DashboardShell`, with the sidebar on Comunicação › Pacotes de Envio.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections (all static, no interactions besides links)
1. **Buttons:**
   - **Solicitar Créditos de Notificação** (primary) → `/users/planos`, which is not cloned yet.
   - **Ver Transações** (secondary, receipt icon) → `/planos/transactions`.
2. **Balance cards:** Saldo SMS / Saldo Email / Saldo Whatsapp.
   - They are plain `hkpi` cards (not links), 1/2/3 columns.
   - All are 0 on the live account.
3. **Pacotes já Adquiridos (histórico):**
   - an `hwidget-head` with a small "Solicitar Créditos" button;
   - an empty `htable` with 10 slots and 8 columns ("Quantidade da Compra" and "Quantidade
     Utilizada" are `--num`).

## Verified measurements (live vs. clone)

| Element | 1440 | 390 |
|---|---|---|
| container | 1142×951.5 | 390×1378.5 |
| buttons | 259.48 / 152.5 × 36 | 263.48 / 156.5 × 40 (wrapped) |
| cards | 3 × 338×153.5 | 3 × 342×153.5 stacked |
| widget head / table | 1062×32 / 1062×606 | 342×72 / 342×606 |
| document height | 1061 | 1512 |

Every value is identical on both.
