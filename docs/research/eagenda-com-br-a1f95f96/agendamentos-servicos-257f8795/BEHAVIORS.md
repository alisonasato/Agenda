# /agendamentos/servicos/ — Behaviors

## Scroll sweep
- Cabe na viewport em 1440×900 (doc 900); só a tabela rola.

## Click sweep
- **Novo Serviço** abre o modal 2xl (672px) com o formulário completo.
- **Agenda** abre o popover de seleção múltipla (teleportado), com busca e rodapé "Limpar/Concluir".
- **Limpar filtros** zera a busca e a Agenda; **Agendas** sai para `/agendamentos/configurar`.
- Dentro do modal: a cor abre o color picker do design system e os três campos de vínculo são
  autocompletes com chips.

## Per-state content
- Conta sem serviços: "Nenhum serviço por aqui / Cadastre os serviços que seus clientes podem agendar."
- Com filtros aplicados: "Nenhum serviço encontrado / Nenhum serviço corresponde aos filtros…".
- A tabela mantém 10 linhas vazias (`--htable-row-h: 3.25rem`, cabeçalho 38px).

## Responsive sweep
- **1440:** busca 248px à esquerda, botão e barra à direita; tabela 1072 de largura.
- **<1280:** Tags e Colaboradores somem; **<1024:** Pessoas, Agendas e Ordem também.
- **<768:** a busca ocupa a linha inteira e o botão desce.

## Verification
Medido contra o site ao vivo em 1440×900: formulário de filtros, barra, cabeçalho, tabela e estado
vazio batem; o modal também (painel 672×772, campos e rodapé nas mesmas posições).
