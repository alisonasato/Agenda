# Formulários — Page Topology

Source: `https://eagenda.com.br/pesquisas/controle/?version=3`
Route: `/pesquisas/controle`
Page key: `pesquisas-controle-327168bf`

## Shell
`DashboardShell`, top-level sidebar link **Formulários** active. Note the container here
has no `min-w-0`, unlike the report pages.

## Sections

1. **Action row** (`flex flex-wrap items-center gap-3`, 1062×36) — **Novo Formulário**
   (`hbtn--primary`, add-appointment icon; 162.02×36 at 1440, 166.02×40 at 390). Opens
   the `survey-form-modal`.
2. **Seus Formulários** (`mt-6`, 1062×686)
   - `.hwidget-head` (1062×24) — title only.
   - `#surveys-table-container` (1062×646) — `.htable.htable-is-empty` with
     `--htable-row-h: 3.75rem` / `--htable-head-h: 38px`; columns Formulário, Tipo, Agendas,
     Perguntas, Respostas, Validade, Ações (`--end`); 10 spacer rows; the **default** empty
     variant shows (inbox icon, "Nada por aqui ainda", 388.78×130) because the page has no
     filters.

## "Novo Formulário" modal (`hmodal-panel--lg`, 512×637)
Header 56 · body 513 · footer 68. Body is the `#survey-form`, `space-y-4`:

| Field | Size | Notes |
|---|---|---|
| Nome do Formulário * | 464×61.5 | `hinput`, placeholder "Ex: Pesquisa de Satisfação" |
| Descrição | 464×135.5 | `htextarea` rows 3 |
| Tipo de Formulário | 464×61.5 | combobox, default *Agendamento*; 4 options; popover 464×196 |
| Vincular às Agendas | 464×61.5 | chip multi-select, **no options** on the live account; popover 464×167.5 at the field's outer edge |
| Data Limite para Responder | hidden | `x-show="surveyStage === ''"` — only when Tipo is empty, which the non-clearable combobox never allows |
| Apenas usuários logados podem responder | 296.34×17.5 | checkbox |
| Importar Modelo Padronizado | 464×79.5 | combobox, placeholder "Não importar - criar do zero", 1 option + hint |

Footer: **Cancelar** (`hbtn--tertiary`) and **Salvar** (`hbtn--primary`, submit spinner).

Also in the original DOM but unreachable without rows: the delete dialog ("Excluir
formulário?") and the "Relatório de Respostas" modal (`hmodal-panel--4xl`). Not cloned.

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page container | 1142×810 | 1142×810 | 390×814 | 390×814 |
| Novo Formulário | 162.02×36 | 162.02×36 | 166.02×40 | 166.02×40 |
| `.hwidget-head` | 1062×24 | 1062×24 | 342×24 | 342×24 |
| table | 1062×646 | 1062×646 | 342×646 | 342×646 |
| empty state | 388.78×130 | 388.78×130 | 302×150 | 302×150 |
| document height | 919 | 919 | 947 | 947 |
| modal panel / header / body / footer | 512×637 / 56 / 513 / 68 | same | — | — |
| Tipo popover | 464×196 | 464×196 | — | — |
| Agendas popover (left, top, w, h) | 488, 567.5, 464, 167.5 | same | — | — |
