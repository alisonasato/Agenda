# /agendamentos/detalhes/&lt;id&gt;?version=3 — Page Topology

Source: requires login; captured 26/09/2026 pelos links de Identificador, Status e Quando da lista
de agendamentos. Além do `dashboard.css`, a página traz um `<style>` próprio com as regras `.appt-*`,
copiado para `inline-styles.css` e concatenado no bundle pelo `scripts/build-css-eagenda.sh`.

## Rota
Mesmo caso das outras telas com id no caminho: aqui é `/agendamentos/detalhes/?id=<agendamento>`.

## Topbar
No lugar do título da página: nome do cliente (`h1.truncate…nunito-bold`), o status em chip
(`CONFIRMADO`) e o identificador em chip `hchip--default hchip--soft` (`.appt-topbar-key`).

## Layout
```
DashboardShell (header próprio; "Agendamentos" ativo na sidebar)
└ div.mx-auto.w-full.max-w-[1550px].px-6.py-8
  ├ div.appt-head
  │   ├ .appt-head-meta   ícone · "Ter, 22/09/2026" · · · "09:00 – 09:30" · filete · chip agenda · chip serviço
  │   └ .appt-head-actions
  │       ├ .appt-head-status   botões de decisão (somem quando o status é final)
  │       └ .hactionbar         WhatsApp · E-mail · Recibo | Agendamentos · Calendário
  ├ div.appt-grid   (1 coluna; 2 a partir de 768; 3 a partir de 1280)
  │   Cliente · Atendimento · Cobrança · Acompanhantes · Comentário · Detalhes
  │   cada um em .hsection.appt-card.hui-card.hui-card--flush
  └ div.mt-10   "Histórico" + abas Notificações / Alterações + a tabela da aba
```

Cards:
- **Cliente**: avatar `havatar--lg`, nome, data de nascimento, e `dl` com Telefone · Documento ·
  E-mail (este em `col-span-2`), e o rodapé `.appt-card-foot` com "Ver cadastro".
- **Atendimento**: botão "Configurar link" e "O cliente ainda não recebeu um link para entrar."
- **Cobrança**: "Nenhuma cobrança para este agendamento."
- **Acompanhantes**: "Nenhum acompanhante neste agendamento."
- **Comentário**: ação "Editar" no cabeçalho; sem comentário mostra "Nenhum comentário registrado
  para este agendamento."
- **Detalhes**: Responsável · Agenda · Criado em · Última alteração.

Tabelas do histórico (`--htable-row-h: 3.25rem`, 2 linhas fixas):
- **Notificações**: Canal · Mensagem · Destino · Data · Situação. Vazia: "Nada por aqui ainda /
  Assim que houver registros, eles aparecerão nesta tabela."
- **Alterações**: Data / Hora · Usuário · Alteração. Vazia: "Nenhuma alteração registrada / As
  mudanças de status deste agendamento aparecerão aqui."

## Interaction model
| Seção | Modelo |
|---|---|
| Botões de decisão | cada um abre a confirmação do original antes de mudar o status |
| Histórico | duas abas `htabs`, troca client-side |
| Comentário / Recibo | abrem os modais já clonados no calendário |
