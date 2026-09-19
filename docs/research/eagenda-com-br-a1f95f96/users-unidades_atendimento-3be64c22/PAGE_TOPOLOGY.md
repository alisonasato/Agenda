# Conta › Administrar Unidades — Page Topology

Source: `https://eagenda.com.br/users/unidades_atendimento/?version=3`
Route: `/users/unidades_atendimento`. With `?action=create`, the same URL serves the "Nova Unidade"
form, as in the original.
Page key: `users-unidades_atendimento-3be64c22`

## List (`UnitsList.tsx`)
1. **`#formFilter`:**
   - search ("Buscar por nome, slug, email, telefone ou whatsapp");
   - **Nova Unidade** link (to `?action=create`);
   - an action bar with one **Filtros** popover (hFilterPopover), which holds 7 text fields in 2
     columns: nome, slug, email, telefone, WhatsApp, cidade, estado.
2. `#unidades-active-filters` (always empty on the live page).
3. **KPIs** (`hkpi-group`): Unidades / Agendas vinculadas / Com contato, all 0.
4. **Table** (rows 3.5rem, 10 slots): Unidade, Endereço, Contato, Agendas, Ações. The account has
   no units, so it shows the default empty state.

## Form (`UnitForm.tsx`, `cfg-form`)
- **Dados Básicos:** nome, slug (sanitised while typing), e-mail, telefone, WhatsApp. Neither
  phone field has a mask.
- **Imagem:** file picker.
- **Texto da Tela da Unidade:** CKEditor with a word counter.
- **Agendas Vinculadas:** `hms` with no options, as on the account.
- **Endereço:** País/Estado, CEP (shared `CepField`), Município, then Logradouro, Número, Bairro,
  Complemento, Distrito.
- **SaveBar:** Voltar / Criar Unidade.

## Verified measurements (live vs. clone), all identical

| | 1440 | 390 |
|---|---|---|
| list container / document | 1142×847.5 / 957 | 390×1019 / 1152 |
| search / button / action bar | 288×36 / 137.86×32 / 114.61×38 | 358×36 / 137.86×36 / 114.61×38 |
| KPI group / table | 1062×107.5 / 1062×606 | 358×231 / 358×606 |
| Filtros popover | 402×373 at (1030, 137) | — |
| form / document | 1062×1583.92 / 1757, sections 312/107.5/460.92/133.5/443 | 342×2178.9 / 2376, sections 505/107.5/460.9/137.5/789 |
