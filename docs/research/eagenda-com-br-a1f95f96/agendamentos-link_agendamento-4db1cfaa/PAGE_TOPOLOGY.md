# /agendamentos/link_agendamento/?version=3 — Page Topology

Source: requires login; captured 2026-09-17. Route: `/agendamentos/link_agendamento`.
Only `dashboard.css`, so the clone reuses the global stylesheet.

## Layout
```
DashboardShell (title "Links de Agendamento"; sidebar Gestão de Agendas › Links de Agendamento)
└ main > div#link-agendamento-page.max-w-[1550px].px-6.py-8.lg:px-10
  ├ .halert--warning        (hidden until the generator reports a problem)
  ├ grid 1/2 cols, gap-5
  │ ├ card "Link Principal"        texto + .hlinkfield (copiar · WhatsApp · QR · abrir)
  │ └ card "Gerador Personalizado" .hms (multi-select) + input + Gerar + Copiar/WhatsApp
  └ .mt-8 "Links por agenda"
    ├ card "Todas as Agendas" com .hlinkfield
    └ #agendasAccordion → um <details> por agenda, com o formulário de identificador (.hslug-field)
```

## Interaction model
| Section | Model |
|---|---|
| Link fields | click-driven: copiar, WhatsApp, QR (modal no site), abrir |
| Gerador | click-driven: seleciona agendas → "Gerar" preenche o link e libera Copiar/WhatsApp |
| Accordion | click-driven: `<details>` nativo, seta gira com `group-open:rotate-180` |
| Identificador | form: prefixo fixo + campo com `pattern` de slug + "Salvar" |
