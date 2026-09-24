# /agendamentos/listar/ — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar and the status row are rails: they scroll horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Período** (`Próximos 7 dias` by default): popover 650×254 with presets
  Hoje · Próximos 7 dias · Próximos 30 dias · Este mês · Todos os períodos, plus two month
  calendars with ‹ › navigation; today carries `.is-today`.
- **Visualizar:** menu with "Ver Agenda" and "Lista de Espera", teleported 6px under the trigger.
  - Icons: eye on the trigger, calendar and clock on the items; Exportar uses a download icon and
    Colunas a sliders icon.
- On 2026-09-22 the live action bar dropped the Agenda, Serviço and Filtros widgets. It now reads
  período · | · Visualizar · | · Exportar.
- **Status tags:** Todos · Confirmados · Pendentes · Atendidos · Não compareceu · Cancelados.
- **Limpar filtros:** resets search, status and period.
- **Colunas:** toggles for Tags · Responsável · CPF · Email · Telefone · Comentários, divider,
  Respostas Formulários. Each adds/removes its column (`col_tags`, `col_owner`, `col_comment`).
- **Novo Agendamento:** opens the form page in a new tab, like the original.

## Hover states
- `.htag` and `.hbtn--secondary` darken on hover; column rows highlight with `hover:bg-gray-50`.

## Data (fase de lógica)
- Desde 2026-09-23 a lista lê os agendamentos do navegador (`src/lib/seiri`, ver docs/DATA-LAYER.md).
  Busca, tags de status, período e Colunas filtram de verdade; a lixeira apaga o agendamento.
- A conta de referência é vazia, então as linhas são construção do clone com as peças do design system.

## Per-state content
- The account has no appointments, so the table always shows the filtered empty state:
  "Nenhum agendamento encontrado / Nenhum agendamento corresponde aos filtros aplicados. Ajuste o
  período ou limpe os filtros." The unfiltered variant reads "Nenhum agendamento por aqui / Os
  agendamentos das suas agendas aparecerão nesta lista."
- The table keeps 10 fixed empty rows (`data-htable-slots="10"`, row height 3.5rem, head 38px).

## Responsive sweep
- **1440:** search 252px at left, buttons at right; table 1072 wide.
- **768:** same layout, action bar starts scrolling.
- **<768:** search takes the full width and the button row wraps below it; table scrolls horizontally.

## Empty-state variant rule
The live page picks the "filtered" copy from the search box and the period only — not from the status
tag. With `interval=all` and `status=PENDING` it still shows the default copy
("Nenhum agendamento por aqui / Os agendamentos das suas agendas aparecerão nesta lista"),
while the default `interval=next_7_days` shows "Nenhum agendamento encontrado…". The clone follows
the same rule.
