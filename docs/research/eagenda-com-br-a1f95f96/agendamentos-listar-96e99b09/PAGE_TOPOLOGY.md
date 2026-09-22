# /agendamentos/listar/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/listar`.
`dashboard.css` plus legacy select2 sheets that no visible element uses, so the clone reuses the global stylesheet.

## Layout
```
DashboardShell (title "Listar Agendamentos", sidebar entry "Agendamentos")
└ main > div.max-w-[1550px].px-4.sm:px-6.lg:px-10.py-8
  ├ form#formFilter        busca · Novo Agendamento (nova aba) ·
  │                        action bar (período · | · Visualizar · | · Exportar)
  └ div.mt-6.md:mt-8
    ├ linha de status      #status-quick-filters (.htag) + Limpar filtros + Colunas
    └ #appointment-table   .htable com 10 linhas vazias e estado vazio sobreposto
```

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven (filtra a lista no site; a lista do clone está vazia) |
| Período | click-driven: popover com 5 presets + dois meses de calendário |
| Visualizar | click-driven: menu (Ver Agenda · Lista de Espera), teleportado 6px abaixo |
| Status | click-driven: `.htag--active` alterna o filtro |
| Colunas | click-driven: interruptores que mostram/escondem colunas opcionais |

## Query-string state: "Confirmar Agendamentos"
The sidebar entry **Confirmar Agendamentos** is not a separate page: it points at this same pathname
with `?interval=all&status=PENDING`. Only the initial state differs — the "Pendentes" tag is active,
the period reads "Todos os períodos", the sidebar marks that entry instead of "Agendamentos", and the
empty state shows the unfiltered copy. The clone reads both params in
`src/app/agendamentos/listar/page.tsx` and passes them to `AppointmentsList`.
