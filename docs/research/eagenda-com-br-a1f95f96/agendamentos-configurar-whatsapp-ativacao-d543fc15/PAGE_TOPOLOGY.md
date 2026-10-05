# Ativar WhatsApp — Page Topology

Source: `https://eagenda.com.br/agendamentos/configurar/whatsapp-ativacao/?version=3`
Route: `/agendamentos/configurar/whatsapp-ativacao` (title "Ativar WhatsApp")
Page key: `agendamentos-configurar-whatsapp-ativacao-d543fc15`

## Shell
`DashboardShell` on Minha Agenda › Configuração. The entry point is a floating toast on
Configuração de Agendas ("Acompanhe suas agendas pelo WhatsApp / Clique aqui para ativar"), which
the clone did not have either and which this page adds.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10` (no `min-w-0` here).

## Layout
One `@container` holding `grid-cols-1 @3xl:grid-cols-[minmax(0,1fr)_18rem] gap-6 items-stretch`:
the activation card on the left, "Como funciona" on the right.

## Sections
1. **Conecte seu WhatsApp** (`hsection hui-card hui-card--flush`). While the code is valid, an inner
   `@container` splits into `@min-[38rem]:grid-cols-[auto_minmax(0,1fr)]`:
   - the QR in a `rounded-2xl bg-[color:var(--color-surface-secondary,#ecf0f4)] p-4` box, the image
     itself `w-40 h-40 @3xl:w-48 @3xl:h-48 @5xl:w-56 @5xl:h-56 rounded-xl bg-white p-2`;
   - an `hcopyfield--iconbtn hcopyfield--mono hcopyfield--wrap` headed "Ou envie exatamente este
     texto", whose value is `Código de ativação:<token>`;
   - "O código expira em **mm:ss**" with a `ClockSolidIcon`, counting down from 600 s;
   - "Abrir WhatsApp" (`hbtn--primary`, `ChatBubbleIcon`, a `wa.me` link carrying the same text) and
     "Gerar novo código" (`hbtn--secondary`, `RefreshIcon`).
2. **Expired state** (replaces the block above once the countdown hits zero): an `halert--danger`
   reading "Código expirado / O código de verificação não é mais válido. Gere um novo para
   continuar." with its own "Gerar novo código".
3. **`#activation-status`**, under a `mt-6 pt-5 border-t`: a spinner beside "Aguardando o envio da
   mensagem…" and a "Já enviei o código" button. The original polls
   `/agendamentos/configurar/whatsapp-ativacao/status/` every 15 s and on that button.
4. **Como funciona**: an `hstepper hstepper--lg hstepper--vertical` with
   `--stepper-gap: 2.5rem` and three inactive steps — Escaneie o QR Code · Envie a mensagem ·
   Pronto.

## Deviation
The original's number is eAgenda's own WhatsApp line. The clone has none, so the link points at the
placeholder `5511999999999`, and the seeded token is invented rather than the live account's.
