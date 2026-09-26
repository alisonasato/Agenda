# /clientes/&lt;id&gt;/editar/?version=3 — Page Topology

Source: requires login; captured 25/09/2026 pelo botão "Editar Cadastro" da tela de detalhes.
Só `dashboard.css`, então o clone reaproveita a folha global.

## Rota
Mesmo caso da tela de detalhes: o original põe o id no caminho, o clone usa
`/clientes/editar/?id=<cliente>`. Título da aba "Editar Dados de Cadastro", título da página
"Editar Cliente".

## Layout
```
DashboardShell (título "Editar Cliente"; grupo "Clientes" aberto, "Listar Clientes" ativo)
└ div.mx-auto.w-full.max-w-[1550px].px-6.py-8.lg:px-10
  └ form#client-edit-form[novalidate]
    ├ div.hformpanel
    │ ├ section.hformsection  "Dados do cliente"
    │ │   grid.grid-cols-1.md:grid-cols-2.gap-4
    │ │   Nome * (md:col-span-2) · E-mail | Phone · CPF | Data de Nascimento
    │ │   Gênero (md:col-span-2, .hradiogroup com 4 .hradio-pill) · Tipo de identidade | Número de identidade
    │ │   Estado civil | Nacionalidade · Naturalidade | Profissão
    │ ├ section.hformsection  "Endereço"
    │ │   País * | Estado · CEP (input + botão .hbtn--icon) | Município
    │ │   Logradouro (md:col-span-2) · Número | Bairro · Complemento | Distrito
    │ └ section.hformsection  "Empresa"
    │     Denominação social/firma | Cadastro Nacional da Pessoa Jurídica (CNPJ)
    └ div.hsavebar  (dock Voltar/Salvar + toast "Alterações não salvas")
```

Gênero: `M` Masculino · `F` Feminino · `O` Outro · `N` Prefiro não informar.
Tipo de identidade: RG · CNH · Passaporte · Carteira de Trabalho · Carteira de Identidade
Profissional (OAB, CRC, CRM, CRA, CREA, etc).

## Interaction model
| Seção | Modelo |
|---|---|
| Campos | formulário controlado; o save bar acende quando algo muda |
| CEP | botão (ou Enter) consulta o CEP e preenche Logradouro, Bairro, Estado e Município |
| Voltar | volta para a tela de detalhes do mesmo cliente |

## Verification
Medido contra o ao vivo: alturas das três seções `601 / 448 / 133`, altura do documento `1465`,
e os doze campos da primeira seção nas mesmas posições (`53/62`, `130/62`, `208/68`, `291/58`,
`365/62`, `443/62`, `520/62`), com as pílulas de gênero em `79 · 74 · 56 · 133`.
