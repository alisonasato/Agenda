# Conta › Administrar Contas — Behaviors

- **Filters:**
  - Everything is client-side, and there are no sub-accounts, so the table always shows the
    default empty state (the live page does too).
  - Each active filter adds a chip; its × clears only that filter.
  - **Limpar filtros** resets search, Filtros, and both tag groups.
  - The search chip appears as soon as you type. On the live page it appears after the debounced
    request.
- **Filtros:** the shared `FilterPopover` (draft/apply semantics), now controlled by the page and
  also used by Administrar Unidades.
- **Form:**
  - Nothing is saved.
  - The CEP button (or Enter) looks the CEP up on ViaCEP and fills street, neighbourhood, state and
    city, like the original.
  - Fewer than 8 digits shows "CEP deve ter 8 dígitos".
  - Success shows "Endereço preenchido automaticamente!" until the CEP is edited.
