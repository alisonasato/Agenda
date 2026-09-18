# Comunicação › Notificações por Status — Page Topology

Source: `https://eagenda.com.br/notificacao/regras_status?version=3`
Route: `/notificacao/regras_status`
Page key: `notificacao-regras_status-226ec629`

## Shell
`DashboardShell`, sidebar group **Comunicação**, item **Notificações por Status** active.
The page wraps its content in `div.min-w-0 > #status-rules-page-root` (`px-4 py-8 sm:px-6
lg:px-10`), not the usual container.

## Sections
1. **Credit cards** — shared `CreditCards`; here the first card reads **AgendaCoins**
   (Regras de Notificação calls it "Créditos Gerais"). 256×153.5 at 1440.
2. **Tabs + actions** (`mt-6 md:mt-8`, 1072×40)
   - `.htabs` (318.63×40): **Regras Gerais** / **Regras por Agenda**, 155.31×32 each, with a
     sliding `.htabs-indicator` (`translateX(calc(i * 100%))`, 158.06px for the second tab).
   - **Nova Regra** — a link (not a modal) to `/notificacao/regras_status/nova`.
   - **Adicionar Créditos** (`hbtn--secondary hbtn--sm`, wallet icon) → credits modal.
3. **Regras Gerais** panel (`mt-5`, 1072×382) — table Status / Canal / Template / Conteúdo /
   Ações with **6** spacer rows (not 10).
4. **Regras por Agenda** panel (`mt-5`, 1072×459.5, `display:none` until its tab) — filter form
   with **Agenda** (224px) and **Canal** (192px) comboboxes in the in-field-search flavour,
   then the table with an extra Agendas column.

## Adicionar Créditos modal (512×471; 495 with the monthly-recharge hint)
Balance line ("Saldo atual: 0 AgendaCoins"), amount (min 50.000, step 1.000, native
stepper), four preset buttons, a `<details>` bonus table (0% → 40%), "Ativar recarga mensal
automática" with its explanations, the terms checkbox, and Cancelar / **Continuar para
Pagamento** (card icon, disabled until the terms are accepted).

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| page root | 1152×691.5 | 1152×691.5 | 390×897 | 390×897 |
| credit grid / card | 1072×153.5 / 256×153.5 | same | 358×319 / 173×153.5 | same |
| tabs row / tabs | 1072×40 / 318.63×40 | same | 358×88 / 318.63×40 | same |
| buttons | 122.36 / 165.78 ×32 | same | ×36 | same |
| Regras Gerais panel | 1072×382 | 1072×382 | 358×382 | 358×382 |
| Regras por Agenda panel / form | 1072×459.5 / 61.5 | same | 358×537 / 139 | same |
| filter comboboxes | 224 / 192 ×61.5 | same | 358×65.5 | same |
| document height | 900 | 900 | 1030 (1185 on tab 2) | same |
| credits modal | 512×471 → 495 | same | — | — |
