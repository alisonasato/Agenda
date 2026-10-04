# Cadastros de Clientes — Page Topology

Source: `https://eagenda.com.br/users/convites-cadastro/cadastros/?version=3`
Route: `/users/convites-cadastro/cadastros` (title "Cadastros de Clientes")
Page key: `users-convites-cadastro-cadastros-6ade1feb`

## Shell
`DashboardShell` on Clientes › Cadastros Recebidos — the second sidebar entry the clone was
missing. Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Filter row:** `hui-search` ("Buscar por nome ou e-mail") and an `hactionbar` whose only
   button is "Convites" (`GridPlusIcon`), back to the invites page.
2. **Status pills:** Todos · Pendente de aprovação (`PENDING`) · Aprovado automaticamente
   (`AUTO_APPROVED`) · Aprovado (`APPROVED`) · Rejeitado (`REJECTED`), plus "Limpar filtros".
3. **`#submission-bulk-bar`:** hidden until something is picked, then "<n> selecionado(s)" with
   Aprovar selecionados (`hbtn--primary`) · Rejeitar selecionados (`hbtn--danger`) ·
   Limpar seleção (`hbtn--tertiary`).
4. **`#submission-table-container`:** an `htable` with 10 slots and `--htable-row-h: 3.5rem`.
   Columns: a `htable-col--check` carrying "Selecionar todos os pendentes" · Cliente · Convite ·
   Status · Recebido em · Ações (`--end`). Empty variants: "Nenhum cadastro recebido ainda" and
   "Nenhum cadastro encontrado".
5. **`submission-detail-modal`** (xl, the "olhinho"): the title is the person's name and the footer
   shows Rejeitar · Aprovar only while the row can still be decided — the original hides
   `#submission-detail-actions` on open and lets the loaded body re-show it.
6. **Four `halertdialog`s**, one per decision × scope:
   - `submission-approve-dialog` (success) — "Aprovar cadastro?"
   - `submission-reject-dialog` (danger) — "Rejeitar cadastro?", with "Motivo (opcional)" and
     "Avisar a pessoa por e-mail" (checked); the note "O motivo preenchido acima vai junto no
     e-mail." only appears once a motivo is typed.
   - `submission-bulk-approve-dialog` / `submission-bulk-reject-dialog`, same bodies counting rows.

## Row markup
As on the invites page, the verified account has no submission. The cells follow the column
headers plus the attributes the page's script reads (`data-submission-approve-url`,
`data-submission-reject-url`, `data-submission-label`, `data-submission-detail-name`,
`data-submission-check`).
