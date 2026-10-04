# Novo Grupo de Agendas — Page Topology

Source: `https://eagenda.com.br/users/grupos/novo?version=3`
Route: `/users/grupos/novo` (title "Novo Grupo de Agendas"), `?id=` to edit one
Page key: `users-grupos-novo-7762209d`

## Shell
`DashboardShell` on Conta › Tela de Agendamento, whose "Adicionar Etapa 1" button opens it.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`, with the form itself capped
at `max-w-4xl`.

## Sections
Each one opens with an `h4.gfields-title`.
1. **Dados Gerais** — a `sm:grid-cols-2` grid with Nome do Grupo (required), Nome para o Link and
   Ordem (`hinput-wrap--number`), each with its own `hinput-desc`.
2. **Agendas** — the `hms` chip multi-select, placeholder "Selecione as agendas...", with the note
   that an empty field means the step chooses between other groups.
3. **Imagens** — two `hfilepicker`s side by side: "Imagem reduzida" (400x400) and "Imagem de
   Destaque" (1920x1080).
4. **Texto da Tela** — the CKEditor field "Texto da Tela do Grupo" with the word counter.
5. **`hsavebar`** with "Voltar" → `/users/tela_agendamento/?tab=groups` and "Salvar".
