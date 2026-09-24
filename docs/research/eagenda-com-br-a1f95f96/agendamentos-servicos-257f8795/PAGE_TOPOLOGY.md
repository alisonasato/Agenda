# /agendamentos/servicos/?version=3 — Page Topology

Source: requires login; captured 2026-09-23. Route: `/agendamentos/servicos`.
Item do grupo **Minha Agenda** que o menu nunca mostra: só aparece na busca da barra lateral.

## Layout
```
DashboardShell (title "Serviços", sidebar entry "Serviços")
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ form#formFilter   busca · Novo Serviço · barra (Agenda · | · Limpar filtros · Agendas)
  ├ hwidget-head      "Serviços"
  └ #services-table-container  htable de 9 colunas, 10 linhas vazias
modal service-form-modal (2xl)  "Novo Serviço"
```

## Table columns
`Serviço · Valor · Duração · Pessoas* · Agendas* · Tags** · Colaboradores** · Ordem* · Ações`
(*) escondidas abaixo de `lg`; (**) escondidas abaixo de `xl`.

## Modal "Novo Serviço"
Nome do serviço* · Valor · Duração* (combobox, 00:30) · Máximo de pessoas no mesmo horário
(com a dica "Em branco: usa o limite da agenda") · Ordem no agendamento (1) · Link de pagamento ·
Cor no calendário (#6366F1) · "Mostrar o valor para os clientes" · **Vínculos**: "Vincular em todas
as agendas", Agendas, Tags, Colaboradores · **Instruções pós-agendamento** (textarea de 2000).
No original o corpo chega por htmx (`/agendamentos/servicos/add`); o clone monta o mesmo formulário.

## Interaction model
| Section | Model |
|---|---|
| Busca | input-driven: filtra a lista no servidor |
| Agenda | click-driven: multiselect com busca no servidor |
| Limpar filtros | click-driven: zera busca e filtros |
| Agendas | link para Configuração de Agendas |
| Novo Serviço | click-driven: abre o modal |
