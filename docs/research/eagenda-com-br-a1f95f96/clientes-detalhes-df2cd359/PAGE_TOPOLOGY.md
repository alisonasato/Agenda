# /clientes/&lt;id&gt;/?version=3 — Page Topology

Source: requires login; captured 25/09/2026 pelo botão "Visualizar" da lista de clientes.
Só `dashboard.css`, então o clone reaproveita a folha global.

## Rota
O original põe o id do cliente no caminho (`/clientes/<uuid>/`). Um export estático só publica
páginas conhecidas no build, e os clientes deste clone nascem no navegador, então a rota aqui é
`/clientes/detalhes/?id=<cliente>`. O resto da tela é igual.

## Layout
```
DashboardShell (título "Detalhes do Cliente"; grupo "Clientes" aberto, "Listar Clientes" ativo)
└ div.mx-auto.w-full.max-w-[1550px].px-6.py-8.lg:px-10
  ├ div.flex.flex-wrap.items-center.justify-start.gap-3   Voltar (secondary) · Editar Cadastro (primary)
  ├ div.mt-6 > .hsection.hui-card.hui-card--flush
  │   ├ .hsection-head > .hsection-titles > h2.hsection-title "Cliente"; .hsection-actions (vazio)
  │   └ .hsection-body > .grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-x-8.gap-y-5
  │       12 pares: p.text-xs.text-gray-500 (rótulo) + p.text-sm.text-gray-900.break-words (valor)
  └ div.mt-6
    ├ h2.hwidget-title "Agendamentos Recentes"
    └ div.mt-4 > .htable (10 linhas fixas, `--htable-row-h: 3.25rem`, `--htable-head-h: 38px`)
```

Rótulos do card, nesta ordem: Nome · E-mail · Fone · Data de Nascimento · CPF · Endereço ·
Local de Nascimento · Gênero · Documento de Identidade · Nacionalidade · Nome da Empresa ·
CNPJ da Empresa. Campo sem valor mostra "—".

Colunas da tabela: Identificador · Agenda · Serviço · Data/Hora · Duração · Status.

## Interaction model
| Seção | Modelo |
|---|---|
| Voltar | link para `/clientes/listar` |
| Editar Cadastro | no original, link para `/clientes/<id>/editar/` (outra página); aqui abre o modal do cadastro |
| Card e tabela | estáticos |

## Verification
Medido contra o ao vivo com a mesma largura (1003px): barra `24,96,945,36`, card
`24,156,945,392`, tabela `24,612,945,566`, os quatro primeiros pares em `44,212` / `513,212` /
`44,268` / `513,268` e altura do documento 1255 — todos iguais.
