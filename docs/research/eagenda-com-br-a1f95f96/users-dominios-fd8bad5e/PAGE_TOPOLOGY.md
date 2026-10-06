# Gerenciamento de Domínios — Page Topology

Source: `https://eagenda.com.br/users/dominios/?version=3`
Route: `/users/dominios` (title "Gerenciamento de Domínios")
Page key: `users-dominios-fd8bad5e`

## Shell
`DashboardShell` with **no active entry**. The v3 sidebar does not list this page at all: the only
link to it on the verified account sits in the **legacy, pre-v3 menu** (`menu-item` / `nav-item`
classes) rendered by `/users/excluir_usuario/`. It is cloned for completeness, and nothing in the
clone links to it either.

Container: `mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0` — note the `px-4`
and the `sm:px-6`, which most of the other screens do not have.

## Sections
1. **Filter row:** an `hui-search` ("Buscar por domínio", `name="q"`) and "Novo Domínio"
   (`hbtn--primary hbtn--sm`).
2. **`#domain-status-filters`** (`hrail` › `htaggroup--nowrap`): Todos · Verificados (`verified`) ·
   Pendentes (`pending`) · Falha (`failed`), with "Limpar filtros" pushed right.
3. **`hwidget-head`:** "Domínios Registrados", with no description.
4. **`#domain-table-container`:** an `htable` in `data-htable-mode="fixed"` with 10 slots and
   `--htable-row-h: 3.5rem`. Columns: Domínio · Situação · Verificado em · Ações (`--end`).
   Empty variants: "Nenhum domínio registrado / Registre um domínio para gerenciar os e-mails e os
   usuários da sua organização." and "Nenhum domínio encontrado / Nenhum domínio corresponde à
   busca ou à situação selecionada. Ajuste ou limpe os filtros."
5. **`domain-create-modal`** — "Registrar Domínio": one required field, `domain`
   (placeholder `empresa.com.br`), under "Após registrar, você receberá um registro TXT para
   adicionar ao DNS e validar a propriedade." The form carries `novalidate`. Footer:
   Cancelar · Registrar.
6. **`domain-detail-modal`** — "Domínio". Footer: Fechar, plus a "Verificar Agora"
   (`#domain-detail-verify-btn`) that the original keeps `hidden` until the loaded body says the
   domain can still be verified.
7. **`domain-delete-dialog`** (`halertdialog--danger`) — "Remover domínio?" over a body the page's
   own script writes: "**<domínio>** será removido e outra organização poderá registrá-lo; os
   dados dos usuários são preservados." Footer: Cancelar · Remover.

## Inferred
The verified account had no domain, so neither a table row nor the detail modal's body ever
rendered. The row cells follow the column headers; the three situation chips (Verificado,
Pendente, Falha) and the detail body — the domain with its chip, the TXT record in an `hcopyfield`
and "Verificado em" — are built from the register form's promise of a TXT record and from the
filter labels.
