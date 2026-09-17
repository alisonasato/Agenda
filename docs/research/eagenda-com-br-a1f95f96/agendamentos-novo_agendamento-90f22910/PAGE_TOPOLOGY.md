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
