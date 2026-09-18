# Relatórios › Indicadores Gerenciais — Page Topology

Source: `https://eagenda.com.br/relatorios/indicadores/?version=3`
Route: `/relatorios/indicadores`
Page key: `relatorios-indicadores-6e858678`

## Shell
`DashboardShell`, sidebar group **Relatórios**, item **Indicadores Gerenciais** active.
The page container carries `id="indicadores"` so the original's page-level `<style>`
block can be reproduced without leaking into the painel's KPI cards (see BEHAVIORS).

## Sections, top to bottom

1. **`#formFilter`** (1062×38 at 1440, 342×42 at 390)
   - `ScrollRail` action bar (740.44×38 at 1440):
     - `InlineSelect` **Período** (calendar-with-dot icon) — Últimos 7 dias / 30 dias /
       3 meses / 6 meses / Período Personalizado; default *Últimos 3 meses*. 240×248.5.
     - `InlineFilter` **Agendas** (calendar icon, 1 option → no search box).
     - `InlineFilter` **Serviços** (clipboard icon, no options).
     - **Filtros** menu → `#indicadores-more-panel` (240×52) with one row: `InlineSelect`
       **Situação** — Todos / Todos, exceto os cancelados / Atendido / Confirmado /
       Cancelado / Não compareceu.
     - `.hactionbar-sep`, `#report-apply-wrap` (hidden until something changes),
       **Limpar filtros** (`<a>` to `?reset=1`).
   - `[data-period-custom-row]` — `hidden` until *Período Personalizado* is picked, then a
     flex row (1062×61.5) with two `DatePicker`s: **Início do período** and **Fim do período**
     (fields 224×36, calendar popover 258×297).

2. **Results head** (`mt-6 md:mt-8 hui-reveal` → `.hwidget-head`, 1062×44; 342×74 at 390
   where the description wraps) — **Indicadores** +
   `{from} - {to} · Comparação: {prevFrom} - {prevTo}`.

3. **KPI grid** (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6`, 1062×373) —
   8 `.hkpi` cards, 247.5×174.5 each: Total de Agendamentos*, Total de Clientes,
   Cancelamentos*, Faturamento Total ($), Taxa de Ocupação, Taxa de não Comparecimento,
   Taxa de Retorno de Clientes, Ticket Médio ($). The two starred cards are links
   (`hkpi--link hkpi--cta`, "Acessar" pill, new tab) into the appointments list.

4. **Charts grid** (`grid-cols-1 lg:grid-cols-2`, 1062×446) — two `.hsection` cards
   (519×446): *Agendamentos do Período* and *Agendamentos por Agenda*, both showing the
   `.chart-empty` state (bar-chart icon + "Sem agendamentos no período selecionado.").

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page container | 1142×1041 | 1142×1041 | 390×2448 | 390×2448 |
| `#formFilter` | 1062×38 | 1062×38 | 342×42 | 342×42 |
| `.hactionbar` | 740.44×38 | 740.44×38 | 342×42 | 342×42 |
| rail triggers | 231.31 / 124.7 / 121.64 / 108.61 | same | — | — |
| rail scroll / arrows | 734/734, none/none | same | 734/336, none/flex | same |
| `.hwidget-head` | 1062×44 | 1062×44 | 342×74 | 342×74 |
| KPI grid / card | 1062×373 / 247.5×174.5 | same | 342×1480 / 342×174.5 | same |
| charts grid / card | 1062×446 / 519×446 | same | 342×728 / 342×356 | same |
| document height | 1150 | 1150 | 2581 | 2581 |
| Período popover | 240×248.5 | 240×248.5 | — | — |
| custom row / date field / picker | 1062×61.5 / 224×36 / 258×297 | same | — | — |
| Filtros panel | 240×52 | 240×52 | — | — |
