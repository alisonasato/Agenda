# /agendamentos/novo_agendamento/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/novo_agendamento`.
Only `dashboard.css` — no extra bundles, so the clone reuses the global stylesheet.

## Layout
```
DashboardShell (title "Novo Agendamento", sidebar entry "Novo Agendamento")
└ main > div.max-w-[1550px].px-4.sm:px-6.lg:px-10.py-8
  └ form#new-appointment-form
    ├ .hformpanel
    │ ├ section "Dados do agendamento"  grid 1/2 cols: Agenda (full) · slot vazio (full) ·
    │ │                                 Ação · Status · Dia · Horário · Tags (full)
    │ ├ section "Participantes"         Clientes + "Adicionar cliente" · Acompanhantes +
    │ │                                 "Adicionar acompanhante" · Responsável · Membros da Equipe
    │ └ section "Notificações"          3 caixas de seleção
    └ .hsavebar                         Voltar · Salvar Agendamento (+ toast de alterações)
```

Widgets: `.hcombobox` (single select with search) and `.hautocomplete` (multi-select with chips),
both rebuilt as `shared/Combobox.tsx` and `shared/MultiSelect.tsx`.

## Interaction model
| Section | Model |
|---|---|
| Comboboxes | click-driven: field opens a popover; typing filters; picking closes |
| Dia / Horário | dependent: Dia unlocks after Agenda, Horário after Dia |
| Multi-selects | click-driven: chips add/remove, search panel with "Concluir" |
| Save bar | the toast only appears once the form is dirty |


## Update — 18/09/2026 (live site changed after the first clone)
- **Participantes** lost the "Responsável pelo Atendimento" and "Membros da Equipe" fields;
  the owner is now the logged-in user, sent as a hidden `owner_user` input. The section is
  171px (was 248.5) and the form 849.5px at 1440 (docH 1023), 1230px at 390 (docH 1427).
- The container is now `px-6 py-8 lg:px-10` (was `px-4 sm:px-6 …`), so at 390 the form is
  342px wide.
- The save bar is the shared `SaveBar`: save/pen icons and a toast shown only when the form
  is dirty and the dock is out of view, as in the original.
Re-measured against the live page after the change: identical at 1440 and 390.
