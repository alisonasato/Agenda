# /agendamentos/feriados/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/feriados`.
Only `dashboard.css`, so the clone reuses the global stylesheet. Page title is "Lista de Feriados"
while the topbar reads "Feriados".

## Layout
Three stacked sections, each `.hwidget-head` + an `.htable` (no filter bar on this page):
```
DashboardShell (sidebar Gestão de Agendas › Feriados)
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ "Configuração de Feriados das Suas Agendas Ativas"
  │   #feriados-config-content > .htable (6 slots) — Agenda · Bloquear em Feriados Nacionais ·
  │   Bloquear Feriados Estaduais · Ações; one row per active agenda, empty state hidden
  ├ .mt-8 "Feriados Customizados" (+ botão "Adicionar Feriado" no head)
  │   #feriados-customizados-content > .htable (6 slots) — Dia · Horário · Descrição ·
  │   Aplicar nas Agendas · Ações
  └ .mt-8 "Feriados do Sistema"
      .htable (10 slots, paginação habilitada mas oculta) — Dia · Descrição
```
Row height 3.25rem in all three.

## Interaction model
| Section | Model |
|---|---|
| Configuração | click-driven: o ícone de lápis abre um modal por agenda (fora do escopo) |
| Adicionar Feriado | abre modal no site (fora do escopo) |
| Tabelas | estáticas; sem busca nem filtros nesta página |
