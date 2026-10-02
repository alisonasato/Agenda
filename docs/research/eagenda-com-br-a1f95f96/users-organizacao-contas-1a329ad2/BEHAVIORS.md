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

## Data (fase de lógica)
- As sub-contas vivem em `data.accounts`. **Adicionar conta** grava dados gerais, endereço e o
  administrador; o lápis reabre o formulário com `?id=` e a lixeira pede confirmação.
- Agenda e membro ganharam `accountId`: quem tem o id da sub-conta pertence a ela, quem não tem
  pertence à conta principal. É daí que saem as colunas Usuários, Agendas e Próx. 30 dias, e os
  quatro KPIs somam as linhas que sobraram do filtro.
- Excluir a sub-conta devolve as agendas e os membros dela para a conta principal.
- No bloco **Administrador da Conta**, a aba "usuário existente" liga um membro já cadastrado à
  sub-conta; a outra cria um membro novo com perfil de Administrador.
- A busca cobre nome, sigla e contato; o popover de filtros casa campo a campo e as tags de
  assinatura filtram pelo plano.

## Verificação
No build estático: criar "Clínica Centro" com e-mail põe a linha com o chip Ativo e o contato, e o
KPI Sub-contas passa a 1; o lápis abre `?id=ac1` com nome e e-mail carregados.

## Diferenças em relação ao original
- No plano da conta de origem, "Adicionar conta" abre só "Limite de Contas Atingido"; o clone
  mantém o formulário completo, que é o que o original mostra num plano que permite contas.
- O original edita por uma rota própria; como o clone é estático, a mesma página de criar carrega a
  conta por `?id=`.
- Usuários, Agendas e Próx. 30 dias ficam em zero enquanto nada for atribuído à sub-conta: o clone
  não tem telas para mover agendas entre contas.
