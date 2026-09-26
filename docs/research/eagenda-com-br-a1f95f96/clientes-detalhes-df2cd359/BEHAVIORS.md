# /clientes/&lt;id&gt;/ — Behaviors

## Data (fase de lógica)
- O cliente vem do `?id=` na URL, lido do navegador (docs/DATA-LAYER.md). Id desconhecido mostra o
  card inteiro com "—" e a tabela vazia.
- "Agendamentos Recentes" lista os agendamentos daquele cliente, do mais novo para o mais antigo,
  no máximo 10, com o chip de status da lista de agendamentos.
- "Local de Nascimento", "Documento de Identidade", "Nome da Empresa" e "CNPJ da Empresa" vêm da
  tela de editar cadastro (clientes-editar-27fb6236), a única que preenche esses campos.

## Click sweep
- **Voltar** volta para a lista de clientes.
- **Editar Cadastro** leva para a tela de editar cadastro do mesmo cliente, como no original.

## Per-state content
- Sem agendamentos: "Nenhum agendamento recente / Os agendamentos deste cliente aparecerão nesta
  lista.", sobre as 10 linhas vazias.

## Responsive sweep
- **1440:** card em 3 colunas (`lg:grid-cols-3`).
- **768–1023:** 2 colunas.
- **<768:** 1 coluna; os dois botões continuam lado a lado.

## Verification
Medições contra o ao vivo em PAGE_TOPOLOGY.md.
