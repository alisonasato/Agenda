# /users/convites-cadastro/cadastros — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.submissions`; a coluna "Convite" resolve `inviteId` em `data.invites`.
- A busca cobre nome e e-mail; as pílulas filtram por status; "Limpar filtros" zera as duas coisas.
- Só a linha `PENDING` é selecionável e só ela mostra os botões de aprovar e rejeitar — as demais
  já foram decididas. O "selecionar todos" marca apenas as pendentes visíveis.
- A barra em lote só aparece com alguma pendente escolhida, e o mesmo diálogo serve para uma linha
  ou várias: muda o título, o corpo e a contagem.
- Aprovar grava `APPROVED`; rejeitar grava `REJECTED` e guarda o motivo — mas só quando "Avisar a
  pessoa por e-mail" está marcado, que é a única situação em que o original leva o texto adiante.
- O "olhinho" mostra e-mail, convite, data e as respostas dos campos opcionais do convite, na ordem
  de `INVITE_FIELDS`, e o motivo quando a linha foi rejeitada.

## Verificação
No build estático: a semente traz três cadastros do convite "Base antiga — Agosto/2026", um por
status. Marcar a pendente acendeu "1 selecionado(s)"; aprovar pela própria linha abriu "Aprovar
cadastro? / O acesso de Daniela Rocha será criado…" e, ao confirmar, a linha virou "Aprovado". O
olhinho abriu com telefone, documento e data de nascimento preenchidos.

## Diferenças em relação ao original
- Aprovar não cria acesso nenhum: o clone não tem contas de cliente, então a decisão só muda o
  status da linha.
- Nenhum e-mail sai; "Avisar a pessoa por e-mail" apenas decide se o motivo fica guardado.
