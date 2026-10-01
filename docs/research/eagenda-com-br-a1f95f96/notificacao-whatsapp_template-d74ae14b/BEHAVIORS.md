# Comunicação › Modelos de WhatsApp — Behaviors

- The search box works like the other listings (has-query plus the clear button). There are no
  templates, so it filters nothing.
- **Novo Modelo** opens the modal, which the original loads over htmx.
  - The form is `novalidate`, because the original validates on the server.
  - The clone's Salvar does nothing; the prototype has no backend.
- **Not cloned:** the delete dialog ("Excluir modelo de WhatsApp?"). It is only reachable
  from a template row.

## Data (fase de lógica)
- Os modelos vivem em `data.whatsappTemplates`. **Novo Modelo** grava nome, tipo e mensagem; o
  lápis reabre o mesmo modal preenchido e a lixeira pede confirmação.
- **Usado em** conta as regras de notificação que apontam para o modelo, e o seletor de template
  da regra passa a oferecer estes modelos junto com os do próprio sistema.
- A busca cobre o nome e o conteúdo.

## Verificação
No build estático: criar "Follow-up Seiri" põe a linha com o tipo em chip, o texto e "0 regra(s)".

## Diferenças em relação ao original
- O original grava pelo servidor e aprova o modelo junto ao WhatsApp; aqui ele vale assim que é
  salvo.
