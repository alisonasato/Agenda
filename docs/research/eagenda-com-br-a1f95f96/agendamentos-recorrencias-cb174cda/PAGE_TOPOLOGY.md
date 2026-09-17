# /agendamentos/recorrencias?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/recorrencias`.
Only `dashboard.css`, so the clone reuses the global stylesheet. Topbar title is "Recorrências".

## Layout
```
DashboardShell (sidebar Gestão de Agendas › Agendamentos Recorrentes)
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter   busca · Novo Agendamento Recorrente · action bar (Agenda · Serviço · Tag)
  ├ .mt-6.md:mt-8     h2 "Recorrências" + Limpar filtros
  └ #recorrencias-table-container > .htable (10 linhas vazias + estado vazio sobreposto)
```

Columns: Criado Em · Identificador · Agenda · Serviço · Total (end) · Futuros (end) · Ações (end).
Row height 3.25rem.

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven |
| Agenda / Serviço / Tag | click-driven: popovers com busca e contador |
| Novo Agendamento Recorrente | abre modal no site (fora do escopo) |
