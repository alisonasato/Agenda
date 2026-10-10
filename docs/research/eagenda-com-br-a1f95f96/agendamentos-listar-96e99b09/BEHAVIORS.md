# /agendamentos/listar/ — Behaviors

## Botões (fase de lógica)
- **Exportar** baixa `agendamentos-AAAA-MM-DD.csv` com as linhas visíveis.
- O lápis abre um modal com dia, horário, status e comentários, e salvar altera o agendamento.

## Linha da tabela (fase de lógica)
Refeita em 26/09/2026 contra o original com dados na tela. As dez colunas são as mesmas, e o botão
"Colunas" liga e desliga Tags, Responsável, CPF, Email, Telefone, Comentários e Respostas Formulário.

- **Cliente** mostra o nome (link para os detalhes do cliente) e, embaixo, a linha de contato que as
  colunas opcionais controlam: telefone com link de WhatsApp, e-mail com `mailto:` e o CPF.
- **Tags**, **Responsável** e **Comentários** trazem cada um o seu `btn-icon` de editar, que abre o
  modal correspondente e grava no agendamento.
- **Ações** seguem o status, como no original: Pendente → Editar · Confirmar · Recusar;
  Confirmado → Editar · Registrar Chegada · Não Compareceu · Cancelar Agendamento; **cancelado não
  mostra botão nenhum, só o texto "Cancelado"**. Cada ação passa pela confirmação
  (a mesma do calendário) antes de mudar qualquer coisa.
- **Recibo** é um `hbtn--secondary` escrito "Ver", que abre o mesmo recibo do calendário.
- **Identificador, Status e Quando** levam à tela de detalhes do agendamento
  (agendamentos-detalhes-b0a38a5f), e embaixo do horário aparece o "criado dd/mm/aaaa hh:mm".

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
  - **A escolha é lembrada.** O original guarda uma chave de localStorage por checkbox
    (`check_owner`, `check_tags`…) com `"true"`/`"false"`; o clone guarda o conjunto numa só,
    `seiri.view.v1`, separada de `seiri.data.v1` — é preferência de quem olha, não dado da conta,
    e não tem por que virar coluna no banco.
  - **O padrão é só Responsável.** Medido apagando as chaves do original e recarregando: ele
    reescreve `check_owner: "true"` e todas as outras `"false"`. O clone começava sem nenhuma.
  - **Respostas Formulários não acrescenta coluna** — nem no original. Marcando lá, nenhum
    `col_answers` aparece no DOM. Depende de haver respostas de formulário, que nem a conta de
    referência nem o clone têm, então o interruptor inerte do clone é fiel e não um buraco.
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

## Seletor de período (medido em 2026-10-09)

Os dias dos dois calendários do popover **não eram clicáveis**: o clone só sabia os cinco presets.
Medido no original, e implementado em `lib/seiri/range.ts` (regras) e `shared/DateRangePopover.tsx`:

- **Dois cliques.** O primeiro marca o início (`is-rstart` na célula, `is-selected` no botão) e
  não muda nada: rótulo, filtro e URL ficam como estavam. O segundo fecha o intervalo, em qualquer
  ordem — clicar 28 e depois 24 dá `24/10 – 28/10` — e é só nele que o filtro muda. Um terceiro clique
  recomeça, e o intervalo antigo continua valendo até o novo ficar completo.
- **Pré-visualização.** Com o início marcado, passar o mouse sobre outro dia pinta a faixa até ele,
  atravessando os dois meses; passar *antes* do início troca os extremos.
- **Faixa.** `is-inrange` em todas as células do intervalo, extremos inclusos, `is-rstart` no primeiro
  e `is-rend` no último. Ao reabrir, o painel abre no mês do início.
- **Rótulo.** `15/10 – 22/10`, ou `15/10` para um dia só (clicar duas vezes no mesmo). Nunca leva o
  ano, nem quando o intervalo atravessa um: `20/12 – 05/01`.
- **Preset vira intervalo.** Escolher "Próximos 7 dias" não guarda o nome: o original navega com datas
  explícitas, o rótulo passa a ser `09/10 – 15/10` e nenhum preset fica destacado. Próximos 7 dias é
  hoje + 6, Próximos 30 dias é hoje + 29 (`09/10 – 07/11`), Este mês é o mês corrente inteiro.
  "Todos os períodos" é a exceção, porque não há intervalo para o qual convertê-lo. Só a abertura
  padrão da tela, sem parâmetros, mostra o nome "Próximos 7 dias" destacado.
- **"Limpar período"** está sempre no rodapé, também aqui e na Lista de Espera, e volta a
  "Todos os períodos". O clone só o tinha nos relatórios.

### Nos relatórios (Consolidado, Clientes, Agendamentos)

O comportamento difere da lista: nada recarrega, o rótulo acompanha a escolha na hora, **o painel
continua aberto** depois do segundo clique e depois de um preset (só "Limpar período" o fecha), e o
resultado só muda em "Aplicar filtros". Abrem em `10/09 – 09/10`, os últimos 30 dias contando hoje.
"Todos os períodos" é um estado válido ali, e "Limpar período" leva a ele.

### O que não foi medido

A URL do original recebe `start_date`/`end_date` (`dd/mm/aaaa`); o clone guarda o período em estado e
não o põe na URL. A abertura vinda do card "Agendamentos hoje" do painel segue como estava, pelo
nome do preset.
