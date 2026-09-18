# StatusRules

`src/components/sites/eagenda-com-br-a1f95f96/notificacao-regras_status-226ec629/StatusRules.tsx`

Renders the whole `#status-rules-page-root` (the route adds the outer `div.min-w-0`).

## State
`tab` (`general-rules` | `specific-rules`), `agenda`, `channel`, `addingCredits`.

## Parts
- `CreditCards balanceLabel="AgendaCoins"` (shared).
- Tabs with the sliding indicator; **Nova Regra** link (`ROUTES.novaRegraStatus`);
  **Adicionar Créditos** → shared `AddCreditsModal`.
- `RulesTable` — local; `SLOTS = 6`, default empty state.
- Two panels, both mounted, toggled with `display:none`.

## Shared pieces introduced here
- `CreditCards` — also used by Regras de Notificação.
- `AddCreditsModal` — also used by the Nova Regra por Status page.
- `Modal` / `ModalSubmit` — the hModal shell; Regras de Notificação and Formulários now use it too.
- Icons: `WalletIcon`, `CardIcon`, `InfoIcon`.
