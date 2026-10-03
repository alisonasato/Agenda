# Tela pública de agendamento — Page Topology

Source: `https://eagenda.com.br/agendar/<org>/` (an agenda's own link redirects here)
Route: `/agendar/minhaempresa` (title "Minha Empresa — Agendamento Online")
Page key: `agendar-801a49a9`

## Shell
None. This page is not part of the dashboard: no sidebar, no topbar, its own stylesheet
(`src/app/agendar/booking.css`, the original's `iframe.css` plus the three inline blocks from its
head) and its own palette (`--iframe-*`, graphite + the organisation's accent).

## States, in the order the visitor walks them
1. **Landing** — `booking-landing` card with the organisation's name, its message and the
   "Agendar" CTA. `?agenda=<identificador>` skips it.
2. **Stepper** — `booking-stepper`, three steps: Agenda · Data e Hora · Seus Dados. A step already
   passed shows a check instead of its number.
3. **Unidade** (only when the account has units) — `booking-unit-card` per unit plus a dashed
   "Todas as unidades".
4. **Tabs** — `booking-tabs`: Por Agenda · Por Serviço (only when services exist) · Por Data.
5. **Agenda** — `booking-agenda-card` grid, 1 column on phones and 2 from `sm`, each with the
   initial as avatar, the duration and the number of services.
6. **Serviço** — `booking-service-card` grid with the duration and the price.
7. **Data e Hora** — `iframe-card` split in two: the month calendar on the left (`iframe-day`,
   an availability dot under each open day, a bar for "sem vaga" and for "feriado", plus the
   legend) and the slots on the right (`iframe-slot`), stacked on phones.
8. **Seus Dados** — a sticky `booking-summary-header` with what was chosen and "Alterar", the
   fields the agenda asks for, the agenda password when it has one, the recurrence block when the
   agenda allows it, the terms checkbox and "Confirmar Agendamento".
9. **Recibo** — the confirmation card with `booking-receipt-rows`: agenda, day and time, price and
   the code.

## Footer
`booking-footer`, collapsed, with the "Mais informações" toggle and the copyright bar.
