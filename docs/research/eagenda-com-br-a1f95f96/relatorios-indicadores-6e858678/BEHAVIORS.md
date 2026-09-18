# Relatórios › Indicadores Gerenciais — Behaviors

## Interaction model
Staged filters, like the other reports: nothing recalculates until **Aplicar filtros**.
Any staged change (period, agendas, services, situation, custom dates) reveals the button.

## "Aplicar filtros" reveal
This page does it differently from the other reports. Its own `<style>` block makes
`.report-apply` a collapsed inline-flex (`max-width: 0; opacity: 0`) that widens to
`max-width: 14rem` with `.is-visible`, animating both over .18s so the neighbours slide
instead of jumping. The wrapper also starts with inline `display:none`. The clone does
both: inline `display:none` while clean, `is-visible` once dirty.

## Page-scoped styles
The original ships, inside the page:
- `.hkpi-label { min-height: 2.625rem }` — reserves two label lines so both KPI rows keep
  the same height (its own comment says it must not touch KPIs on other screens);
- `.chart-empty` / `.chart-container` at `min-height: 350px` (260px under 768px);
- the `.report-apply` animation above.

The clone keeps them in `inline-styles.css`, prefixed with `#indicadores`, the id of this
page's container — the painel also renders `.hkpi` cards and must not inherit the rule.

## Period and comparison window
Preset *Últimos N* covers **today − N days through today**, and the comparison is the
window of the same length that ends the day before it starts. For *Últimos 3 meses* on
18/09/2026: `20/06/2026 - 18/09/2026 · Comparação: 21/03/2026 - 19/06/2026` (checked in
`calendarDates.test.mjs`). The custom range reuses the same rule — an assumption, since the
live account has no data to confirm it against.

## Período Personalizado
Selecting it un-hides `[data-period-custom-row]`: two date pickers with empty
`dd/mm/aaaa` fields. The picker (`shared/DatePicker`) opens on the selected month or the
current one, always draws 6 weeks (42 cells, blanks around the month), steps by month and
by year, marks `is-today` and `is-selected`, and has **Hoje** / **Limpar** in the footer.
Choosing a day fills the field and closes the popover; typing a valid `dd/mm/aaaa` also
works (invalid text reverts on blur).

## KPI cards
All zero on the live account. *Total de Agendamentos* and *Cancelamentos* are links that
open the appointments list for the same window in a new tab (the latter with
`status=CANCELED`); each card's `title` is the original's explanatory tooltip.

## Site-wide CSS update found while cloning this page
The live `dashboard.css` changed after 16/09/2026 (now `dashboard.0ab9993344c7.css`). The
change that matters: `.hactionbar .hinline-trigger--bare { font-size: .875rem }` (was
13px) plus a 1.25rem label line-height. The clone's stylesheet was regenerated from the new
bundle, which also brought the older report pages back in line with the live site (e.g.
Consolidado's bar: 897.58px clone vs 897.56px live). None of the utility classes the new
bundle dropped are used by the clone.
