# /agendamentos/tags/?version=3 — Page Topology

Source: requires login; captured 2026-09-23. Route: `/agendamentos/tags`.
Item do grupo **Minha Agenda** que só aparece na busca da barra lateral.

## Layout
```
DashboardShell (title "Tags", sidebar entry "Tags")
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter   busca · Agendas (secundário) · Nova Tag (primário)
  ├ h2                "Tags"
  └ #tags-table-container  htable de 4 colunas (Nome · Aplicar em Agendas · Aplicar em Serviços · Ações)
modal tag-form-modal (lg)  "Nova Tag"
```

## Modal "Nova Tag"
Nome da Tag* · Agendas Relacionadas (autocomplete + "Deixe em branco caso a tag se aplique a todas as
agendas") · Serviços Relacionados (com a nota equivalente). Corpo carregado por htmx no original.

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven |
| Nova Tag | click-driven: abre o modal |
| Agendas | link para Configuração de Agendas |
