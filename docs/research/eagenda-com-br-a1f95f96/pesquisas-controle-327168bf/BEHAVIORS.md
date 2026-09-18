# Formulários — Behaviors

## Novo Formulário
Clicking the button opens `survey-form-modal`; the original then fetches the body over
htmx (`/pesquisas/modal/criar/`). The clone renders the same fields directly. The modal
closes on **Cancelar**, the close button, Escape, or a click on the backdrop.
**Salvar** submits nothing (no backend in the prototype).

## Popovers inside the modal
The original teleports every field popover to `<body>` and sizes it to the field's outer
box, so the modal's scrolling body never clips it. The clone keeps popovers in place and
instead lifts the clipping while one is open:
`.hmodal-panel:has(.hselect-popover) { overflow: visible }` (and the same for
`.hmodal-body`). Without it the popover is cut off and a scrollbar appears, shrinking every
field by 10px. Ceiling: a modal whose body actually needs to scroll would spill while a
popover is open — switch those popovers to a portal when such a modal shows up.

Two positioning corrections that also apply to the other pages using these widgets:
- combobox panels take the field's width (`width: 100%`) instead of their longest option —
  the Tipo labels are long enough to make that visible (618px before, 464px now);
- the chip multi-select panel lines up with the field's outer border (1px left and down).

## Combobox flavour
The form modal uses the original's second combobox flavour: the trigger is a plain box
(placeholder or chosen label), the search input lives at the top of the popover, there is
no clear button, and the chosen option carries `is-selected`. `Combobox` gained
`searchInPopover` for it; the Novo Agendamento page keeps the in-field search flavour.

## Vincular às Agendas
The live account's picker has an empty option list, so opening it shows "Nenhuma opção
disponível" and "0 selecionados". Kept as-is rather than inventing the agenda.

## Data Limite para Responder
Rendered by the original but shown only when Tipo is empty (`x-show="surveyStage === ''"`),
which cannot happen because the Tipo combobox is not clearable. Not cloned.
