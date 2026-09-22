# /onboarding/ — Behaviors

## Scroll sweep
- A página ocupa exatamente a viewport (doc 900 em 1440×900, 844 em 390×844); só `#step-content`
  rola. Em 390 a fase `config` gera 862px de conteúdo e rola dentro do palco.
- Sem efeitos ligados ao scroll.

## Entrance choreography
- `.onb-in` (0.8s), `.onb-rise` (0.68s) e `.onb-orb-in` (0.9s, mola) entram em cascata; o atraso de
  cada elemento vem da variável `--d` no atributo `style`.
- Fase `ask`: orbe 0ms · kicker 900ms · título 1050ms · texto 1200ms · botões 1350ms.
- Fase `config`: kicker 0ms · título 90ms · texto 180ms · form 270ms (cartões 60ms/160ms) · Voltar 360ms.
- `prefers-reduced-motion: reduce` zera as durações e os atrasos.

## Click sweep
- **Começar a configuração** → fase `config` (mostra o indicador de etapas). **Voltar** → fase `ask`.
- **Cartões:** hover sobe 2px, borda fica azul e o ícone inverte (fundo accent, ícone branco);
  o "Escolher" abre o espaçamento de 6px para 10px.
- **Sair** e **Pular e configurar depois** abrem o alert dialog "Quer continuar depois?"
  (448×228 em 1440×900): Continuar configurando fecha, Sair e configurar depois volta ao painel.
- **Bolinhas:** travadas na etapa 1; a ativa é 28px com halo `onb-dot-active`, as demais 24px.

## Per-state content
- A saudação usa o nome da conta ("Olá, Maria!" no clone) e o restante do texto é fixo.
- O original mostra ainda um overlay "Salvando..." e uma faixa de erro de rede enquanto faz POST;
  como o clone não envia nada, os dois ficam de fora.

## Responsive sweep
- **1440:** cabeçalho 56px, cartões lado a lado (326px cada, gap 20px), Lottie 240px.
- **768:** cartões ainda lado a lado (`md:grid-cols-2`), tipografia do título cai para 38px abaixo de 640.
- **390:** cabeçalho 60px (botão Sair 36px), bloco da conta escondido (`hidden sm:flex`),
  cartões empilhados com 342px, o palco rola.
