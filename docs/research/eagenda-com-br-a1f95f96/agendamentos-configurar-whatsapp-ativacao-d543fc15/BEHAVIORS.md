# /agendamentos/configurar/whatsapp-ativacao — Behaviors

## Data (fase de lógica)
- O token mora em `data.whatsappCode`, para a tela ser determinística no prerender — sortear um
  código durante a renderização quebraria a hidratação.
- "Gerar novo código" grava um token novo de 22 caracteres e devolve o relógio para 10:00.
- O relógio é um `setInterval` de 1 s em `useEffect`; ao chegar a zero, o bloco do QR dá lugar ao
  alerta "Código expirado", que é o `x-show="expired"` do original.
- O QR é gerado no navegador pelo pacote `qrcode`, do mesmo link `wa.me` do botão, então os dois
  carregam sempre o mesmo texto.
- "Já enviei o código" troca o spinner por um aviso de que não há servidor para confirmar, no lugar
  do `hx-get` que o original dispara.
- O convite flutuante na tela de Configuração de Agendas aparece 600 ms depois do carregamento e,
  ao ser fechado, grava `hideWaToast` no `localStorage` — leitura e escrita em `try/catch`, porque
  janela anônima e dados de site bloqueados lançam ali.

## Verificação
No build estático: a tela abriu com o código da semente e o relógio em 10:00, que desceu para 09:49
em dois segundos. "Gerar novo código" trocou o token (`Qz7mKp…` → `9uH2vV…`), devolveu o relógio a
09:59 e o link `wa.me` saiu com o texto novo já codificado. "Já enviei o código" trocou o status.
Na tela de agendas, o convite apareceu com o link certo, fechar o sumiu e gravou `hideWaToast=1`.

## Diferenças em relação ao original
- O número do WhatsApp é um marcador (`5511999999999`); o original usa a linha do próprio eAgenda.
- Nada confirma a ativação: não há `status/` para consultar nem `reset/` para postar.
