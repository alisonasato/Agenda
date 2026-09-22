# /onboarding/ — Behaviors

## Scroll sweep
- A página ocupa exatamente a viewport (doc 900 em 1440×900, 844 em 390×844); só `#step-content` rola.
- Etapas longas (3 com serviços, 4 com horários, 6 com os dados do cliente) rolam dentro do palco.
- Sem efeitos ligados ao scroll.

## Entrance choreography
- `.onb-in` (0.8s), `.onb-rise` (0.68s) e `.onb-orb-in` (0.9s, mola) entram em cascata; o atraso de
  cada elemento vem da variável `--d` no atributo `style`.
- Etapa 1, fase "ask": orbe 0ms · kicker 900ms · título 1050ms · texto 1200ms · botões 1350ms.
- Etapa 1, fase "config": kicker 0ms · título 90ms · texto 180ms · cartões 270ms (+60/+160) · Voltar 360ms.
- Etapas 2 a 7, fase "ask": kicker 700ms · título 840ms · texto 960ms · botões 1080ms · Voltar 1160ms
  (etapa 5 usa 0/90/180/270/340 porque não tem animação, e a 7 acrescenta a nota em 1160ms e o Voltar em 1220ms).
- As fases "config" entram sem cascata, exceto o rodapé da etapa 6 (`--d:120ms`).
- `prefers-reduced-motion: reduce` zera durações e atrasos.

## Lotties
`hello` (etapas 1 e 2, a 2 em 0.6×), `services` (3, 0.5×), `agenda` (4), `alert` (6), `google` (7) e
`congrats` (final). O clone toca os mesmos arquivos com `lottie-web`, servidos de
`public/sites/eagenda-com-br-a1f95f96/onboarding-45eccead/`.

## Click sweep
- **Cartões:** hover sobe 2px e pinta a borda de azul; nos das etapas 1 e 3 o ícone inverte e o
  "Escolher" abre o espaçamento de 6px para 10px.
- **Etapa 3:** "Adicionar serviço" acrescenta uma linha (máximo de 10); a lixeira só aparece a partir
  da segunda linha; "Próximo" fica desabilitado sem nome de agenda e sem nenhum serviço nomeado.
- **Etapa 4:** os dias são caixas grandes que acendem quando ativos; "Mesmo horário"/"Por dia" troca
  entre um par de horários global e uma lista por dia. O botão de período **parte** a faixa em duas
  com uma hora de pausa no meio quando ela tem 4h ou mais ("Fechar para o almoço") e, a partir daí,
  acrescenta períodos ("Adicionar período"), até 4. Faixas invertidas ou sobrepostas mostram o aviso
  vermelho e travam o "Salvar e avançar".
- **Etapa 5:** o CEP é consultado ao sair do campo e a resposta vira uma linha com o ícone de pino.
- **Etapa 6:** ligar um aviso por e-mail trava o campo "E-mail" como solicitado; ligar o WhatsApp trava
  o "Telefone". O WhatsApp exibe a etiqueta "Precisa de saldo" enquanto a conta não tem créditos.
  "Não, aviso por conta própria" desliga os três avisos e pula direto para os dados do cliente.
- **Sair** e **Pular e configurar depois** abrem o alert dialog "Quer continuar depois?"
  (448×228 em 1440×900): Continuar configurando fecha, Sair e configurar depois volta ao painel.
- **Tela final:** "Copiar" copia o link público (o rótulo vira "Copiado!" por 2s); os três botões levam
  ao painel, ao novo agendamento e à página pública.

## Per-state content
- A saudação usa o nome da conta ("Olá, Maria!" no clone) e o restante do texto é fixo.
- O título da etapa 6 acompanha o termo escolhido ("Dados do cliente", "Dados do paciente"…).
- O original mostra ainda um overlay "Salvando..." e uma faixa de erro de rede enquanto faz POST;
  como o clone não envia nada, os dois ficam de fora.

## Responsive sweep
- **1440:** cabeçalho 56px; cartões lado a lado (2 colunas na 1 e na 3, 3 colunas na 5); formulários
  centralizados em 512px (etapas 2, 4 e 5), 576px (3) ou 672px (6).
- **768:** mesma estrutura; os cartões de três colunas viram um por linha abaixo de 768.
- **390:** cabeçalho 60px, bloco da conta escondido, cartões empilhados, os dias da etapa 4 em duas
  colunas de 165px e o palco rolando (727px de conteúdo na etapa 4).

## Verification
Medido contra o site ao vivo em 1440×900 (etapas 2 a 7, incluindo sub-passos) e em 390×844 (etapa 4):
seção, títulos, campos, listas, rodapés e altura de rolagem batem. A tela final não entra nessa
comparação porque o original só a mostra ao concluir o assistente.
