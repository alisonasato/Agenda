# Webhooks — Page Topology

Source: `https://eagenda.com.br/webhook/webhook-config/?version=3`
Route: `/webhook/webhook-config` (title "Webhooks")
Page key: `webhook-webhook-config-414c38f8`

## Shell
`DashboardShell` on Conta › Integrações. In the original it is a **search-only** sidebar entry
("Webhook") inside the Integrações group — the clone already listed that entry, it just had no
destination. It is the only one of the ten that is not an `/users/integracao/*` page, which is why
it is in scope while the others are not.

Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Action row:** "Adicionar Webhook" (`hbtn--primary`, `GridPlusIcon`, opens
   `webhook-create-modal`) and "Chave da API" (`hbtn--secondary`, `KeyIcon`), which links
   `/users/integracao/api-webhooks` — out of scope, so the clone renders it as an inert button
   rather than a dead `href`.
2. **Webhooks Configurados:** an `hwidget-head` over "Receba eventos em tempo real quando
   agendamentos, agendas ou membros mudarem", then `#webhook-table-container` holding an `htable`
   in `data-htable-mode="fixed"` with 10 slots and `--htable-row-h: 3.5rem`.
   Columns: Tipo de Registro · URL · Eventos · **método** (lower-case in the original) ·
   Ações (`--end`). Empty: "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta
   tabela." The original fills this container over HTMX
   (`hx-get="/webhook/webhook-config/partial/" hx-trigger="load"`), behind a spinner.
3. **Como funcionam os webhooks?** — a `hui-card` with an `InfoIcon` badge and three numbered
   steps in `md:grid-cols-3`: Configure o endpoint · Selecione os eventos · Receba notificações.
4. **`webhook-create-modal`** (lg), also used for editing, titled "Novo Webhook" / "Editar Webhook":
   - *Tipo de registro* (`hcombobox`, required): APPOINTMENT Agendamentos · CALENDAR Agendas ·
     MEMBERSHIP Membros da Equipe.
   - *URL* (required, `type="url"`, placeholder `https://exemplo.com/webhook`) with the note about
     `{register_key}`.
   - *Eventos* (required), shown only once a type is chosen: Criação and Atualização always,
     **Cancelamento only for APPOINTMENT**, **Exclusão only for CALENDAR and MEMBERSHIP**.
     With no type chosen, a `halert--accent` replaces the list: "Selecione primeiro o tipo de
     registro para escolher os eventos disponíveis."
   - *Configurações avançadas (opcional)* — a disclosure whose chevron rotates, revealing the
     "Cabeçalho de Autenticação (JSON)" textarea, which starts at `{}`.
   - Footer: Cancelar · Criar Webhook / Salvar.
5. **`webhook-delete-dialog`** (`halertdialog--danger`): "Excluir este webhook?" over "As
   notificações para **<url>** param imediatamente. O histórico de envios é mantido."

## Row markup
The verified account had no webhook, so the table never rendered a row: the cells follow the
column headers, with the URL in the same `<code>` chip the team log uses for its identifier. The
"método" column is `POST` for every row, which is the only method the original's create form can
produce.
