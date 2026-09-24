# /users/referrals/ — Behaviors

## Scroll sweep
- Passa da viewport em 1440×900 (doc 1239) por causa da tabela; rola normalmente.
- `.hui-reveal` anima em cascata: cartão do link, KPIs (`animation-delay:.04s`) e histórico (`.08s`).

## Click sweep
- **Copiar** grava o link na área de transferência e troca o conteúdo do botão pelo estado
  `hcopyfield-btn-state--done` ("Copiado!"), voltando ao normal depois de 2s no clone.
- As tags de status trocam a ativa; a busca filtra o histórico no servidor do original.

## Per-state content
- Conta sem indicações: "Nenhuma indicação ainda / Compartilhe seu link e as empresas que se
  cadastrarem por ele aparecerão aqui." (ícone de presente).
- Com busca ou status: "Nenhuma indicação encontrada / Nenhuma indicação corresponde à busca ou ao
  status selecionado. Ajuste ou limpe os filtros."
- KPIs zerados, cada um com o gráfico vazio (`hkpi-spark-empty`).
- 10 linhas vazias (`--htable-row-h: 3.5rem`, cabeçalho 38px).

## Responsive sweep
- **1440:** KPIs em quatro colunas de 253.5px; busca à esquerda e tags à direita.
- **<768:** busca em largura total e as tags descem, com o rail rolando na horizontal.

## Verification
Medido contra o ao vivo em 1440×900: cartão do link (1062×150), campo de cópia (1022×54), botão
Copiar, KPIs, cabeçalho, filtros, tabela e estado vazio batem, e a altura total é a mesma (1239).
