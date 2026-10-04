# Notificações — Page Topology

Source: `https://eagenda.com.br/inbox/notifications/list/?version=3`
Route: `/inbox/notifications/list` (title "Notificações")
Page key: `inbox-notifications-list-89be791e`

## Shell
`DashboardShell` with no sidebar item of its own — the page is reached from "Ver Todos" at the
bottom of the topbar's bell dropdown.
Container: `mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0` (note the `px-4`
and the `sm:px-6`, narrower than the other pages' `px-6`).

## Sections
1. **Sound toggle:** a single `hbtn--secondary hbtn--sm` with a speaker icon, labelled "Som
   ativado" / "Som desativado" and carrying `aria-pressed`.
2. **Filters:** two `hrail`s on one line, the second pushed right with `ml-auto`, each wrapping a
   `htaggroup--nowrap`:
   - level: Todos · Informação · Alerta · Sucesso · Erro (each but the first with its icon)
   - status: Todas · Não lidas · Lidas
3. **Table** (`#inbox-table`): 10 slots, `--htable-row-h: 4rem`, columns Notificação · Quando ·
   Status · Ações (the last `htable-col--end`). Two empty states: "Nenhuma notificação por aqui /
   Você será avisado quando houver novidades na sua conta." and, with a filter on, "Nenhuma
   notificação encontrada / Nenhuma notificação corresponde aos filtros selecionados."

## Inferred from the live page
The checked account had no notifications at all, so the row markup could not be captured. The
clone builds each row from the columns the header names: the level as a soft `hchip` with its
icon beside the title and the text, the moment, a Lida/Não lida chip, and the two row actions.
