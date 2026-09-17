# /agendamentos/listar/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/listar`.
`dashboard.css` plus legacy select2 sheets that no visible element uses, so the clone reuses the global stylesheet.

## Layout
```
DashboardShell (title "Listar Agendamentos", sidebar entry "Agendamentos")
└ main > div.max-w-[1550px].px-4.sm:px-6.lg:px-10.py-8
  ├ form#formFilter        busca · Novo Agendamento · action bar (período · Agenda ·
  │                        Serviço · Filtros · | · Visualizar · | · Exportar)
  └ div.mt-6.md:mt-8
    ├ linha de status      #status-quick-filters (.htag) + Limpar filtros + Colunas
    └ #appointment-table   .htable com 10 linhas vazias e estado vazio sobreposto
```

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven (filtra a lista no site; a lista do clone está vazia) |
| Período | click-driven: popover com 5 presets + dois meses de calendário |
| Agenda / Serviço | click-driven: popover com busca, seleção múltipla, Limpar/Concluir |
| Filtros / Visualizar | click-driven: menus (Tag · Colaborador / Ver Agenda · Lista de Espera) |
| Status | click-driven: `.htag--active` alterna o filtro |
| Colunas | click-driven: interruptores que mostram/escondem colunas opcionais |
