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
Medido contra o site ao vivo em 1440×900: aviso de SLA, botão de contratação, cartão do código,
stepper, cartões lado a lado, cabeçalho do histórico, tabela e estado vazio batem, e a altura total
da página é a mesma (1078).

## Data (fase de lógica)
- O código gerado vai para `data.supportCode`, então sobrevive a um recarregamento, como o token de
  2 horas do original. "Gerar novo" troca o que estava lá.
- O histórico lê `data.supportVisits`: atendente, início, páginas, duração e a situação em chip
  (Encerrado, Em andamento ou Expirado).
- O termo continua obrigatório: o botão "Aceitar e gerar código" só funciona com a caixa marcada.

## Verificação
No build estático: aceitar o termo gera um código de seis caracteres, que fica guardado e continua
na tela depois de recarregar; uma visita de exemplo sai como
"Equipe Seiri · 28/09/2026 14:20 · 12 · 18 min · Encerrado".

## Diferenças em relação ao original
- O código não dá acesso a ninguém: não há equipe de suporte nem sessão para auditar, então as
  visitas só existem nos dados.
- "Contratar Suporte Avançado" segue sem destino, porque o clone não tem planos.
