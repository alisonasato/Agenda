# Comunicação › Modelos de WhatsApp — Behaviors

- The search box works like the other listings (has-query plus the clear button). There are no
  templates, so it filters nothing.
- **Novo Modelo** opens the modal, which the original loads over htmx.
  - The form is `novalidate`, because the original validates on the server.
  - The clone's Salvar does nothing; the prototype has no backend.
- **Not cloned:** the delete dialog ("Excluir modelo de WhatsApp?"). It is only reachable
  from a template row.
