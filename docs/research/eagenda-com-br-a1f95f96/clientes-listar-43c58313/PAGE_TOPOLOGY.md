# /clientes/listar?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/clientes/listar`.
Only `dashboard.css`, so the clone reuses the global stylesheet.

## Layout
```
DashboardShell (title "Listar Clientes"; sidebar group "Clientes" open with "Listar Clientes" active)
└ main > div.max-w-[1550px].px-4.sm:px-6.lg:px-10.py-8
  ├ form#formFilter   busca · Adicionar Cliente · Importar · action bar (Filtros | Consolidar | Exportar)
  └ div.mt-4 > #clients-table > .htable (10 linhas vazias + estado vazio sobreposto)
```

Columns: Nome · Email · Telefone · Gênero · Ações (`htable-col--end`).

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven |
| Filtros | click-driven: dialog 402×305 com 6 campos, "Limpar" e "Aplicar" |
| Adicionar Cliente / Importar / Consolidar / Exportar | click-driven: abrem modais no site (fora do escopo) |
| Sidebar | the group holding the page opens and gets `.sidebar-group-active` |
