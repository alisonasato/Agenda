# /agendamentos/limites/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/limites`.
Only `dashboard.css`, so the clone reuses the global stylesheet.

## Layout
```
DashboardShell (title "Limites de Agendamentos"; sidebar Gestão de Agendas › Limites de Agendamentos)
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter        Adicionar Limite · Listas de Bloqueio · action bar (Agenda · Serviço · Intervalo)
  ├ .mt-4 row              #limits-type-filters (Todos/Agendamentos/Faltas) + Limpar filtros
  └ #limites-sections-container > .htable (10 linhas vazias + estado vazio sobreposto)
```

Columns: Tipo · Chave · Agenda(s) · Serviço(s) · Intervalo · Qtd. (end) · Ações (end).
Row height is 3.25rem here (the other tables use 3.5rem).

## Interaction model
| Section | Model |
|---|---|
| Tipo (Todos/Agendamentos/Faltas) | click-driven: `.htag--active` |
| Agenda / Serviço / Intervalo | click-driven: popovers com busca e contador |
| Adicionar Limite | abre modal no site (fora do escopo) |
| Listas de Bloqueio | link para outra página (ainda não clonada) |
