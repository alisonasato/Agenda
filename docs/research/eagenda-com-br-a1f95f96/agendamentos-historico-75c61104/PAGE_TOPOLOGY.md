# Histórico de Configurações — Page Topology

Source: `https://eagenda.com.br/agendamentos/historico/<id>?version=3`
Route: `/agendamentos/historico/?id=<agenda>` (title "Histórico de Configurações")
Page key: `agendamentos-historico-75c61104`

## Shell
`DashboardShell` on Minha Agenda › Configuração — reached from the activity button on an agenda
card.
Container: `mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0`.

## Sections
1. **Action bar** (`hactionbar` inside a rail) with the period picker, the user picker and
   "Voltar"; on the right of the same line, an `htabs` with two tabs:
   - **Configurações** — columns Data · Usuário · Ação · Campo · Valor Anterior · Novo Valor,
     description "Alterações de configuração desta agenda".
   - **Horários** — columns Data · Usuário · Ação · Dia · Começo · Fim, description "Alterações nas
     janelas de atendimento". The original fetches it from
     `/agendamentos/historico_horarios/<id>`.
2. **Widget head** with the agenda's name and the tab's description.
3. **Table** (`#logs-container`), 10 slots, paginated in the footer (`htable-pagination` with
   `htable-pg-info` "1–10 / 53" and the numbered `htable-pg-btn`s). "Criar" and "Adicionar" use the
   accent chip, "Atualizar" the default one; a colour value shows a swatch before it; "Nenhum" is
   printed in `text-gray-400`.
   Empty states: "Nenhuma alteração registrada" and, with a filter on, "Nenhuma Alteração
   Encontrada".

## Route deviation
Same as the e-mail templates page: the agenda arrives as `?id=` instead of in the path.
