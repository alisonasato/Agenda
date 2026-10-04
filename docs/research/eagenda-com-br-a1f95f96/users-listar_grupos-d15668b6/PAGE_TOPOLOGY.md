# Grupos de Usuários — Page Topology

Source: `https://eagenda.com.br/users/listar_grupos?version=3`
Route: `/users/listar_grupos` (title "Grupos de Usuários")
Page key: `users-listar_grupos-d15668b6`

## Shell
`DashboardShell` on Conta › Convidar equipe, where the action bar's "Grupos de Usuários" button
opens it.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **"Novo Grupo"** (`hbtn--primary hbtn--sm`), which opens the `group-form-modal` (lg).
2. **Grupos Cadastrados:** an `hwidget-head` with the description "Grupos de permissão da sua
   equipe…", then an `htable` in `data-htable-mode="manual"` (no fixed slots) with Nome do Grupo ·
   Descrição · Permissões (`--num`) · Membros Ativos (`--num`) · Status · Ações.
   With no group, the body is one full-width cell with a rounded icon and "Nenhum grupo cadastrado
   / Crie um novo grupo para organizar as permissões da sua equipe."
3. **`group-form-modal`:** Nome do Grupo (required, maxlength 50), Descrição, and two
   `hautocomplete` multi-selects — Membros do Grupo and Permissões do Grupo. Footer: Cancelar ·
   Salvar.

## Permissions
`/autocomplete/member_permissions` returns, in order: Cadastro de Clientes — Leitura / Escrita /
Excluir Dados, Relatórios — Acesso ao Módulo, Agendamentos — Criar/Editar/Cancelar, Agendas —
Criar/Editar/Excluir, Financeiro — Acesso a Faturamento e Pagamentos. The live endpoint repeats
three of them further down its list; the clone keeps the seven distinct ones.
