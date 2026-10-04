# /agendamentos/historico/<id> — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.agendaLogs`, filtradas pela agenda do `?id=` e pelo `kind` da aba
  ("config" ou "hours").
- Trocar de aba troca as colunas, a descrição do cabeçalho e volta para a primeira página.
- O seletor de usuário filtra pelo nome de quem fez a alteração, e o estado vazio troca de texto
  quando há filtro.
- A paginação é de 10 linhas por página, com o "1–N / total" e os números no rodapé da tabela.
- "Criar" e "Adicionar" usam o chip de destaque; "Atualizar" o neutro. Um valor de cor mostra a
  amostra antes do código, e "Nenhum" sai em cinza claro.

## Verificação
No build estático, em `?id=a1`: a aba Configurações lista as oito alterações com "1–8 / 8", a linha
"Color" com a amostra de #48CFAE, e os "Nenhum" em cinza. A aba Horários troca as colunas para Dia ·
Começo · Fim, a descrição para "Alterações nas janelas de atendimento" e mostra "1–4 / 4", abrindo
em "Sábado 09:00 18:00". Filtrar por "Maria Souza" mantém as quatro linhas. Em `?id=a2`, que não tem
registro nenhum, aparece "Nenhuma alteração registrada".

## Diferenças em relação ao original
- O seletor de período é um rótulo fixo: o clone registra tudo em um dia só, então não há intervalo
  para filtrar. O seletor de usuário é um `select` simples, no lugar do autocomplete do original.
- Nada ainda escreve nesse histórico: as linhas vêm da semente. Quando a tela de configuração da
  agenda passar a registrar o que muda, é nessa coleção que ela escreve.
