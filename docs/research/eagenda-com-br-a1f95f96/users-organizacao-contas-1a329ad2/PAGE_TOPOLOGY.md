# Conta › Administrar Contas — Page Topology

Source: `https://eagenda.com.br/users/organizacao/contas?version=3`, plus `/users/organizacao/contas/nova?version=3`
("Adicionar conta").
Routes: `/users/organizacao/contas` and `/users/organizacao/contas/nova`
Page key: `users-organizacao-contas-1a329ad2`

## List (`AccountsList.tsx`)
1. **KPIs:** Sub-contas, Usuários ativos, Total agendas, Próximos 30 dias (all 0).
2. **`#formFilter`** (`mt-6`):
   - search;
   - **Adicionar conta**;
   - Filtros (shared `FilterPopover`, 8 fields);
   - second row: tag groups Assinatura (Todos / Ativo / Expirado / Sem plano) and Atividade
     (Todos / Ativo 7d / Inativo 7d), then **Limpar filtros**.
3. **`#accounts-active-filters`:** a "Mostrando:" htaggroup of removable chips, in this order:
   Busca global, each Filtros field (labelled by the field's label), Assinatura, Atividade.
4. **Table** (10 slots): Conta, Usuários, Agendas, Próx. 30 dias (numeric), Assinatura, Contato,
   Ações. It is empty, so it shows the default empty state.

## Form (`AccountForm.tsx`)
- **Dados Gerais:** nome, sigla, e-mail, telefone.
- **Endereço:**
  - País / Estado / CEP with a search button / Município;
  - Logradouro, Número, Bairro, Complemento, Distrito, all in one grid.
- **Administrador da Conta:**
  - htabs: Selecionar Existente | Criar Novo;
  - the existing-user combobox uses a mock "contato@exemplo.com.br – Maria Souza";
  - the new-user fields are email, name, and password with Django's help `<ul>`.
- **SaveBar:** Voltar / Criar Conta.

## Verified measurements (live vs. clone), all identical
- **List, 1440:**
  - document 1013;
  - KPI group 1062×107.5;
  - form 1062×86;
  - tags 59.61/55.42/76.23/87.23/59.61/74.33/82.89;
  - table 1062×606 at y 329.5.
- **List with all 11 chips, 1440:**
  - chip group 1062×64.5;
  - every chip's width and position identical;
  - document 1093.
- **List, 390:** document 1293, form 342×218.5, quick filters 342×68.5.
- **Form, 1440:** document 1155, sections 234.5/447.5/189.
- **Form, 1440, "Criar Novo":** document 1371, last section 404.5.
- **Form, 390:** document 1752, sections 405.5/793.5/193.
