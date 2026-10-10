# /agendamentos/novo_agendamento/ — Behaviors

## Data (fase de lógica)
- Agenda, Serviço, Tags e Clientes vêm dos dados do navegador (docs/DATA-LAYER.md). O Serviço só
  aparece quando a agenda escolhida tem serviços, como no original.
- "Salvar Agendamento" cria um agendamento por cliente selecionado e abre a lista de Agendamentos.

## Scroll sweep
- Ordinary page scroll (doc height 1100 at 1440×900); topbar sticky; no scroll-driven effects.
- Sections fade in with the shared `.hui-*` entrance animation only.

## Click sweep
- **Agenda:** search field ("Escolha a agenda") → popover listing the account's agendas.
- **Ação:** Novo Agendamento (default) · Incluir na lista de espera · Encaixar no horário.
- **Status do Agendamento:** Confirmado (default) · Aguardando Confirmação · Aguardando Pagamento.
- **Dia:** disabled with "Selecione a agenda primeiro" until an agenda is chosen.
- **Horário:** disabled with "Selecione o dia primeiro" until a day is chosen.
- **Tags / Clientes / Acompanhantes / Membros da Equipe:** multi-select, chips in the field,
  popover with search, empty state "Nenhum resultado encontrado", footer with "Concluir".
- **Adicionar cliente / acompanhante:** ghost buttons in accent colour. Capturados no original em
  10/10/2026 (script da página, `data-nap-person`): os dois abrem o mesmo modal "Adicionar Cliente"
  (painel 3xl, 768×794) que Clientes → Listar, com os mesmos campos e rodapé Cancelar / Salvar
  Cliente; o título é "Adicionar Cliente" também no acompanhante. Só muda o campo de destino
  (`target_field` = `main_persons` ou `person`). Salvar posta em `create_person_htmx`:
  - cadastro novo: a pessoa entra como chip no campo de destino e o modal fecha;
  - já existe (mesmo e-mail ou telefone): nada é criado, a pessoa existente é selecionada no campo e o
    modal **fica aberto** com o alerta "Cliente já cadastrado — Este cliente já existe no sistema (mesmo
    e-mail ou telefone) e foi selecionado no agendamento. Nenhum cadastro novo foi criado.";
  - erro: alerta "Não foi possível salvar" com a mensagem.
  O clone reaproveita o `ClientForm` de Clientes (prop `onPick`); lá o duplicado é por e-mail ou
  documento e bloqueia o cadastro.
- **Checkboxes:** e-mail and "Incluir nas suas regras" checked; SMS disabled with the note
  "O envio automático de SMS está desabilitado no seu plano."
- **Salvar Agendamento:** posts on the live site; the clone only acknowledges on screen.

## Hover states
- Comboboxes/fields: `.hcombobox-control` and `.hautocomplete-field` change shadow/border on hover and focus.
- Options highlight on hover; the clear "×" only appears once something is selected.

## Per-state content
- The save bar toast is `display: none` until the form changes, then shows
  "Agendamento ainda não registrado / Conclua para criar o agendamento."

## Responsive sweep
- **1440 / 768:** two-column grid inside each section; full-width fields for Agenda and Tags.
- **<768:** single column (grid-template-columns 298px at 390), save bar stacks under the form,
  no horizontal scroll.
