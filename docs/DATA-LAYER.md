# Camada de dados (fase de lógica)

O clone não tem servidor: as telas passam a funcionar de verdade lendo e gravando no **navegador**.

## Onde fica
`src/lib/seiri/`

| Arquivo | O que tem |
|---|---|
| `types.ts` | `Agenda`, `Service`, `Tag`, `Client` (com `Address` e `MARITAL_STATUS`), `Appointment`, `WaitingEntry`, `Data` e os rótulos/cores de status |
| `seed.ts` | Os dados iniciais: 2 agendas, 4 serviços, 3 tags, 6 clientes, 14 agendamentos e 4 inscrições na lista de espera. As datas são geradas **relativas a hoje** (de -6 a +12 dias), para os filtros de período terem o que mostrar |
| `store.ts` | `useData()`, `update()`, `reset()` e `nextId()` |
| `slots.ts` | Os slots de 30 minutos do calendário: `slotsOf()`, `slotColor()`, `hourRange()` |
| `select.ts` | Formatação (`formatWhen`, `formatMoney`, `formatDuration`), o filtro de período `inPreset()` e o `expand()` que troca ids por nomes |

## Como funciona
- Tudo vive em **localStorage**, chave `seiri.data.v1`. O primeiro acesso grava o seed; dali em diante
  o navegador é a fonte da verdade e as alterações sobrevivem ao reload.
- `useData()` lê num efeito, depois da hidratação: o HTML pré-renderizado (export estático) não tem
  dados, então cada lista aparece primeiro no seu estado vazio e preenche em seguida.
- `update(fn)` grava e repinta todos os componentes que estão lendo.
- `reset()` apaga o que o navegador guardou e volta ao seed.

## Linhas das tabelas
A conta usada como referência está **vazia em todas as telas**, então o original nunca mostrou uma
tabela preenchida. As linhas são construção deste clone, montadas com as peças do design system
(`htable-row`, `hchip--soft`, `hbtn--icon`) — é o único lugar em que o clone não copia o original.

## Exportar e importar
CSV é gerado e lido no navegador (`src/lib/seiri/csv.ts`): separador `;`, com BOM para o Excel em
pt-BR abrir os acentos. Exportam: Agendamentos, Clientes e o Relatório Consolidado (depois do aviso
de LGPD). Importa: Clientes, pelo modal "Importar Clientes", com as colunas que o original pede
(`cliente_id`, `nome`, `email`, `telefone`, `cpf`, `dt_nascimento`, `genero`, `nacionalidade`,
`profissao`). O original também aceita .xlsx e .xls; aqui, sem servidor, só .csv.

## Horários e bloqueios
`data.hours` guarda os intervalos de trabalho de cada agenda por dia da semana ("Configurar
Horários"); `data.blocks` guarda os períodos bloqueados ("Bloquear Horários"). `src/lib/seiri/slots.ts`
transforma os dois em slots de 30 minutos, que é o que o calendário desenha — o original serve a
mesma coisa pronta em `/agendamentos/calendar/get/`.

## Ajustes de um horário
`data.slotInfo` guarda o que os modais mudam em **um** slot — início, fim, máximo de pessoas e o link
de videoconferência — indexado por "<agenda>|<início>". O gerador de slots aplica isso por cima dos
horários da agenda.

## Cadastro completo do cliente
O modal da lista guarda o essencial; a tela `/clientes/editar/` guarda o resto do que o original
pede — tipo e número de identidade, naturalidade, distrito e os dados da empresa. É de lá que saem
a "Nome da Empresa"/"CNPJ" da tela de detalhes e os filtros de empresa da lista.

## Desativar em vez de apagar
A lixeira da lista de clientes marca `inactive` no cadastro em vez de removê-lo: o cliente sai das
listas e o histórico de agendamentos continua apontando para ele, que é o que o original faz
("Desativar cliente?").

## Consolidar clientes
O modal "Consolidar" agrupa os clientes que repetem os campos escolhidos (e-mail, telefone ou CPF),
mostra quantos grupos e quantos registros seriam fundidos e, ao confirmar, mantém o primeiro cadastro
de cada grupo, preenche os campos vazios dele com os dos outros e reaponta `appointments` e
`waiting` para quem ficou.

## Notas de ambiente
- `next dev` não hidrata as rotas que usam `<Suspense>` + `useSearchParams` (Agendamentos, Unidades):
  a página aparece, mas não responde a cliques. O build estático (`GITHUB_PAGES=1 npx next build` e
  servir `out/`) hidrata normalmente — é assim que a fase de lógica vem sendo verificada.
