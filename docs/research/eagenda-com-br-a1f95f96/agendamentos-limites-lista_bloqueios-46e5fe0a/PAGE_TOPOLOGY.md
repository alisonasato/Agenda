# /agendamentos/limites/lista_bloqueios?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/limites/lista_bloqueios`.
Only `dashboard.css`, so the clone reuses the global stylesheet. Sibling of the limits page:
each one links to the other from its action bar.

## Layout
```
DashboardShell (title "Listas de Bloqueio"; sidebar Gestão de Agendas › Listas de Bloqueio)
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter        busca · Incluir bloqueio · action bar (Tipo | Limites de Agendamento)
  ├ .mt-4 row              #suppression-status-filters (Todos/Ativos/Inativos) + Limpar filtros
  └ #suppression-table-container > .htable (10 linhas vazias + estado vazio sobreposto)
```

Columns: Situação · Tipo · Chave · Motivo · Incluído em · Incluido por · Expira em · Ações (end).
Row height 3.25rem, like the limits table.

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven |
| Tipo | click-driven: popover com E-mail · Telefone · CPF |
| Situação | click-driven: `.htag--active` |
| Incluir bloqueio | abre modal no site (fora do escopo) |
| Limites de Agendamento | link para a página irmã |
