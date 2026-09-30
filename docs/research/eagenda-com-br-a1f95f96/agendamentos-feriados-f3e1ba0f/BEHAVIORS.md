# /agendamentos/feriados — Behaviors

## Scroll sweep
- The page itself scrolls (doc height 1688 at 1440×900) — the only cloned page tall enough to do so.
- No scroll-driven effects; the topbar stays sticky as everywhere else.

## Click sweep
- **Editar Configuração** (pencil, one per agenda row): opens "Feriados de <agenda>" as a modal
  on the live site. Out of scope here.
- **Adicionar Feriado:** opens the custom-holiday modal on the live site. Out of scope here.
- No search, filters or tabs on this page.

## Hover states
- Rows and buttons follow the shared `.htable` / `.btn-icon` rules.

## Per-state content
- Configuração table: one row per active agenda, with `.hchip--default` chips reading "Não"/"Sim"
  for the two blocking options. Its empty state exists but stays hidden while there is a row.
- Feriados Customizados and Feriados do Sistema are both empty on this account and show
  "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta tabela."
- The system table declares pagination (`data-htable-paginate="true"`) but the
  `.htable-pagination` element is `hidden` while the list is empty — keeping it visible would add
  24px to the page height.

## Responsive sweep
- **1440:** three sections at 1062 wide; tables 359 / 358 / 566 tall.
- **768:** same stack, tables scroll horizontally.
- **<768:** section heads stack over their buttons; table 342 wide at 390, no page overflow.

## Data (fase de lógica)
- A primeira tabela lista as agendas ativas e o que cada uma bloqueia (`data.holidayRules`).
  "Sim" sai no tom success, "Não" no default, como no original.
- **Editar Configuração** abre "Feriados de <agenda>": as duas caixas (feriados nacionais e
  estaduais) e, quando alguma está marcada, o botão "Personalizar quais feriados bloquear", que
  abre a lista dos feriados nacionais com a data à direita. Desmarcar um feriado guarda a data em
  `skipped`, e é só ela que deixa de bloquear.
- **Adicionar Feriado** grava em `data.holidays`: nome, data, "Feriado de múltiplos dias" com a
  data final, "Bloquear o dia inteiro" com os dois horários quando desmarcado, e "Aplicar em todas
  as agendas" com o multi-select quando desmarcado. Cada campo escondido aparece exatamente com a
  mesma condição do original.
- A tabela de customizados mostra o período ("24/12/2026" ou "24/12/2026 – 31/12/2026"), o horário
  ("Dia inteiro" ou "13:00 – 18:00"), a descrição e as agendas ("Todas" quando vale para todas),
  com editar e excluir.
- "Feriados do Sistema" fica vazia enquanto nenhuma agenda bloqueia feriados nacionais, e passa a
  listar os feriados nacionais assim que alguma bloqueia.
- Os feriados valem de verdade: `slots.ts` fecha os horários do dia do mesmo jeito que um bloqueio
  manual, e o motivo que o calendário mostra é o nome do feriado.

## Verificação
`node --experimental-strip-types src/lib/seiri/holidays.test.mjs` cobre as regras: dia inteiro,
período de vários dias, feriado só de parte do dia, feriado preso a outra agenda, feriado nacional
ligado/desligado/desmarcado, e os slots do calendário fechando no Natal.

No build estático: criar "Recesso de Natal" em 24/12/2026 põe a linha
"24/12/2026 · Dia inteiro · Recesso de Natal · Todas" na tabela, e "Feriados do Sistema" já lista
os feriados nacionais porque a Agenda Principal bloqueia os nacionais.

## Diferenças em relação ao original
- Feriados estaduais só existem como opção: o clone não tem a lista por estado, então marcá-la
  guarda a escolha mas não fecha nenhum dia. Os nacionais fecham.
- "Feriados do Sistema" mostra os feriados nacionais de 2026 e 2027 de uma vez; o original pagina
  essa tabela.
- O original grava pelo servidor (`hx-post`); aqui os dois modais gravam nos dados do navegador.
