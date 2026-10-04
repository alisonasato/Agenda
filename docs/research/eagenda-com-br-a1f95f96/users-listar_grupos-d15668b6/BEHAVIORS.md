# /users/listar_grupos — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.userGroups`: nome, descrição, as permissões escolhidas, os membros e se o
  grupo está ativo.
- "Permissões" conta as permissões do grupo; "Membros Ativos" conta só os membros de `data.members`
  que ainda estão ativos.
- "Novo Grupo" e a lápis abrem o mesmo modal, com o título trocando entre "Criar Grupo de Usuários"
  e "Editar Grupo de Usuários"; salvar exige o nome.
- A lixeira abre "Excluir este grupo?" e, ao confirmar, remove a linha.
- Os dois seletores são os mesmos `hautocomplete` do resto do painel: os membros saem de
  `data.members` e as permissões da lista fixa de `MEMBER_PERMISSIONS`.
- A semente não traz grupo nenhum, como a conta verificada.

## Verificação
No build estático: a tela abre no vazio "Nenhum grupo cadastrado". Criar "Equipe de Atendimento"
com duas permissões gravou o grupo e a linha saiu com "2" permissões, "0" membros ativos e "Ativo".
Editar e escolher a Maria Souza passou os membros ativos para "1". Excluir abriu "Excluir este
grupo?" e deixou a tabela vazia de novo.

## Diferenças em relação ao original
- O original busca membros e permissões no servidor (`/autocomplete/members` e
  `/autocomplete/member_permissions`); aqui as duas listas são locais.
- O grupo ainda não governa nada: nenhuma tela do clone consulta as permissões para esconder ou
  liberar o que quer que seja.
