# StatusRuleForm

`src/components/sites/eagenda-com-br-a1f95f96/notificacao-regras_status-nova-4ba76ba5/StatusRuleForm.tsx`

## State
`status`, `agendas`, `flags` (all agendas, subaccount inheritance ×2, recipients ×2,
channels ×3), `whatsappTemplate`, `smsText` (prefilled), `emailTemplate`, `addingCredits`.
`dirty` compares everything with the initial values.

## Parts
- Local `Checkbox` (`hcheckbox`, not `--sm`) and `Section` (`hformsection`).
- Shared: `Combobox` (with `clearable={false}` for Status — the flag is now general, on by
  default for the in-field flavour), `ChipMultiSelect`, `AddCreditsModal`, `SaveBar`.
- Icons: `WalletIcon`, `SaveIcon`, `PenIcon` (new).
