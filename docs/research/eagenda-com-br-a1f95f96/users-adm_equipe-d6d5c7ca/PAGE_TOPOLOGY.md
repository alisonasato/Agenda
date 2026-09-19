# Conta › Administrar Equipe — Page Topology

Source: `https://eagenda.com.br/users/adm_equipe/?version=3`
Route: `/users/adm_equipe`
Page key: `users-adm_equipe-d6d5c7ca`

In the live site's new sidebar this page is linked as "Convidar equipe".

## Sections
1. **`#formFilter`:**
   - search ("Buscar por nome ou e-mail");
   - **Novo Usuário** button;
   - an action bar with Tags / Serviços / Grupos (server-searched filters, so the search box
     always shows);
   - a **Filtros** menu with Perfil de Acesso, Agendas and Conta;
   - a separator, then a Grupos de Usuários link.
   - Second row: status tags (Todos / **Ativo** / Inativo) and Limpar filtros.
2. **Table** (`htable`, rows 4rem, 10 slots): Sub-Conta, Membro (avatar), Contato (last login),
   Perfil, Vínculos (agendas / serviços / tags chips), Status, Ações (edit, activity log).
   - Only the owner is listed. The clone uses a mock: Maria Souza, contato@exemplo.com.br,
     "Minha Empresa".
3. **Modals** (`xl`, 576px, both loaded over htmx on the original):
   - **Novo Usuário:**
     - Dados Básicos: name, email, password with reveal toggle;
     - Perfil de Acesso: profile, extra permissions;
     - Tags e Serviços;
     - Agendas ("all agendas" toggle);
     - Contas: required, with the account pre-selected.
   - **Editar Usuário:**
     - the owner card;
     - Dados de Acesso: email, active account, 2FA;
     - Dados de Membro: profile incl. Proprietário, permissions, tags, services, agendas;
     - Dados Pessoais: name, phone, gender, birth date;
     - Endereço: País/Estado/CEP + search button, Município, street…

## Verified measurements (live vs. clone), all identical

| | 1440 | 390 |
|---|---|---|
| container / document | 1152×857 / 966 | 390×983.25 / 1116 |
| filter form / search / button / bar | 1072×86 / 286.2×36 / 134.02×32 / 631.78×38 | 358×182.25 / 358×36 / 134.02×36 / 215.98×42 |
| action bar items | 98.09 / 121.64 / 114.39 / 108.61 / 1 / 173.41 | same |
| table / owner row height | 1072×691 / 69 | 358×721 / 99 |
| Novo Usuário | panel 576×772, body scrolls to 1056, sections 199/179/179/171/116 | — |
| Editar Usuário | body scrolls to 1453, sections 64/153/461/181/408 | — |
| permissions popover | 518×326.5, 4px under the field | — |

The owner row's column widths follow the text, so they differ with the mock name and account.
