# /agendamentos/configurar_agenda/<id>/emails — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.agendaEmails` filtradas pela agenda do `?id=`; sem `?id=`, a página abre
  na primeira agenda.
- O KPI "Templates" conta as linhas da agenda e o "AgendaCoins" mostra `data.credits.general`.
- "Adicionar Créditos" abre o mesmo `AddCreditsModal` das telas de Comunicação, que credita de
  verdade.
- A lixeira abre o alerta "Excluir este modelo de email?" com o nome do modelo e, ao confirmar,
  remove a linha.

## Verificação
No build estático, em `?id=a1`: cinco templates com os mesmos tipos e assuntos do original, o KPI
mostrando 5, e os botões da agenda levando para cá —
`/Agenda/agendamentos/configurar_agenda/emails/?id=a1` e `?id=a2`.

## Diferenças em relação ao original
- "Editar modelo de email" leva ao editor de modelos de e-mail que o clone já tem
  (`/notificacao/email_template`); a tela própria do modelo da agenda não foi clonada.
- Os dois últimos tipos aparecem como "refused" e "rescheduled" porque é assim que o original os
  imprime — tradução faltando no site de origem, copiada como está.
