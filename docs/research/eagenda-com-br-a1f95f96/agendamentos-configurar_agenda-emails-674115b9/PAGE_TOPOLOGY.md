# Modelos de Email da Agenda — Page Topology

Source: `https://eagenda.com.br/agendamentos/configurar_agenda/<id>/emails?version=3`
Route: `/agendamentos/configurar_agenda/emails/?id=<agenda>` (title "Modelos de Email da Agenda")
Page key: `agendamentos-configurar_agenda-emails-674115b9`

## Shell
`DashboardShell` on Minha Agenda › Configuração — the page is reached from the envelope button on
an agenda card.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Buttons:** "Adicionar Créditos" (`hbtn--secondary`, opens the shared `add-credits-modal`) and
   "Voltar" (`hbtn--tertiary`) back to the agendas.
2. **Two KPIs** in `grid-cols-2`: "Templates" with the count, and "AgendaCoins" as a
   `hkpi--link hkpi--cta` card whose call to action reads "Extrato" and opens
   `/planos/transactions`.
3. **Lista de Templates:** a 10-slot `htable` with Tipo de E-mail (a soft chip) · Nome do Template ·
   Assunto do E-mail (`htable-cell--muted`) · Ações, the actions being an edit link and a delete
   button that opens the `tpl-delete-dialog` alert ("Excluir este modelo de email?").

## Route deviation
The original carries the agenda in the path (`/configurar_agenda/<id>/emails`). A static export
has no per-agenda route, so the clone keeps the agenda in `?id=`, the same way the agenda form and
the appointment details pages already do.
