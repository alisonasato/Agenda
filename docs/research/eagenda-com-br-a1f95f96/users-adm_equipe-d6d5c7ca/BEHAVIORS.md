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
