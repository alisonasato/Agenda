# NotificationRules

`src/components/sites/eagenda-com-br-a1f95f96/notificacao-regras-9c9175db/NotificationRules.tsx`

## Parts
- **Credit cards** — `CREDITS`, `hkpi--link hkpi--cta` with the play-arrow pill.
- **Filter form** — search (`query`), Nova Regra (`creating`), `ScrollRail` with the inline
  Comunicação links (`2xl` and up), `CommunicationMenu` (below `2xl`), Pacotes de Envio.
- **Table** — 5 columns + Ações, `SLOTS = 10`, default empty state.
- **`RuleFormModal`** — the rule form; see state below.

## Modal state
`allAgendas`, `agendas`, `recipients` (client on), `channel`, `smsText`, `emailTemplate`,
`whatsappTemplate`, `customTemplates`, `survey`, `immediate`, `when` (`before`), `offset`
(dias/horas/minutos), `beforeFilter`, `afterFilter`.

Local helpers: `Checkbox`, `RadioPills` (grid of `hradio-pill`), `NumberField` (clamped
stepper), `shown(visible)` (the x-show equivalent).

## Shared pieces
`Combobox` (`searchInPopover`, now also `clearable`), `ChipMultiSelect`, `ScrollRail`,
`useDismiss`, `ROUTES`, and the portal they rely on, `FloatingPanel` (now with the
upward flip). New icons: `RefreshIcon`, `LetterIcon`, `PlaneIcon`, `CaretUpIcon`.

## Routes added
`notificacoesRegras`, `notificacoesStatus`, `modelosEmail`, `modelosWhatsapp`,
`acompanhamento`, `pacotesEnvio`, `extrato` — only the first is cloned so far, so the
sidebar links just that one.
