# Textos do convite — Page Topology

Source: `https://eagenda.com.br/users/convites-cadastro/textos-de-email/?version=3`
Route: `/users/convites-cadastro/textos-de-email` (title "Textos do convite")
Page key: `users-convites-cadastro-textos-de-email-1f34dfa2`

## Shell
`DashboardShell` on Clientes › Convites de Cadastro (the page has no sidebar entry of its own; it
is reached from the invites action bar and from the invite modal's "Gerenciar textos").

## Sections
1. **Header row:** "Novo texto" (`hbtn--primary hbtn--sm`) and an `hactionbar` with "Convites".
2. **`hwidget-head`:** "Textos disponíveis" over "O texto marcado como padrão vem pré-selecionado
   ao criar um convite; no convite dá para escolher outro."
3. **Table:** an `htable` in `data-htable-mode="fixed"` with 6 slots and `--htable-row-h: 3.5rem`.
   Columns: Nome · Momento · Assunto · Padrão · Ações (`--end`). Empty: "Nenhum texto criado ainda
   / Sem um texto próprio, os convites saem com a mensagem padrão do sistema."
4. **`email-template-modal`** (xl), three `hformsection`s:
   - *Identificação:* "Momento" (`hselect`: Convite de cadastro `INVITE`, Pré-cadastro recebido
     `PRE_REGISTRATION`, Cadastro aprovado `APPROVED`, Agendamento liberado `BOOKING_RELEASED`),
     Nome do texto (required) and "Usar como padrão".
   - *Mensagem:* Assunto (required) and "Mensagem extra" (textarea, 12 rows) under the note that
     the text is ADDED to the system message, never replacing it.
   - *Variáveis disponíveis:* one `hchip` row per moment, each chip carrying its `title`.
5. **`#email-template-defaults`:** a JSON block with the suggested subject and the body placeholder
   of each moment, which the page's own script applies when the moment changes.

## Suggested texts
| Momento | Assunto | Placeholder do corpo |
| --- | --- | --- |
| `INVITE` | `{{nome_empresa}} te convidou para se cadastrar` | Qualquer dúvida, fale com a nossa recepção pelo telefone (00) 0000-0000. |
| `PRE_REGISTRATION` | `{{nome_empresa}} - Recebemos seu cadastro` | Costumamos responder em até 2 dias úteis. |
| `APPROVED` | `{{nome_empresa}} - Cadastro aprovado` | Na primeira visita, traga um documento com foto. |
| `BOOKING_RELEASED` | `{{nome_empresa}} - Seu agendamento está liberado` | O atendimento é no 3º andar, sala 302. |
