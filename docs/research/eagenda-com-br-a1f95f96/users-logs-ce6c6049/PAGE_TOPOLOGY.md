# Histórico de Atividades de Usuários — Page Topology

Source: `https://eagenda.com.br/users/logs/?version=3`
Route: `/users/logs` (title "Histórico de Atividades de Usuários")
Page key: `users-logs-ce6c6049`

## Shell
`DashboardShell` on Conta › Convidar equipe. The entry point is a per-row "Histórico de
Atividades" icon on Administrar Equipe, which links `?member=<id>` in a new tab — the clone's team
rows had only Editar and Excluir until now.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Action row** (`mb-4 flex items-center gap-2`): "Equipe" (`hbtn--secondary hbtn--sm`,
   `ChevronLeftIcon`) back to Administrar Equipe, and "Atualizar" (`RefreshIcon`), which in the
   original is a link to the page's own URL.
2. **`hwidget-head`:** "Registros" over "Histórico de ações executadas pela equipe em agendamentos.
   Os registros do plano atual ficam disponíveis por 30 dias."
3. **`#team-logs-table-container`:** an `htable` in `data-htable-mode="manual"` (no fixed slots, no
   pagination). Columns: Criado em · Agenda · Horário · Identificador · Usuário · Ação.
   - the identifier is a `<code class="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700
     font-mono">`;
   - the user is the member's **e-mail**, not their name;
   - the action is an `hchip--primary hchip--sm` — `hchip--accent` for "Agendamento criado",
     `hchip--danger` for "Agendamento cancelado".
   - Empty variants: "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta
     tabela." and "Nenhum resultado encontrado / Nenhum registro corresponde aos filtros aplicados.
     Ajuste ou limpe os filtros para ver mais resultados."

## Loading
The original ships the page as a spinner and swaps the table in with
`hx-get="/users/logs/?version=3" hx-trigger="load, refresh from:body"`. The clone has the rows
locally, so it renders the table directly.
