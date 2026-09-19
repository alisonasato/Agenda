# Comunicação › Acompanhamento — Page Topology

Source: `https://eagenda.com.br/notificacao/envios?version=3`
Route: `/notificacao/envios` (title "Acompanhamento de Notificações")
Page key: `notificacao-envios-d5911c19`

## Shell
`DashboardShell`, sidebar Comunicação › Acompanhamento.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Action bar** (right-aligned `hactionbar` scroll rail), in order:
   - **Envio**: period picker with the 5 presets, two months and "Limpar período". The label
     shows the picked preset.
   - **Agenda**: multi-select. It comes back empty on the live account, so it opens on "Nenhum
     resultado encontrado".
   - **Tipo**: SMS, WhatsApp, Email, Notificação Push, WhatsApp - via WideChat, WhatsApp - via
     Twilio. Six options, so no search box.
   - **Filtros**: a menu, `hmenu-filters`, aligned to the trigger's right edge. It holds
     *Status do agendamento* (11 statuses, with a search box) and *Data do agendamento* (period
     picker). The trigger counts the active ones.
   - A separator, then **Regras de Notificação**.
2. **Status tags** (`htaggroup--nowrap` in an `hrail`): Todas, Aguardando, Enviada, Cancelada,
   Falhou, Sem Crédito, Bloqueada. **Limpar filtros** (`hbtn--secondary`) sits on the right.
3. **Table** (`htable`, 10 slots): Destinatário / Agenda / Regra / Tipo / Status Agend. / Data
   Agend. / Envio em / Situação / Ações.
   - Default empty state: "Nenhuma notificação programada".
   - With any filter applied: "Nenhum resultado encontrado".

## Verified measurements (live vs. clone)

| Element | 1440 | 390 |
|---|---|---|
| container | 1152×772 | 390×820.25 |
| filter form | 1072×86 | 342×134.25 |
| action bar | 633.86×38 at x 766.14 | 342×42 (next arrow shown) |
| Envio / Agenda / Tipo / Filtros | 102.84 / 117.94 / 96.69 / 108.61 wide | — |
| tag group / Limpar filtros | 610.19×28.25 / 109.17×32 | 610.19 (scrolls) / 109.17×36 |
| table | 1072×606 at y 198 | 342×606 |
| document height | 900 | 953 |
| Envio popover | 650×335, 6px under the trigger | — |
| Agenda / Tipo popovers | 240×190.5 / 240×284.5, 4px under | — |
| Filtros menu / nested Status popover | 240×90 at (961.22, 137) / 240×334.5 at (968.22, 186) | — |
| filtered empty state | 464×150 at y 445 | — |

Every value is identical on both.
