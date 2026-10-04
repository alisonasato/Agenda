# Convites de Cadastro — Page Topology

Source: `https://eagenda.com.br/users/convites-cadastro/?version=3`
Route: `/users/convites-cadastro` (title "Convites de Cadastro")
Page key: `users-convites-cadastro-a566fa3a`

## Shell
`DashboardShell` on Clientes › Convites de Cadastro — a sidebar entry the clone did not list
before this page existed (it sits between "Acesso de Clientes" and "Importar Clientes").
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Filter row** (`#formFilter`): an `hui-search` ("Buscar convite pelo nome", `md:w-72`), then on
   the right the primary "Convidar clientes" (`GridPlusIcon`) and an `hactionbar` with
   Cadastros recebidos (`UserAddIcon`) · separator · Texto do e-mail (`LetterIcon`) ·
   Modelo da planilha (`SheetIcon`, a `download` link in the original).
2. **Status pills** (`#status-quick-filters` › `htaggroup--nowrap`): Todos · Rascunho (`DRAFT`) ·
   Enviando (`SENDING`) · Enviado (`SENT`) · Arquivado (`ARCHIVED`), with "Limpar filtros"
   (`hbtn--secondary`) pushed right.
3. **`#invite-table-container`:** an `htable` in `data-htable-mode="fixed"` with 10 slots and
   `--htable-row-h: 3.5rem` / `--htable-head-h: 38px`. Columns: Convite · Destinatários ·
   Cadastros · Aprovação · Status · Criado em · Ações (`--end`).
   Two empty variants: "Nenhum convite criado ainda" (default) and "Nenhum convite encontrado"
   (filtered).
4. **`invite-modal`** (xl), one shell for create and edit — the trigger carries both the title and
   the submit label (`Convidar clientes` / `Criar e enviar`, or `Editar convite` /
   `Salvar alterações`). Five `hformsection`s:
   - *Identificação:* Nome do convite (required).
   - *Quem vai ser convidado:* "Lista de emails" (textarea, 6 rows) and a `.csv/.xlsx/.xls`
     file field with a "Baixar modelo da planilha" button.
   - *Texto do e-mail:* an `hselect` starting on "Texto padrão do sistema", plus "Gerenciar textos"
     opening the texts page in a new tab.
   - *Campos pedidos no cadastro:* two columns of `hcheckbox` pairs (ask + "Obrigatório"), over the
     eleven optional fields; Telefone starts checked. Nome and e-mail are never listed.
   - *Aprovação e validade:* "Aprovar cadastros automaticamente", "O cliente cria uma senha de
     acesso" (checked), the note about the password link, and "Validade do link (dias)" (0–365,
     default 7).
5. **`invite-delete-dialog`** (`halertdialog--danger`): "Excluir convite?", with the body worded
   one way when the invite has submissions and another when it has none.

## Row markup
The verified account has no invite, so the live page never rendered a row. The clone's cells are
built from the column headers plus what the page's own script reads off a row
(`data-invite-delete-url`, `data-invite-delete-label`, `data-invite-delete-submissions`,
`data-invite-modal-title`, `data-invite-modal-submit`). The chips and the two icon buttons follow
the design system the neighbouring tables use.
