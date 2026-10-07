# Comportamentos — editor de perguntas

## Modal de pergunta

`Nova Pergunta` abre `/pesquisas/modal/<id>/pergunta/criar/`; o lápis de cada linha abre
`/pesquisas/modal/<id>/pergunta/editar/<pergunta>/`. Os dois têm os mesmos campos:

| Campo | `name` | Observação |
|---|---|---|
| Texto da Pergunta * | `text` | textarea, placeholder "Digite a pergunta aqui..." |
| Ordem * | `order` | número, com setas (`hinput-wrap--number`) |
| Tipo de Resposta * | `type` | combobox; 13 opções, abaixo |
| Resposta obrigatória | `required` | checkbox |
| Alternativas * | `choices` | textarea, placeholder "Opção 1, Opção 2, Opção 3" |
| Valor Mínimo / Valor Máximo | `min_value` / `max_value` | números |
| Texto de Ajuda (opcional) | `help_text` | textarea |

Dicas, verbatim:
- Alternativas: "Separe as alternativas por vírgula. Ex: Sim, Não, Talvez"
- Ajuda: "Exibido abaixo da pergunta como dica"
- Nota: "O tipo 'Nota' permite ao respondente informar uma nota de 0 a 10. Notas abaixo de 6 em
  pesquisas de satisfação geram alertas automáticos."

## Campos que aparecem conforme o tipo

Lido dos `x-show` do Alpine no próprio modal:

| Mostra | Quando |
|---|---|
| Alternativas | `['radio', 'select', 'select-multiple'].includes(type)` |
| Valor Mínimo / Máximo | `['integer', 'float', 'texto-nota'].includes(type)` |
| dica da Nota | `type === 'texto-nota'` |

`checkbox` **não** pede alternativas, embora pareça que pediria.

## Os 13 tipos de resposta

Valores lidos do estado do componente, não dos rótulos:

| valor | rótulo |
|---|---|
| `text` | texto (várias linhas) |
| `short-text` | texto curto (uma linha) |
| `licence-plate` | texto curto com máscara (placa) |
| `radio` | marcar uma alternativa |
| `select` | selecionar uma alternativa da lista |
| `select-multiple` | selecionar várias alternativas da lista |
| `file-upload` | envio de arquivo |
| `integer` | número inteiro |
| `float` | número decimal |
| `texto-nota` | nota entre zero e 10 |
| `date` | data |
| `company-identification` | identificação de empresa |
| `checkbox` | checkbox |

`text` é o tipo inicial de uma pergunta nova.

## Prévia ao vivo

O modal é um componente Alpine com `questionType`, `questionText`, `questionChoices`,
`questionHelp`, `questionRequired` e um getter `choiceList` que quebra as alternativas na vírgula
e descarta as vazias. Conforme se digita, a prévia mostra a pergunta como o respondente a verá.

## O modelo padronizado

"Pesquisa de Opinião de Atendimento" (valor `avaliacao`) traz **três** perguntas, não cinco como o
clone supunha. Texto integral, como está no original:

1. `select` — "Você foi atendido no horário agendado?"
   Alternativas: `Sim. Fui atendido no horário,Não. Mas fui atendido em até 5 minutos após o
   horário marcado,Não. Fui atendido após 5 minutos do horário marcado`
2. `texto-nota` — "Qual a sua avaliação quanto ao serviço prestado? Avalie com uma nota de 0 a 10."
3. `text` — "Se desejar, utilize o campo abaixo para fazer críticas, sugestões, elogios e/ou
   reclamações. Sua opinião é muito importante para nós!"

Nenhuma das três é obrigatória, e nenhuma traz texto de ajuda ou limites.

## Diferenças em relação ao original

- **Visualizar** e **Relatório** não têm destino no clone. O primeiro leva à página pública de
  resposta (`/pesquisas/<slug>/id/<id>/`), que o clone não tem; o segundo abre o consolidado das
  respostas, que não existe porque nada é respondido. Ambos ficam desabilitados, com o motivo no
  `title`, em vez de apontarem para lugar nenhum.
- **Respostas** fica sempre em `0`, pela mesma razão.
- A exclusão de uma pergunta pede confirmação, como as outras exclusões do clone.

## Verificação

No build estático: abrir um formulário criado a partir do modelo mostra os quatro cartões com
`3 / 0 / 0 / Sem limite`, o aviso de agenda não vinculada, e as três perguntas na ordem, com os
chips `selecionar uma alternativa da lista`, `nota entre zero e 10` e `texto (várias linhas)`.
Trocar o tipo no modal troca os campos conforme a tabela acima.
