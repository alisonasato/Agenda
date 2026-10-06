# /webhook/webhook-config — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.webhooks`: tipo de registro, URL, eventos e o cabeçalho de autenticação.
- Trocar o tipo de registro **limpa os eventos já marcados**, como o `@change` do original faz, e
  troca a lista disponível: Cancelamento só existe para Agendamentos, Exclusão só para Agendas e
  Membros da Equipe.
- Sem tipo escolhido, a lista de eventos dá lugar ao alerta azul do original.
- Salvar exige tipo, URL e ao menos um evento. O cabeçalho vazio vira `{}`.
- "Adicionar Webhook" e a lápis abrem o mesmo modal; o título alterna entre "Novo Webhook" e
  "Editar Webhook" e o botão entre "Criar Webhook" e "Salvar".
- A lixeira abre "Excluir este webhook?" com a URL no texto e remove a linha ao confirmar.
- Nenhum evento é disparado: a URL nunca é chamada.

## Verificação
No build estático: a tela abriu com os dois webhooks da semente. No modal, sem tipo escolhido veio
o alerta e nenhum checkbox; "Membros da Equipe" trouxe Criação / Atualização / **Exclusão**; marcar
um e trocar para "Agendamentos" trocou a lista para Criação / Atualização / **Cancelamento** e
zerou as marcações. "Configurações avançadas" começa fechado e revela o textarea com `{}`. Criar
gravou a terceira linha; a lápis reabriu com URL e eventos preenchidos; a lixeira mostrou a URL no
diálogo e deixou duas linhas.

## Diferenças em relação ao original
- O original carrega a tabela por HTMX atrás de um spinner; aqui ela já vem renderizada.
- "Chave da API" é um botão inerte: aponta para `/users/integracao/api-webhooks`, uma das páginas
  de integração fora de escopo.
- A coluna "método" é sempre `POST`; o formulário do original também não oferece outro.
