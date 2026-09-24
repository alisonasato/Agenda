# /agendamentos/tags/ — Behaviors

## Data (fase de lógica)
- As tags vêm do navegador (docs/DATA-LAYER.md). "Aplicar em Agendas" e "Aplicar em Serviços" são
  derivados dos serviços que carregam a tag; sem nenhum, a linha diz "Todas as agendas/Todos os serviços".
- O modal cria ou edita a tag e re-aponta os serviços marcados; a lixeira apaga a tag e a remove deles.

## Scroll sweep
- Cabe na viewport em 1440×900 (doc 900).

## Click sweep
- **Nova Tag** abre o modal lg (512px) com o formulário de três campos.
- Os dois autocompletes abrem painéis teleportados com busca e chips.

## Per-state content
- Sem tags: "Nenhuma tag por aqui / Crie tags para categorizar e filtrar seus agendamentos."
- Com busca: "Nenhuma tag encontrada / Nenhuma tag corresponde à busca…".
- 10 linhas vazias (`--htable-row-h: 3.25rem`).

## Responsive sweep
- **1440:** busca à esquerda, Agendas e Nova Tag à direita; tabela 1072.
- **<768:** busca em largura total e os botões na linha de baixo.

## Verification
Medido contra o ao vivo em 1440×900: busca, botões (104.7 e 107.9 de largura), título, tabela e
estado vazio batem; o modal abre no mesmo tamanho (512×408.5).
