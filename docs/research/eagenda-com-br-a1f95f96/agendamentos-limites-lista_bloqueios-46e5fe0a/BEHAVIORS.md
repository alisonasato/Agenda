# /agendamentos/limites/lista_bloqueios — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900, 961 at 390); only the table scrolls.
- Action bar and status rail scroll horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Tipo:** popover (240px) listing E-mail · Telefone · CPF, with search, "Limpar"/"Concluir"
  and a count badge on the trigger.
- **Todos / Ativos / Inativos:** switch `.htag--active`.
- **Limpar filtros:** resets search, status and the type filter.
- **Incluir bloqueio:** opens a modal on the live site (out of scope here).
- **Limites de Agendamento:** goes back to /agendamentos/limites.

## Hover states
- Tags, buttons and table rows follow the shared `.htag` / `.hbtn` / `.htable` rules.

## Per-state content
- Unfiltered empty state: "Nenhum bloqueio cadastrado / Contatos impedidos de agendar por e-mail,
  telefone ou CPF aparecerão nesta lista." Filtered: "Nenhum bloqueio encontrado / Nenhum bloqueio
  corresponde aos filtros aplicados. Ajuste a busca ou limpe os filtros."
- Table keeps 10 fixed empty rows (row height 3.25rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, buttons at right; table 1072 wide, empty message 464×150.
- **768:** same rows, action bar starts scrolling.
- **<768:** search full width and the button row wraps below; table 342 wide at 390, no page overflow.

## Data (fase de lógica)
- **Incluir bloqueio** abre o modal clonado de `/agendamentos/limites/lista_bloqueios/incluir`:
  Tipo de Dado (E-mail, Telefone, CPF), Contato, "Remover Bloqueio em" com data e horário — e o
  aviso "Em branco = bloqueio por tempo indeterminado." — e Motivo. Salvar grava em
  `data.suppressions`.
- A tabela mostra Situação (Ativo no tom success, Inativo no default), Tipo, Chave, Motivo,
  Incluído em, Incluido por e Expira em ("—" quando não expira), com desativar/reativar, editar e
  excluir.
- A busca cobre o contato e o motivo; as tags Todos/Ativos/Inativos e o filtro Tipo filtram as
  linhas; **Limpar filtros** volta tudo.
- O bloqueio vale de verdade: **Novo Agendamento** não grava para um cliente cujo e-mail, telefone
  ou CPF esteja num bloqueio ativo e ainda não expirado, e a barra de salvar passa a
  "Limite atingido" com o nome do cliente e o motivo. O telefone casa por dígitos, então
  "(11) 99999-0001" e "11999990001" são o mesmo contato.

## Verificação
`node --experimental-strip-types src/lib/seiri/limits.test.mjs` cobre as regras do bloqueio:
casar por e-mail, não casar outro cliente, bloqueio inativo, bloqueio vencido, bloqueio ainda
válido e telefone com pontuação diferente.

No build estático: incluir "ana.lima@exemplo.com.br · Faltas seguidas" põe a linha com o chip
Ativo, "Expira em —" e o responsável; a tag **Inativos** esvazia a tabela com
"Nenhum bloqueio encontrado"; editar a linha reescreve o contato.

## Diferenças em relação ao original
- O original grava pelo servidor (`hx-post`); aqui o modal grava nos dados do navegador.
- O clone casa o bloqueio contra os clientes cadastrados. O original também barra quem agenda pela
  página pública sem cadastro, que este clone não tem.
