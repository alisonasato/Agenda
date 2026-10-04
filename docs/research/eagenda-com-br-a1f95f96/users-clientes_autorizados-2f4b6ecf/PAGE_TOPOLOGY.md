# Acesso Individual de Clientes — Page Topology

Source: `https://eagenda.com.br/users/clientes_autorizados/?version=3`
Route: `/users/clientes_autorizados` (title "Acesso Individual de Clientes")
Page key: `users-clientes_autorizados-2f4b6ecf`

## Shell
`DashboardShell` on Clientes › Acesso de Clientes. The page is the sibling of the already-cloned
"Listas de Controle de Acesso" (Gestão em Lote) and is reached from its action bar.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Search line:** `hui-search` with the placeholder "Nome, E-mail, CPF ou CNPJ", and "Novo
   Cliente" (`hbtn--primary hbtn--sm`) on the right.
2. **Action bar** (`hactionbar` in a rail): the Agenda and Serviço filters, a separator, then
   "Gestão em Lote" → the access lists, "Importar" → the upload page, "Exportar" → an xlsx, and
   "Limpar filtros".
3. **Table**, 10 slots, columns Cliente ID (a mono chip) · Cliente · Email · Empresa ·
   Agendamentos ("N realizados") · Limites (a chip) · Status · Ações. The actions are "Copiar Link"
   (the client's own booking link), "Editar" and "Remover".
