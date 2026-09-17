# ClientsList Specification

## Overview
- **Target file:** `src/components/sites/eagenda-com-br-a1f95f96/clientes-listar-43c58313/ClientsList.tsx`
- **Screenshot:** not saved (the browser pane cannot write files); reference is the live page — see ../BEHAVIORS.md
- **Interaction model:** input-driven (search) + click-driven (filter dialog)

## DOM Structure
form#formFilter > label#client-search.hui-search + right group (Adicionar Cliente · Importar ·
.hactionbar with .hfilterpop, separators, Consolidar, Exportar); then #clients-table > .htable with
thead (Nome · Email · Telefone · Gênero · Ações), 10 `.htable-row--empty` rows and `.htable-empty` over them.

## Computed Styles
From `src/app/eagenda.css` (dashboard.css filtered by `scripts/extract-css-eagenda.mjs`).
Measured at 1440×900: form 328,96 1072×38; search 288×36; action bar 349×38; table 1072×606;
empty overlay 1064×560 with a 414×130 message; filter dialog 402×305.

## States & Behaviors
Search and applied filters switch the empty state between the "cadastrado" and "encontrado" copies.
The filter dialog edits a draft and only commits on "Aplicar"; "Limpar" empties the draft.
Outside click or Esc closes it. The trigger shows the number of active filters.

## Text Content (verbatim)
Buscar por nome, CPF, email, telefone ou empresa · Adicionar Cliente · Importar · Filtros ·
Consolidar · Exportar · Filtrar clientes · Nome · CPF/CNPJ · Email · Telefone · Empresa ·
Documento da Empresa · Limpar · Aplicar · Nome/Email/Telefone/Gênero/Ações ·
Nenhum cliente cadastrado · Os clientes cadastrados ou importados aparecerão nesta lista.

## Responsive Behavior
Search takes the full width below md and the buttons wrap under it; the table scrolls horizontally.
