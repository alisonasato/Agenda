# /users/logs — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.teamLogs`; a coluna Agenda resolve `agendaId` em `data.agendas`.
- `?member=<id>` filtra pelo e-mail do membro, que é como o original identifica o usuário na
  tabela. Sem o parâmetro, a tela mostra tudo.
- Com o filtro ligado e nada batendo, o vazio é o de "filtros aplicados", não o de tabela nova —
  os dois textos existem no original.
- "Atualizar" aponta para a própria URL, preservando o `?member=` quando ele está ali.
- Só duas ações apareceram na conta verificada; `TEAM_LOG_TONES` pinta essas duas e qualquer outra
  cai no chip neutro em vez de quebrar.

## Verificação
No build estático: a tela abriu com os quatro registros da semente, duas ações em chip azul e uma
em vermelho. `?member=mb2` deixou só as duas linhas do João Pedro e manteve o "Atualizar" apontando
para `?member=mb2`. Em Administrar Equipe, o novo ícone de histórico saiu nas duas linhas, com
`?member=mb1` e `?member=mb2` e `target="_blank"`, como no original.

## Diferenças em relação ao original
- O original carrega a tabela por HTMX depois de pintar um spinner; aqui ela já vem renderizada.
- Não há expurgo por plano: a frase sobre "30 dias" é a do original, mas nada apaga registro velho.
