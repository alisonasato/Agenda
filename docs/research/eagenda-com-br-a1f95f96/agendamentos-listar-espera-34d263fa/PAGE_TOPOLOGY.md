# /agendamentos/listar/espera?version=3 — Page Topology

Source: requires login; captured 2026-09-23. Route: `/agendamentos/listar/espera`.
Item do grupo **Minha Agenda** que só aparece na busca; também é o segundo item do menu
**Visualizar** da lista de Agendamentos.

## Layout
```
DashboardShell (title "Lista de Espera", sidebar entry "Lista de Espera")
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter   busca · Incluir na Lista de Espera ·
  │                   barra (período · Agenda · | · Visualizar)
  ├ linha de situação  htag Todos · Em espera · Agendado · Cancelado + Limpar filtros
  └ #waiting-table-container  htable de 8 colunas, 10 linhas vazias
modal waiting-form-modal (2xl)  "Incluir na Lista de Espera"
```

## Table columns
`Cliente · Agenda / Serviço · Data / Hora · Situação · Posição · Ocupação · Inscrito em · Ações`.

## Modal "Incluir na Lista de Espera"
Abre só com **Agenda*** (combobox). No original, escolher a agenda recarrega o corpo por htmx e traz
**Atendimento** (nome da agenda, Dia/Hora*, Observações) e **Cliente** (Nome Completo*, E-mail,
Telefone, Gênero, Estado civil). O clone revela as mesmas seções ao escolher a agenda.

## Interaction model
| Section | Model |
|---|---|
| Período | click-driven: popover de presets + dois calendários (padrão "Todos os períodos") |
| Agenda | click-driven: multiselect |
| Visualizar | click-driven: menu com Lista de Agendamentos e Ver Agenda |
| Situação | click-driven: `.htag--active` alterna o filtro |
| Limpar filtros | click-driven: zera busca, período, agenda e situação |
