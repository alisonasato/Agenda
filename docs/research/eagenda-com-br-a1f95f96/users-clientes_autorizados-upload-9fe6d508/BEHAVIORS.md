# /users/clientes_autorizados/upload — Behaviors

## Data (fase de lógica)
- O histórico vem de `data.clientImports`: quem enviou, o nome do arquivo, quando e o status.
- "Enviar" exige um arquivo (o `input` é `required`) e grava uma linha nova no topo, com o nome do
  arquivo escolhido, a data de hoje e o status `PROCESSING` — que é o estado em que o original
  começa.
- O conteúdo do arquivo **não é lido**: nada é importado para `data.clients`. A linha é só o
  registro do envio.
- Depois de enviar, o formulário é resetado. O `input type="file"` não é controlado, então limpar
  só o estado deixaria o nome do arquivo na tela; o original volta de um POST com o campo vazio.
- A coluna "Arquivo" é um ícone inerte: o original serve o arquivo guardado, que aqui não existe.

## Verificação
No build estático: a tela abriu com os dois registros da semente ("Concluído" e "Falhou"). Escolher
`lista-teste.csv` e enviar colocou `contato@exemplo.com.br · lista-teste.csv · <hoje> · Processando`
no topo; o segundo envio limpou o campo de arquivo. Em Gestão Individual, "Importar" virou link
para `/Agenda/users/clientes_autorizados/upload`.

## Diferenças em relação ao original
- Nenhum cliente é criado: só o registro do envio.
- O status nunca muda sozinho — não há processamento para concluir ou falhar.
- "Exportar", ao lado de "Importar" em Gestão Individual, segue inerte: o original usa
  `?export=xlsx`, um arquivo que só o servidor monta.
