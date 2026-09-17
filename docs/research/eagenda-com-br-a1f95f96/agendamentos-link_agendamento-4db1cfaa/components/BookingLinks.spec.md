# BookingLinks Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/agendamentos-link_agendamento-4db1cfaa/BookingLinks.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** click-driven (link actions, generator, accordion) + form (slug)

## DOM Structure
#link-agendamento-page > grid with two `.hui-card`s (Link Principal, Gerador Personalizado),
then `.mt-8` with `.hwidget-head`, the "Todas as Agendas" card and `#agendasAccordion`
(one `<details>` per agenda holding the `.hslug-field` form).

## Computed Styles
From `src/app/eagenda.css`. Measured at 1440×900: page 1152×558; grid 1072×238; each card 526×238;
`.hlinkfield` 494×46; `.hms` 494×62 (field 36 tall); generated input 394×36; widget head 1072×44;
accordion row 1072×66; hms popover 492×135; doc height 900.

## States & Behaviors
Selecting agendas fills chips and the footer counter; "Gerar" writes the URL and enables
Copiar/WhatsApp; saving a slug removes the "Sem identificador" chip. Popover closes on outside
click or Esc.

## Text Content (verbatim)
Link Principal · Página inicial de agendamento · Link geral da sua página de agendamentos. Ideal
para bio, redes sociais e atendimento rápido. · Gerador Personalizado · Crie links segmentados por
agenda · Selecionar agendas · Selecione uma ou mais agendas · Link será gerado aqui · Gerar ·
Copiar · WhatsApp · Links por agenda · Compartilhe links diretos por agenda e por serviço. ·
Todas as Agendas · Link para todas as agendas ativas da organização. · Sem identificador ·
Defina um identificador para gerar o link amigável desta agenda. · Identificador da Agenda ·
Use apenas letras minúsculas, números, hífens (-) e underlines (_). Espaços viram hífens. · Salvar

## Responsive Behavior
Two columns at lg+, one below; the "Todas as Agendas" card stacks and the action buttons wrap.
