# /users/suporte/autorizar/?version=3 — Page Topology

Source: requires login; captured 2026-09-22. Route: `/users/suporte/autorizar`
(sidebar entry Ajuda › Autorizar Suporte). Usa a `dashboard.css` do painel.

## Layout
```
DashboardShell (title "Autorizar Suporte", sidebar entry "Autorizar Suporte")
└ main > div.max-w-[1550px].px-6.py-8.lg:px-10
  ├ .halert.halert--warning      aviso de SLA + botão "Contratar Suporte Avançado"
  ├ .hsection "Gerar código de acesso"
  │   ├ estado ocioso            botão "Gerar código agora" (abre o termo)
  │   └ estado com código        código, expiração, Copiar código · Gerar novo, aviso
  ├ grid lg:grid-cols-2
  │   ├ .hsection "Como funciona"                 hstepper vertical de 3 passos
  │   └ .hsection "Sua privacidade está protegida" lista de 5 garantias
  └ "Histórico de acessos ao suporte"             htable de 6 colunas, 5 linhas vazias
modal support-terms-modal        Termo de Autorização (6 cláusulas) + aceite
```

## Interaction model
| Section | Model |
|---|---|
| Gerar código agora / Gerar novo | click-driven: abrem o termo; o aceite é exigido a cada abertura |
| Aceitar e gerar código | no original, POST `/users/suporte/gerar-token/`; o clone gera o código no navegador |
| Copiar código | click-driven: copia e troca o rótulo para "Copiado!" por 2,5s |
| Histórico | estático: a conta não tem acessos registrados |

## Mock data
O código do clone tem 6 caracteres (alfabeto sem letras ambíguas) e expira em 2 horas, como o original.
O aviso de SLA cita "Seiri" e o link leva a `/users/planos`.
