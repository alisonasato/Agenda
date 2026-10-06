# Importar Clientes — Page Topology

Source: `https://eagenda.com.br/users/clientes_autorizados/upload/?version=3`
Route: `/users/clientes_autorizados/upload` (title "Importar Clientes")
Page key: `users-clientes_autorizados-upload-9fe6d508`

## Shell
`DashboardShell` with **no active entry**: the original highlights nothing in the menu here and
leaves every group closed, so the shell is given an empty `active`. The page is reached from the
"Importar" button in the action bar of Gestão Individual, which the clone rendered inert until now.

Note the sidebar's own "Importar Clientes" entry points at `/clientes/listar` **in the original
too**, so it is not the way in and was left alone.

Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **"Voltar"** (`hbtn--secondary`, `ChevronLeftIcon`) back to Gestão Individual.
2. **Importação de arquivo** — an `hwidget-head` whose description lists the accepted columns
   (Cliente ID, Nome, Email, CPF, Telefone, CNPJ, Limite de Agendamentos, Período, Data limite de
   Agendamento), the rule that at least one identifier must be filled, the values the limit accepts
   (DIA, SEMANA, MES, 15D, 30D or empty) and the 10000-client ceiling.
   Under it, `.imp-content` wraps a single `.imp-group` holding a `max-w-xl` form: a required
   `type="file"` accepting `.csv,.xlsx,.xls`, and "Enviar" (`hbtn--primary`, `PlaneIcon`).
3. **Histórico de Importação** — an `htable` in `data-htable-mode="fixed"` with 10 slots and
   `--htable-row-h: 3.5rem`. Columns: Usuário · Nome do Arquivo · Enviado em (`whitespace-nowrap`)
   · Status · Arquivo (`--end`).
   Empty: "Nenhum arquivo importado ainda / Os arquivos que você enviar aparecem aqui com o
   andamento do processamento."

## Styles
`.imp-content` and `.imp-group` come from an inline `<style>` on the original's page and are in
neither the compiled `eagenda.css` nor Tailwind, so they were copied into `globals.css` verbatim.

## Row markup
The verified account had never imported a file, so the table never rendered a row. The cells follow
the column headers; the three statuses (Processando, Concluído, Falhou) and their chip tones are
inferred from the empty state's wording about "o andamento do processamento".
