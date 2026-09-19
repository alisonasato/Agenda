# Comunicação › Modelos de WhatsApp — Page Topology

Source: `https://eagenda.com.br/notificacao/whatsapp_template?version=3`
Route: `/notificacao/whatsapp_template`
Page key: `notificacao-whatsapp_template-d74ae14b`

## Shell
`DashboardShell` titled **Modelos de WhatsApp**. The page is not in the sidebar menu: it is
reached from the Comunicação shortcuts, and the live page highlights nothing (`active=""`).
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0` (px-6, unlike Modelos
de Email's px-4 sm:px-6).

## Sections
1. **`#formFilter`** (`min-w-0`, no reveal animation):
   - `hui-search` "Buscar modelo por nome ou conteúdo";
   - **Novo Modelo** button;
   - `hactionbar` with Regras de Notificação, Modelos de Email and Atualizações de Status.
2. **`#whatsapp-template-table`** (`mt-4`):
   - `htable` with 10 slots, row height 3.5rem;
   - columns Nome / Tipo / Conteúdo / Usado em / Ações;
   - its own empty state: a plain chat-bubble icon, "Nenhum modelo de WhatsApp por aqui".
3. **Novo Modelo de WhatsApp** modal (`lg`):
   - Nome do Modelo;
   - Tipo do modelo: required searchInPopover combobox with one option, "Mensagem de Resposta
     Automática - Mais Informações", not clearable;
   - Mensagem do Modelo (`htextarea`, 6 rows).

## Verified measurements (live vs. clone)

| Element | 1440 | 390 |
|---|---|---|
| filter row | 1072×38 | 342×90 |
| search / button / action bar | 288×36 / 132.84×32 / 565.53×38 | 342×36 / 132.84×36 / 201.16×42 |
| table / empty state | 1072×606 / 464×150 | 342×606 / 302×172 |
| document height | 900 | 909 |
| modal panel | 512×479.78 at y 210.11 | 374×491.78 |
| form / combobox / textarea | 464×339.78 / 61.5 / 143.78 | 326×347.78 / 65.5 / 143.78 |
| type popover | 464×88 | — |

Every value is identical on both.
