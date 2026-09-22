# /users/gerar-qrcode-config/?version=3 — Page Topology

Source: requires login; captured 2026-09-22. Route: `/users/gerar-qrcode-config`
(sidebar entry Ajuda › Aplicativo). Usa a mesma `dashboard.css` das demais telas do painel.

## Layout
```
DashboardShell (title "Aplicativo", sidebar entry "Aplicativo")
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  └ div.grid.lg:grid-cols-5.gap-4.md:gap-6
    ├ card lg:col-span-3   "Como começar em 3 passos" (ol com 3 itens numerados)
    └ card lg:col-span-2   "Escaneie para configurar" (QR Code + nota)
```

## Content
| Passo | Texto | Extra |
|---|---|---|
| 1 | Baixe o aplicativo — "Disponível para Android." | selo da Google Play (link `#`, abre em nova aba) |
| 2 | Configure a sua plataforma — escaneie o QR Code | — |
| 3 | Faça o login — mesmas credenciais da plataforma | — |

O QR Code do original é um PNG embutido em base64 que aponta para a plataforma. O clone serve um QR
próprio (`public/sites/eagenda-com-br-a1f95f96/users-gerar-qrcode-config-ab0876a9/qrcode-config.png`,
gerado para `https://seiri.com.br/app-config`), e a nota final cita `seiri.com.br`.

## Interaction model
| Section | Model |
|---|---|
| Página inteira | estática: nenhum campo, popover ou requisição |
| Selo da Google Play | link (no original também aponta para `#`) |
