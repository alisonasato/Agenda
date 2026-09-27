# /agendamentos/configurar/agenda/add — Behaviors

## Data (fase de lógica)
- Sem `?id=`, a página cria uma agenda; com `?id=`, carrega a agenda daquele id e salva por cima.
- Salvar grava a agenda, reescreve de que agendas cada serviço participa (é esse o lado que o modelo
  guarda) e abre uma semana vazia em `data.hours` para ela, que a tela de Configuração e o calendário
  passam a enxergar.
- O slug acompanha o nome enquanto ninguém o editar; depois disso fica como foi digitado.
- "Copiar de outra agenda" traz os serviços da agenda escolhida.

## Click sweep
- **Nova Agenda** (tela de Configuração) abre esta página vazia; **Configurar** no card abre com a
  agenda carregada.
- **Salvar** grava e o toast passa a "Agenda salva"; **Voltar** vai para a lista de agendas.
- Os passos 2 a 6 do stepper aparecem desabilitados, como no original faz com os passos ainda não
  liberados.

## Verificação
No build estático: digitar "Unidade Norte" preenche o slug `unidade-norte`; escolher o serviço
"Retorno" mostra Seleção Máxima 1, Duração Total 30 min e Valor Total R$ 90,00; salvar acrescenta
`a3:Unidade Norte` às agendas, põe `a3` em `data.hours` e liga o serviço à agenda nova. Abrir
`?id=a2` traz "Unidade Centro" com o slug e os três serviços dela.

## Diferenças em relação ao original
- Só o passo **Básicas** está clonado; Horários, Formulários, Notificações, Avançadas e Acessos
  aparecem no stepper desabilitados.
- Dentro de Básicas, as opções da agenda, o proprietário, a unidade, o endereço e a descrição são
  campos de tela: o modelo do clone guarda nome, serviços e horários, e ainda não tem onde guardar o
  resto.
- A descrição no original é um editor rich text (CKEditor); aqui é um `htextarea`.
