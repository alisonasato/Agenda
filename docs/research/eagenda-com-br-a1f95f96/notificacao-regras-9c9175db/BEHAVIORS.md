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

## Data (fase de lógica)
- As regras vivem em `data.notificationRules`, semeadas com as duas que a conta de origem tem:
  "Confirmação Por E-Mail" (imediata) e "Lembrete 24h Por E-Mail" (1 dia antes, só confirmados).
- **Nova Regra** e o lápis de cada linha abrem o mesmo modal, com o título trocando entre
  "Nova Regra de Notificação" e "Editar Regra de Notificação"; editar abre com tudo preenchido,
  inclusive a forma de envio, o template, o envio imediato, o deslocamento e o filtro de status.
- O seletor de agendas oferece as agendas da conta; marcar **Aplicar a todas as agendas** grava a
  regra sem agenda nenhuma, que é o que a coluna mostra como "Todas".
- A coluna **Envio** escreve "Imediato" no chip accent, ou o deslocamento por extenso
  ("1 dia, Antes do Horário Agendado"). A coluna **Canal** usa o chip warning com SMS, Email ou
  WhatsApp, e **Template** mostra o modelo de WhatsApp quando é esse o canal.
- A busca filtra pelo nome da regra; a lixeira pede confirmação antes de apagar.

## Verificação
No build estático: a tabela abre com as duas regras semeadas, iguais às do original; editar
"Lembrete 24h Por E-Mail" traz 1 dia, "Antes do horário" e "Agendamentos Confirmados", e renomear
reescreve a linha; criar uma regra de WhatsApp com o modelo
"Lembrete com Campo Observações" preenche as colunas Canal e Template; buscar "whats" deixa só ela;
excluir devolve a tabela ao estado vazio com "Nada por aqui ainda".

## Diferenças em relação ao original
- Os cartões de crédito (Créditos Gerais, SMS, Email, WhatsApp) continuam zerados e os botões
  Comprar/Extrato ainda não levam a lugar nenhum: o clone não tem faturamento.
- Os modelos de email e os formulários de pesquisa ficam vazios porque nenhum é cadastrado neste
  clone; o original mostra o mesmo quando a conta também não tem.
- A regra ainda não dispara envio: quem registra isso é Acompanhamento, que segue só como tela.
