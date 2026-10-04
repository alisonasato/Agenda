# /users/convites-cadastro/textos-de-email — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.inviteEmails`; "Momento" traduz `kind` por `INVITE_EMAIL_KINDS`.
- Trocar o momento troca a sugestão de assunto, mas só enquanto o assunto ainda É uma sugestão —
  qualquer texto escrito pelo usuário sobrevive à troca. O corpo nunca é trocado: muda só o
  `placeholder`, que não apaga nada. É a mesma regra que o script do original aplica, e pelo mesmo
  motivo (quem trocava o momento e salvava levava variável que não existe naquele momento).
- "Usar como padrão" vale por momento: ao salvar um texto como padrão, os outros do mesmo `kind`
  perdem a marca.
- Excluir um texto devolve ao padrão do sistema os convites que apontavam para ele
  (`templateId` volta a `""`), em vez de deixar a referência quebrada.
- O seletor "Texto do e-mail" do modal de convite lista só os textos de `kind === "INVITE"`, acima
  da opção fixa "Texto padrão do sistema".

## Verificação
No build estático: a semente traz "Boas-vindas" (padrão, Convite de cadastro) e "Aprovação com
orientações". Abrir "Novo texto" e trocar o momento para "Agendamento liberado" levou o assunto
para `{{nome_empresa}} - Seu agendamento está liberado` e o placeholder para "O atendimento é no
3º andar, sala 302."; depois de digitar "Assunto meu", voltar para "Convite de cadastro" manteve o
texto digitado. Salvar como padrão tirou a marca de "Boas-vindas".

## Diferenças em relação ao original
- As variáveis são chips informativos, como no original: não há botão para inserir no texto.
- Nenhum e-mail é montado; o texto fica só guardado.
