# Conta › Administrar Unidades — Behaviors

- **Filtros** (hFilterPopover):
  - The fields edit a draft; **Aplicar** or Enter commits it.
  - Closing any other way reverts the draft to the last applied values.
  - **Limpar** commits an empty filter and leaves the popover open.
  - The count badge and `is-active` state follow the applied values.
  - Placement: 6px under the trigger, clamped 8px inside the viewport.
  - There is no data to filter, so the table keeps its default empty state, as on the live page.
- **Nova Unidade form:**
  - Nothing is saved.
  - Any edit marks the form dirty, which brings up the SaveBar toast.
  - The CEP lookup on blur uses ViaCEP through the shared `CepField`, now also used by Tela de
    Agendamento. It fills street, neighbourhood and complement, and sets state and city by name.
  - Word counter: enabled with `RichTextEditor wordCount`. The labels are Portuguese ("Palavras",
    "Caracteres"), so they are wider than the original's English ones.
  - The slug hint uses the mock `seiri.com.br/minhaempresa/...` instead of the real account link.
