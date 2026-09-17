# /users/clientes_autorizados/listas_acesso/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/users/clientes_autorizados/listas_acesso`.
Only `dashboard.css`, so the clone reuses the global stylesheet.
Page title is "Listas de Controle de Acesso" while the topbar reads "Acesso de Clientes".

## Layout
```
DashboardShell (sidebar Clientes › Acesso de Clientes)
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter   busca · Nova Lista · action bar (Agenda · Serviço | Gestão Individual)
  └ .mt-6.md:mt-8     linha com "Limpar filtros" à direita
      #acl-table-container > .htable (10 linhas vazias + estado vazio sobreposto)
```

Columns: Lista · Configurações · Permissões · Clientes · Limites · Status · Ações (end).
Row height 3.5rem. The form carries a hidden `status=active` input.

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven |
| Agenda / Serviço | click-driven: popovers com busca e contador |
| Nova Lista | abre modal no site (fora do escopo) |
| Gestão Individual | link para /users/clientes_autorizados/ (não clonada) |
