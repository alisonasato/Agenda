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

## Data (fase de lógica)
- As unidades vivem em `data.units`. **Nova Unidade** grava nome, link, contatos, descrição e
  endereço; o lápis reabre o mesmo formulário com `?id=` e a lixeira pede confirmação.
- **Agendas Vinculadas** escreve do outro lado: cada agenda guarda a unidade dela em
  `Agenda.unitId`, e tirar a agenda da unidade (ou apagar a unidade) deixa a agenda sem unidade.
- Os três KPIs contam as linhas que sobraram do filtro: unidades, agendas vinculadas e unidades com
  algum contato.
- A busca cobre nome, slug, email, telefone e whatsapp; o popover de filtros casa campo a campo.

## Verificação
No build estático: criar "Unidade Norte" com e-mail e a Agenda Principal põe a linha com o contato
e o chip da agenda, e os KPIs passam a 1 / 1 / 1; o lápis abre `?id=un1` com nome, e-mail e o chip
da agenda carregados, e o título vira "Editar Unidade".

## Diferenças em relação ao original
- A imagem da tela da unidade é escolhida mas não é guardada: o clone não tem onde pôr arquivos.
- O original edita por `/users/unidades_atendimento/<id>`; como o clone é estático, a mesma página
  carrega a unidade por `?id=`.
