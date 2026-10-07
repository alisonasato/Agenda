# Detalhes do Formulário — editor de perguntas

Source: `https://eagenda.com.br/pesquisas/controle/<id>?version=3`
Route: `/pesquisas/controle/detalhes?id=<formulário>`

O original põe o id do formulário no caminho. Como nas outras telas por registro, o export
estático não consegue gerar uma página por formulário, então aqui o id vem em `?id=`.

A tela é alcançada pela ação **Ver Detalhes** (ícone de olho) na linha de
[`/pesquisas/controle`](../pesquisas-controle-327168bf/PAGE_TOPOLOGY.md).

## Ações da linha, na tela de Formulários

A linha do original tem **cinco** ações, não as duas que o clone tinha:

| Ação | Destino |
|---|---|
| Ver Detalhes | `/pesquisas/controle/<id>` — esta tela |
| Editar | modal `/pesquisas/modal/editar/<id>/` |
| Link para Responder | `/pesquisas/<slug-da-organização>/id/<id>/` |
| Relatório | modal `/pesquisas/modal/<id>/consolidacao/` |
| Excluir | confirmação |

"Link para Responder" e "Relatório" levam à página pública de resposta e ao consolidado, que o
clone não tem — veja BEHAVIORS.md.

## Estrutura

```
main > div.mx-auto.w-full.max-w-[1550px]
  div.flex.flex-wrap.items-center            cabeçalho
    span.hchip.hchip--accent.hchip--primary  o tipo do formulário ("Agendamento")
    span.hchip.hchip--success.hchip--primary "Publicado", com ícone
    div.flex.flex-wrap.items-center          botões:
      a.hbtn.hbtn--secondary                 Visualizar
      button.hbtn.hbtn--secondary            Relatório
      button.hbtn.hbtn--danger               Excluir
      button.hbtn.hbtn--primary              Editar Formulário
  div.mt-6.grid.grid-cols-2                  4 cartões
    div.hui-card.hui-card--flush.hkpi > div.hkpi-body
      p.hkpi-label + div.hkpi-value-row > span.hkpi-value
      Perguntas | Respostas | Agendas | Validade
  div.mt-6.accent-warning.card-tint.border.rounded-xl.p-4    (condicional)
    svg + p.font-semibold.nunito-bold + p.inter-regular.val-accent
  div.mt-6
    div.hwidget-head > div.hwidget-titles > h2.hwidget-title "Perguntas"
                     > div.hwidget-actions > button.hbtn.hbtn--primary.hbtn--sm "Nova Pergunta"
    div.htable-scroll > table.htable-table.w-full.htable-fixed
```

## Cartões

| Rótulo | Valor na conta verificada |
|---|---|
| Perguntas | `3` |
| Respostas | `0` |
| Agendas | `0` |
| Validade | `Sem limite` |

"Validade" mostra **`Sem limite`** aqui, enquanto a coluna da tabela de Formulários mostra `—`
para o mesmo formulário sem prazo. São textos diferentes para o mesmo estado.

## Aviso de agenda não vinculada

Aparece quando o formulário é de um tipo ligado a agendas e não tem nenhuma. Caixa
`accent-warning card-tint`, que o `eagenda.css` do clone não trazia; valores medidos ao vivo:

| | |
|---|---|
| fundo | `color(srgb 0.966745 0.912784 0.84)` |
| borda | `1px solid color(srgb 0.792157 0.454902 0 / 0.3)` |
| raio | `12px` |
| padding | `16px` |
| título e descrição | `rgb(154, 89, 0)`, 14px |
| ícone | `rgb(202, 116, 0)` |

Texto: **"Atenção: Nenhuma agenda vinculada"** / "Este formulário é do tipo Agendamento mas não
está vinculado a nenhuma agenda. Edite o formulário para vincular às agendas desejadas."

## Tabela de perguntas

Colunas: `Ordem`, `Pergunta`, `Tipo`, `Opções/Limites`, `Obrigatória`, `Ações`.
O tipo vem num `.hchip`; `Opções/Limites` traz as alternativas separadas por vírgula, ou `—`.
Ações por linha: lápis (editar) e lixeira (excluir), ambos `btn-icon btn-icon-sm`.

Linhas vazias completam a tabela, como nas outras listas do sistema.

## Estado vazio

**Não foi visto.** O formulário verificado nasceu do modelo padronizado, que já traz três
perguntas, e apagá-las mexeria na conta além do necessário. A tela de Formulários usa
`hempty hempty--inline` com "Nada por aqui ainda"; o clone repete esse padrão aqui e a nota fica
registrada caso o original mostre outra coisa.
