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

## Data (fase de lógica)
- Os formulários vivem em `data.surveys`. **Novo Formulário** grava nome, descrição, tipo, agendas
  vinculadas, data limite, login obrigatório e o modelo importado; o lápis reabre o modal e a
  lixeira pede confirmação.
- Como no original, o modal troca dois campos pelo tipo escolhido: com um tipo, aparece **Vincular
  às Agendas**; sem tipo, aparece **Data Limite para Responder**. Esse campo faltava no clone e foi
  acrescentado.
- O seletor de agendas passa a oferecer as agendas da conta.
- A tabela mostra o formulário com a descrição embaixo, o tipo em chip (só a primeira parte do
  rótulo, como o original), as agendas, perguntas, respostas e a validade ("Sem prazo" quando não
  há data).

## Verificação
No build estático: criar "Pesquisa de Satisfação" põe a linha com o chip Agendamento, agendas "—",
0 perguntas, 0 respostas e "Sem prazo".

## Diferenças em relação ao original
- O editor de perguntas não foi clonado: importar o modelo padronizado conta as perguntas dele, e
  criar do zero começa em zero, mas não há como editá-las.
- As respostas ficam em zero, porque o clone não tem a página pública onde o formulário seria
  respondido; por isso "Exportar CSV" também não existe aqui.
