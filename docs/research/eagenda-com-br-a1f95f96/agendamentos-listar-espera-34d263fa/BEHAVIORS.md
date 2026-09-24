# /agendamentos/listar/espera — Behaviors

## Scroll sweep
- Cabe na viewport em 1440×900 (doc 900); só a tabela rola.
- A barra de ações e a linha de situações são rails com setas quando estreitam.

## Data (fase de lógica)
- A lista mostra as inscrições do navegador (docs/DATA-LAYER.md); busca, situação, agenda e período
  filtram, a lixeira remove e o modal grava uma nova inscrição (criando o cliente se o nome for novo).

## Click sweep
- **Incluir na Lista de Espera** abre o modal 2xl (672px). Enquanto a agenda não é escolhida, o modal
  mostra só o combobox — e o "Salvar" fica desabilitado no clone.
- **Período** abre o mesmo popover das outras listas; o padrão é "Todos os períodos".
- **Visualizar** abre o menu teleportado com Lista de Agendamentos e Ver Agenda.
- **Situação** troca a tag ativa; **Limpar filtros** volta tudo ao padrão.

## Per-state content
- Ninguém inscrito: "Ninguém na lista de espera / Clientes que se inscreverem para ser avisados de
  vagas aparecerão nesta lista."
- Com filtros: "Nenhuma inscrição encontrada / Nenhuma inscrição corresponde aos filtros aplicados…".
- 10 linhas vazias (`--htable-row-h: 3.5rem`, cabeçalho 38px).

## Responsive sweep
- **1440:** busca 248px, botão 207.3px, barra 449.5px; tabela 1072×606.
- **<768:** busca em largura total, botão e barra descem.

## Verification
Medido contra o ao vivo em 1440×900: busca, botão, barra, período, tags de situação, Limpar filtros,
tabela e estado vazio batem ponto a ponto.
