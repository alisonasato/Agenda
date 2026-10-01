# Conta › Administrar Equipe — Behaviors

## Filters
- Everything is client-side over the one mock row.
- The owner only shows under Todos/Ativo, with a search matching their name or email, and
  with no tag, service, group or access-profile filter.
- An emptied table shows the **default** empty state, as the live page does ("Nada por aqui
  ainda", checked with Inativo).
- **Limpar filtros** resets everything and remounts the action bar (so open popovers close).
- The **Filtros** menu stays open while you use its nested field popovers (useDismiss ignore
  `.hselect-popover`).

## Modals
- **Nothing is saved.**
- **Password field:** the eye toggles reveal (text ↔ password).
- **Permissões Adicionais** uses the new shared `AutocompleteMulti` (.hautocomplete).
  - It has chips in the field and a teleported panel: search, checkbox options,
    "N selecionados · Concluir".
  - The options are the original's `/autocomplete/member_permissions` list, duplicates
    included.
  - Tags and services are empty, as on the account.
- **Address (edit):**
  - País / Estado / Município use the shared `useGeoCascade`, extracted here from Tela de
    Agendamento, which now uses it too.
  - The CEP button calls ViaCEP. The original fills only the location fields, because its
    street/neighbourhood lookup targets element ids that don't exist. The clone also fills
    Logradouro and Bairro.

## Not cloned
- "Redefinir Senha" and the activate/deactivate dialog: not reachable from the owner row.
- Grupos de Usuários and the activity log are `#` links, because those pages aren't cloned yet.

## Data (fase de lógica)
- A equipe vive em `data.members`, semeada com a proprietária e um colaborador.
- Os dois modais (novo e editar) gravam pelo mesmo rascunho: perfil, permissões, tags, serviços e
  agendas. Marcar "Permitir acesso à todas as agendas" grava o membro sem agenda nenhuma, que é o
  que a coluna Vínculos mostra como "Todas".
- Vínculos conta agendas, serviços e tags do membro; Status sai de `active`.
- A busca cobre nome e e-mail; as tags Todos/Ativo/Inativo e os filtros de tags, serviços, perfil e
  agendas filtram as linhas.
- A lixeira só aparece para quem não é proprietário, e pede confirmação.

## Verificação
No build estático: a tabela abre com Maria Souza (Proprietário da Conta, Todas agendas) e
João Pedro (Colaborador, 1 agendas, 2 serviços), com os contatos e o último login de cada um.

## Diferenças em relação ao original
- No plano da conta de origem o botão Novo Usuário abre só "Limite de Usuários Atingido"; o clone
  mantém o formulário completo, que é o que o original mostra num plano que permite usuários.
- Sub-Conta mostra sempre a conta única do clone, que não tem subcontas.
- O "Histórico de Atividades" de cada linha não foi clonado, então a ação saiu da linha.
