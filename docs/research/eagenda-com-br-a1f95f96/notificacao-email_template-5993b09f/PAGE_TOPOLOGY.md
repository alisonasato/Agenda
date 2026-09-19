# Comunicação › Modelos de Email — Page Topology

Source: `https://eagenda.com.br/notificacao/email_template?version=3`
Route: `/notificacao/email_template`
Page key: `notificacao-email_template-5993b09f`

## Shell
`DashboardShell` titled **Modelos de Email**, sidebar entry Comunicação › Modelos de Email.
Container: `mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0`.

## Sections
1. **`#formFilter`**: `hui-search` ("Buscar modelo por nome ou assunto"), **Novo Modelo**
   (`hbtn--primary hbtn--sm`) and an `hactionbar` scroll rail with three links: Regras de
   Notificação, Modelos de WhatsApp, Atualizações de Status. All three stay inline at every width
   (Regras de Notificação folds them into a menu instead).
2. **`#email-template-table`**: `htable` with 10 slots, row height 3.5rem, and the columns
   Nome / Assunto / Usado em / Ações. Empty on the live account.
3. **Novo Modelo de Email** modal (`hmodal-panel--4xl`):
   - Nome de Identificação and Assunto do Email, side by side from md.
   - Escolher Exemplo de Texto (searchInPopover combobox, 3 options, `md:max-w-md`).
   - `.het-grid`: the CKEditor body next to the variables palette (`17rem`, both `22rem` tall);
     they stack below 1024px.

## Verified measurements (live vs. clone)

| Element | 1440 | 390 |
|---|---|---|
| filter row | 1072×38 at y 96 | 358×90 |
| search / button / action bar | 288×36 / 132.84×32 / 600.27×38 | 358×36 / 132.84×36 / 217.16×42 |
| table | 1072×606 | 358×606 |
| document height | 900 | 909 |
| modal panel | 896×700 | 374×716 |
| form | 848×560 | 326×1044.5 (body scroll 1061) |
| editor / toolbar / editable | 552×352 / 39.42 / 312.58 | 326×352 / 39.42 |
| variables palette | 272×352 | 326×352 |
| toolbar items (11 visible + "more") | same x positions (±0.1) | — |
| example popover | 448×160, 4px under the field | — |

Every value is identical on both.
