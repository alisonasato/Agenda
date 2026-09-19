# Sidebar (updated 2026-09-19 to eAgenda's new menu)

## Two modes
- **Simplified menu** is the default. **"Mostrar todas as opções"** switches to the full menu and
  back. The choice is kept in the original's cookie `eag_sidebar_full=1`.
  - The original reads that cookie on the server and reloads the page.
  - The clone reads it on the client (`useSyncExternalStore`) and switches in place. A browser set
    to the full menu briefly paints the simplified one first.

## What the simplified menu changes
- **Minha Agenda** (formerly "Gestão de Agendas") hides Limites, Listas de Bloqueio and Confirmar.
- **Clientes** is a plain link. It turns back into a group when the current page is Acesso de
  Clientes.
- **Formulários** is hidden, unless it is the current page.
- **Comunicação** is hidden (still searchable). A top-level **Regras de Notificação** link lights
  up for every Comunicação page.
- **Integrações** moves into **Conta**. The top-level link stays hidden even on its own page.
- **Conta:**
  - "Dados da Conta" is renamed **Configurações Gerais**;
  - "Administrar Equipe" is renamed **Convidar equipe**;
  - Administrar Agendas, Unidades and Contas are hidden unless current.
- **Ajuda** hides YouTube and Desenvolvimento.

## Search-only items
These are never shown in the menu but are found by the page search: Serviços, Tags, Lista de
Espera, Importar Clientes, Planos, and the 10 integration pages.

## Page search
- Multi-term AND match, accent-insensitive.
- Ranking: the label starts with the query, then the label contains every term, then a
  group/keyword match; ties keep menu order.
- The first result is pre-selected. ↑/↓ move the selection and Enter opens it.
- Rows are `.sidebar-search-result`, with the group shown in `.sidebar-search-group`.

## Sub-list markers
- `.snav-indicator` is a bar that slides to the hovered sub-item and rests on the current one.
- `.snav-tree.is-on` is an "L" line from the top of the list to the current item. Its height is
  the current item's `offsetTop + offsetHeight / 2 + 1`.

## Verification
Checked against the live menu:
- Unidades page in both modes: every row, the indicator and the tree line are identical.
- 8 pages (Integrações, Clientes, Acesso, Formulários, Regras status, Limites, Relatório clientes,
  Configurações Gerais): the same visible rows and highlights.
- Search results for 9 queries across both modes are the same.
