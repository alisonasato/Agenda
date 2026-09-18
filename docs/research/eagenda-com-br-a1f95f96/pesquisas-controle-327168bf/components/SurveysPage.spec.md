# SurveysPage

`src/components/sites/eagenda-com-br-a1f95f96/pesquisas-controle-327168bf/SurveysPage.tsx`

## Parts
- **Action row** — "Novo Formulário" toggles `creating`.
- **Table** — `COLUMNS` (6) + Ações, `SLOTS = 10` spacer rows, default empty state with
  `InboxIcon`.
- **`SurveyFormModal`** — `hmodal` markup (wrapper, opaque backdrop, `--lg` panel, header,
  body-wrap, footer). Local state: `stage` (default `agendamento`), `template` (empty),
  `agendas` (empty). Escape and backdrop clicks call `onClose`.

## Shared pieces
- `Combobox` with the new `searchInPopover` flag (Tipo de Formulário, Importar Modelo).
- `ChipMultiSelect` — new, extracted from the Links de Agendamento page's local
  `AgendaSelect`, which now uses it too.
- Icons: `AddAppointmentIcon`, `CheckReadIcon`, `CloseCircleIcon`, `InboxIcon`.

## Data
`SURVEY_STAGES` (4) and `TEMPLATES` (1) copied from the original's options; the agenda
picker gets `[]`, as on the live account.
