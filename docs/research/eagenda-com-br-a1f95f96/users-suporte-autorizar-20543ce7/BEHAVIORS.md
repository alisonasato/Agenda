# /users/suporte/autorizar/ — Behaviors

## Scroll sweep
- Em 1440×900 a página passa da viewport (doc 1078) por causa da tabela de histórico; rola normalmente.
- `.hui-reveal` anima a entrada do bloco de avisos e do histórico (este com `animation-delay:.06s`).

## Click sweep
- **Gerar código agora** abre o modal do termo (painel 2xl, 672px de largura).
- Dentro do modal, "Aceitar e gerar código" começa **desabilitado** e só libera com a caixa
  "Li e concordo com os termos." marcada. Reabrir o termo desmarca a caixa de novo.
- Aceitar fecha o modal e troca o cartão pelo código: número grande com `tracking-[0.2em]`, linha
  "Expira em …" com o ícone de relógio, botões **Copiar código** e **Gerar novo**, e o aviso de que
  o código aparece uma única vez.
- **Copiar código** escreve na área de transferência e mostra "Copiado!" por 2,5 segundos.
- **Gerar novo** reabre o termo — e, no original, revoga o código anterior.
- No original existe ainda um `.halert--danger` escondido ("Não foi possível gerar o código") para
  falha de rede; o clone não faz requisição, então ele fica de fora.

## Per-state content
- Conta sem Suporte Avançado: o aviso amarelo de SLA aparece no topo com o botão de contratação.
- Histórico vazio: escudo, "Nenhum acesso de suporte registrado" e a explicação. A tabela mantém
  5 linhas vazias (`--htable-row-h: 3.25rem`, cabeçalho 38px).

## Responsive sweep
- **1440:** "Como funciona" e "Sua privacidade" lado a lado (grid de 2 colunas); a lista de garantias
  usa 2 colunas internas (`xl:grid-cols-2`).
- **<1024:** os dois cartões empilham e a lista volta para uma coluna.

## Verification
Markup, textos, ícones e classes conferidos contra o site ao vivo. A medição lado a lado ficou
pendente: a sessão do eAgenda expirou antes da comparação.
