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

## Passo 2 — Horários (fase de lógica)
- Os quatro números do primeiro bloco e as restrições do segundo são as regras da agenda
  (`data.agendaRules`), que o card da tela de Configuração mostra em Duração, Opções a cada,
  Máx./horário e Antecedência.
- A **Tabela de Horários Semanal** edita `data.hours`: adicionar e remover intervalos por dia, e os
  dois botões de cópia repetem a segunda-feira nos outros dias.
- A coluna **Horários Gerados** calcula os horários como o calendário faz: de "duração + intervalo"
  em "duração + intervalo", ou pela granularidade quando ela é diferente de zero.

## Verificação
No build estático: digitar "Unidade Norte" preenche o slug `unidade-norte`; escolher o serviço
"Retorno" mostra Seleção Máxima 1, Duração Total 30 min e Valor Total R$ 90,00; salvar acrescenta
`a3:Unidade Norte` às agendas, põe `a3` em `data.hours` e liga o serviço à agenda nova. Abrir
`?id=a2` traz "Unidade Centro" com o slug e os três serviços dela.

No passo Horários: com duração 60 a segunda-feira gera 11 horários (07:00…17:00) e com 30 gera 22;
"Copiar Seg → Ter a Dom" preenche os sete dias; salvar grava as regras e a semana, o card passa a
mostrar "Duração 30 min · Opções a cada 30 min · Máx./horário 2 · Antecedência 1h – 7 dia(s)" e
"Seg–Dom 07:00–18:00", e o calendário passa a desenhar 22 horários também no domingo.

## Diferenças em relação ao original
- Estão clonados os passos **Básicas** e **Horários**; Formulários, Notificações, Avançadas e
  Acessos aparecem no stepper desabilitados.
- "Horários Extras e Limites" mostra só o estado vazio: o modelo não tem datas avulsas nem limites
  de volume.
- Dentro de Básicas, as opções da agenda, o proprietário, a unidade, o endereço e a descrição são
  campos de tela: o modelo do clone guarda nome, serviços e horários, e ainda não tem onde guardar o
  resto.
- A descrição no original é um editor rich text (CKEditor); aqui é um `htextarea`.
