# Conta › Administrar Agendas — Page Topology

Source: `https://eagenda.com.br/painel/controle?version=3`
Route: `/painel/controle`
Page key: `painel-controle-3afc63eb`

## Sections
1. **Ações em Lote:**
   - an `hwidget-head`, then a grid of 6 `ctrl-tool` cards (1/2/3 columns);
   - each card has a duotone glyph, a title, a description and an arrow;
   - Cancelar Agendamentos is `--danger` (red glyph).
2. **Horários Manuais:** an empty `htable` with 5 slots.
3. **Configuração de Agendas:**
   - a search box in the head;
   - an empty `htable` with 10 slots.
   - With no agendas, the default empty state stays even while searching.

## Modals
All are `hModal`s whose `<form class="hmodal-form">` wraps header, body and footer, with a
title and a subtitle.

| Modal | Size | Content |
|---|---|---|
| Bloquear / Desbloquear | lg | action pills, target agendas, period (dates + optional times), reason (block only) |
| Incluir Horários | lg | targets, period (times required), interval (18 options), per-slot count |
| Cancelar Agendamentos | lg | targets, period; danger submit |
| Ativar / Desativar | **md** | action pills, targets |
| Alterar Configuração | lg | targets, responsible user, 4 number fields, 2 dates, 2 ages, description |
| Copiar Configuração | **md** | source agenda (required), targets |

"Targets" means "Selecionar todas as agendas", which hides the chip multi-select.

## Verified measurements (live vs. clone), all identical

| | 1440 | 390 |
|---|---|---|
| container / document | 1142×1446.38 / 1555 | 390×1893.44 / 2026 |
| tool cards | 343.33×93.19, 3 per row | 342 wide, stacked (74.34 or 93.19 tall) |
| tables | 1062×326 and 1062×606 | 342×326 and 342×606 |
| search | 320×36 | 239×36 |
| modals (panel height) | 549.5 / 505.5 / 428 / 297 (md) / 772 (body scrolls to 703) / 350.5 (md) | Alterar Configuração 374×716, body scrolls to 1038 |
| time popover | 127×239, 6px below | — |
| date popover | 258×297, 6px below | — |
