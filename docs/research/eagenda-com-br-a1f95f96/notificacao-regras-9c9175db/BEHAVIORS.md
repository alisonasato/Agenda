# Comunicação › Regras de Notificação — Behaviors

## Hidden fields stay mounted (x-show)
The original toggles every conditional block of the rule form with Alpine `x-show`, i.e.
`display:none`, never removing it. That is visible in the layout: inside a `space-y-4`
block a hidden sibling keeps the `space-y` bottom margin on the field before it. With
"Aplicar a todas as agendas" on, the Agendas block is 90.5px on the live site; unmounting
the picker made it 78px. The clone therefore renders every conditional block and sets
`display:none` (`shown()` helper), matching all the states in PAGE_TOPOLOGY.

## Popovers in a scrolling modal
This is the first modal whose body scrolls (914px of content in 648px), which is what the
portal (`shared/FloatingPanel`) exists for: combobox and chip-select panels live on
`<body>` with fixed positioning, follow the field while the body scrolls, and are never
clipped by the modal.

They also **open upwards** when there is not enough room below and more room above — the
original's `checkDropPosition`. When flipped, the panel sits 4px above the whole field
(label included), not above the control: with the body scrolled to the bottom, the
"Filtro de Status" panel gets `bottom: 227.5px` on the live site and 228px on the clone
(the half pixel is the scroll offset).

## Channel-specific fields
- **SMS** — prefilled with `{{nome}}, seu agendamento foi confirmado!{{agenda}}, dia {{dia}}, {{hora}}`;
  `maxlength=160`, counter updates as you type.
- **Email** — "Modelo do email" has no options on the live account; "Gerenciar modelos de
  email" opens the templates page in a new tab.
- **WhatsApp** — two templates. Picking one shows "Preview do Template"; the original
  fetches it from `/whatsapp_template_text/`, the clone embeds the two texts it returns.
- **Vincular Formulário de Pesquisa** — shown for Email and SMS.

## Envio
"Envio imediato" hides the whole "Quando enviar" block. The Filtro de Status options switch
with Antes/Após (Confirmados / Aguardando Confirmação vs. Realizado / Confirmado ou
Atendido / Não-Realizado); neither filter is clearable. Day/hour/minute steppers clamp to
their ranges.

## Comunicação shortcuts
From 1536px (`2xl`) the four Comunicação pages sit inline in the action bar; below that
they fold into the "Comunicação" menu (240px, right-aligned). "Pacotes de Envio" is always
inline. The links point at the routes that will hold those pages once cloned.

## Search
Typing updates the URL (`?search=`) on the live site and marks the field `has-query`, but
with no rules at all the table keeps the default empty state. The clone does the same
without touching the URL.

## Not cloned
The delete confirmation (`rule-delete-dialog`) — reachable only from a rule row.
