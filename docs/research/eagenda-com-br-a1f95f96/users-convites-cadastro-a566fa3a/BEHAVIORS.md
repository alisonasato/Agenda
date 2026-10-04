# /users/convites-cadastro — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.invites`. "Destinatários" conta `emails`; "Cadastros" conta as linhas de
  `data.submissions` que apontam para o convite; "Aprovação" lê `autoApprove`.
- A busca filtra só pelo nome do convite (como o placeholder do original diz), sem acento e sem
  caixa, via `fold()`.
- As pílulas de status filtram por `status`; "Limpar filtros" zera busca e status juntos.
- "Convidar clientes" e a lápis abrem o mesmo modal; salvar exige o nome. A lista de e-mails é
  quebrada por linha, vírgula ou ponto-e-vírgula, e os vazios caem fora.
- "Obrigatório" só vale enquanto o campo continua pedido: ao salvar, `requiredFields` é filtrado
  por `fields`, e o checkbox fica desabilitado enquanto o campo não está marcado.
- Convite novo nasce `DRAFT` com a data de hoje; editar preserva status e data.
- A lixeira abre "Excluir convite?" e, ao confirmar, apaga o convite E os cadastros recebidos por
  ele — é o que o texto do próprio diálogo promete.

## Verificação
No build estático: a tela abre com os dois convites da semente ("Base antiga — Agosto/2026" com
3 destinatários e 3 cadastros, "Convênio Vida Plena" com 2 e 0). Criar "Teste Seiri" com três
e-mails, "Documento de identificação" marcado e aprovação automática gravou a linha
`3 · 0 · Automática · Rascunho` com a data de hoje.

## Diferenças em relação ao original
- "Modelo da planilha" é um botão inerte: o original baixa um `.xlsx` que só o servidor monta.
- A planilha escolhida no modal não é lida; só a lista de e-mails colada entra no convite.
- Nada é enviado: o status nunca sai de `DRAFT` sozinho, porque não há disparo de e-mail.
