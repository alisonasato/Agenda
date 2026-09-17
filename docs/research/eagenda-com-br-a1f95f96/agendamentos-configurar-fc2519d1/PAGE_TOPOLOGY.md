# /agendamentos/configurar/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/configurar`.
Only `dashboard.css`, so the clone reuses the global stylesheet. Topbar title is "Agendas"
(not the page title "Configuração de Agendas"); sidebar shows Gestão de Agendas › Configuração.

## Layout
```
DashboardShell
└ main > div.max-w-[1550px].px-4.sm:px-6.lg:px-10.py-8
  ├ form#formFilter (94px tall, two rows)
  │ ├ busca · Nova Agenda · action bar (Unidade · Serviço · Usuário · Filtros | Organizar | Configurações)
  │ └ #agenda-status-filter (Todas/Ativas/Inativas) + Cards|Tabela + Limpar filtros
  └ #agendas-container
    ├ cards view: #card_lists grid 1/2 cols, gap-9, pl-7 lg:pl-0 → .hnote cards
    └ table view: .htable with 13 columns
```

## The .hnote card
```
.hnote (--hnote-color) > .hnote-tabs (7 weekday tabs on the spine) + .hnote-hooks + .hnote-page
  .hnote-head    mark + título + quick actions (link público · email · logs) + chips
  .hnote-body    .hnote-vitals (3) · horários · .hnote-rules (4 pares) · .hnote-facts (2 linhas)
  .hnote-foot    Configurar · Ver Agenda · atualizar/desativar/excluir
```

## Interaction model
| Section | Model |
|---|---|
| Busca / status | input e click-driven: filtram os cards |
| Cards ↔ Tabela | click-driven: troca a visualização (indicador desliza) |
| Unidade / Serviço / Usuário / Filtros / Configurações | click-driven: popovers com busca |
| Card | links e botões (modais no site, inertes no clone) |
