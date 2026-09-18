# Comunicação › Regras de Notificação — Page Topology

Source: `https://eagenda.com.br/notificacao/regras?version=3`
Route: `/notificacao/regras`
Page key: `notificacao-regras-9c9175db`

## Shell
`DashboardShell`, sidebar group **Comunicação**, item **Regras de Notificação** active.
This page's container uses `px-4 py-8 sm:px-6 lg:px-10` (the others use `px-6`), which is
why the content is 358px wide at 390.

## Sections

1. **Credit cards** (`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4`, 1062×153.5; cards
   253.5×153.5, 173×174.5 at 390) — Créditos Gerais (**Extrato** → `/planos/transactions`),
   SMS / Email / WhatsApp (**Comprar** → `/users/pacotes/notificacoes`). All zero.
2. **`#formFilter`** (`mt-6 md:mt-8`, 1062×38; 358×90 at 390)
   - `#rules-search` (288×36) — "Buscar regra pelo nome".
   - Right side: **Nova Regra** (`hbtn--primary hbtn--sm`, 122.36×32) + `ScrollRail`
     (323.19×38):
     - `hidden 2xl:flex` — Notificações por Status, Modelos de Email, Modelos de WhatsApp,
       Acompanhamento, each followed by a separator;
     - `flex 2xl:hidden` — the same four folded into a **Comunicação** menu
       (`hMenu({ align: 'end', width: '15rem' })`, 240×162) + separator;
     - **Pacotes de Envio**.
     Below 1536px the menu shows; at 390 the rail scrolls (317/222) and shows its next arrow.
3. **`#rules-table`** (`mt-4`, 1062×606) — `--htable-row-h: 3.5rem`; Regra, Agendas, Canal,
   Template, Envio, Ações; 10 spacer rows; default empty state (inbox icon).

## "Nova Regra" modal (`hmodal-panel--lg`, 512×772)
Header 56 · body 648 (**scrolls**: 914px of content) · footer 68 (Cancelar / Salvar).
`#notification-rule-form`, `space-y-6`, five blocks (heights at rest: 61.5 / 152 / 163 / 85 / 340):

1. **Nome da Regra*** — "Ex.: Lembrete 24h antes".
2. **Agendas** — "Aplicar a todas as agendas" checkbox; chip multi-select "Selecione as
   Agendas" (empty on the live account), hidden while the checkbox is on.
3. **Destinatários** — four checkboxes (`hcheckbox-stack`); the first is on by default.
4. **Forma de Envio*** — SMS / Email / WhatsApp radio pills (none picked), then per channel:
   SMS text (160 max, prefilled, live counter "74/160"); Modelo do email (empty) + link;
   WhatsApp template (2 options) + template preview + "Mensagens customizadas"; and
   "Vincular Formulário de Pesquisa" for Email or SMS.
5. **Regra de Envio** — "Envio imediato"; otherwise Antes/Após radio pills, Dias (0–180) /
   Horas (0–23) / Minutos (0–59) steppers and a "Filtro de Status" combobox whose options
   depend on Antes/Após.

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page container | 1142×909.5 | 1142×909.5 | 390×1140 | 390×1140 |
| credit grid / card | 1062×153.5 / 253.5×153.5 | same | 358×340 / 173×174.5 | same |
| `#formFilter` | 1062×38 | 1062×38 | 358×90 | 358×90 |
| search / Nova Regra | 288×36 / 122.36×32 | same | 358×36 / 122.36×36 | same |
| `.hactionbar` / track | 323.19×38 / 317.19×32 | same | 227.64×42 / 221.64×36 | same |
| rail scroll / arrows | 317/317, none/none | same | 317/222, none/flex | same |
| table / empty | 1062×606 / 388.78×130 | same | 358×606 / 318×150 | same |
| document height | 1019 | 1019 | 1273 | 1273 |
| Comunicação menu | 240×162 | 240×162 | — | — |
| modal panel / header / body / footer | 512×772 / 56 / 648 / 68 | same | — | — |

Modal block heights and body scroll height by state (live = clone):

| State | Blocks | scrollHeight |
|---|---|---|
| initial | 61.5 / 152 / 163 / 85 / 340 | 914 |
| SMS | … / 353.5 / 340 | 1182 |
| Email | … / 284 / 340 | 1113 |
| WhatsApp | … / 240 / 340 | 1069 |
| WhatsApp + template | … / 506 / 340 | 1335 |
| + Envio imediato | … / 506 / 98 | 1109 |
| + Aplicar a todas as agendas | 61.5 / 90.5 / … | — |
