# /users/grupos/novo — Behaviors

## Data (fase de lógica)
- O formulário grava em `data.agendaGroups`: nome, nome para o link, ordem, as agendas escolhidas e
  o texto da tela.
- Deixar "Nome para o Link" em branco faz o clone derivá-lo do nome ("Escolha a especialidade" vira
  `escolha-a-especialidade`), que é o que o original promete no texto de ajuda; digitar no campo
  também converte para o mesmo formato.
- `?id=` abre o grupo para edição, com os campos e os chips já preenchidos.
- A barra de salvar é a mesma das outras telas: o botão submete o formulário e o aviso confirma.

## Verificação
No build estático: preencher "Escolha a especialidade", ordem 2 e a Agenda Principal gravou
`{ label, slug: "escolha-a-especialidade", order: 2, agendaIds: ["a1"] }` e mostrou o aviso "Grupo
salvo". Reabrir em `?id=ag1` trouxe tudo de volta, inclusive o chip da agenda. "Adicionar Etapa 1"
na Tela de Agendamento aponta para `/Agenda/users/grupos/novo`, e "Voltar" para
`/Agenda/users/tela_agendamento/?tab=groups`.

## Diferenças em relação ao original
- As duas imagens não são guardadas: o seletor aceita o arquivo e mostra o nome, mas o clone não
  tem onde armazenar o upload.
- A tela de agendamento ainda não desenha as etapas gravadas aqui — ela continua mostrando o aviso
  e o botão de adicionar.
