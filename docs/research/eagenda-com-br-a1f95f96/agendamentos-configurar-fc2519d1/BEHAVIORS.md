# /agendamentos/configurar/ — Behaviors

## Scroll sweep
- Ordinary page scroll (doc height 905 at 1440×900, 1139 at 390); no scroll-driven effects.
- The action bar is a rail with `.hrail-arrow` buttons when it overflows.

## Click sweep
- **Cards / Tabela:** switches `#agendas-container`; `.htabs-indicator` slides like every other tab bar.
  The table lists Agenda · Status · Horários · Serviços · Max/Hora · Min Ant. · Max Ant. · Intervalo ·
  Período · Confirmar · Dados Solicitados · Formulários · Ações.
- **Todas / Ativas / Inativas:** `.htag--active` filters the cards.
- **Unidade · Serviço · Usuário · Filtros · Configurações:** searchable popovers (240px) with
  "Limpar"/"Concluir"; empty ones show "Nenhum resultado encontrado".
- **Limpar filtros:** resets search and status.
- **Card:** weekday tabs, "Ver/Editar todos os horários", quick icons, Configurar, Ver Agenda and
  the update/deactivate/delete buttons all open modals or other pages on the live site.

## Hover states
- `.hnote-vital` and `.hnote-tab` highlight on hover; the "Problemas" chip has
  `hover:brightness-95` and a pointer cursor.

## Per-state content
- The live agenda has no schedule, so the card shows "Nenhum horário configurado", zero vitals,
  "—" for Última data, and a warning chip "Problemas" next to "Videoconferência".
- Card rules: Duração 30min · Opções a cada 30min · Máx./horário 1 · Antecedência 1h – 7 dia(s).
- Facts: "Pede ao cliente: Nome · email · telefone · cpf · endereço" and the notification
  on/off row (Confirmar off · Novos on · E-mail off).

## Responsive sweep
- **1440:** two cards per row (518×618 each), the spine tabs sit outside the page at x−26.
- **1024–1439:** still two columns (`lg:grid-cols-2`).
- **<1024:** single column with `pl-7` so the spine tabs stay visible; card 330 wide at 390,
  no horizontal page scroll.
