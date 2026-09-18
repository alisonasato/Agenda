# Comunicação › Nova Regra por Status — Page Topology

Source: `https://eagenda.com.br/notificacao/regras_status/nova?version=3`
Route: `/notificacao/regras_status/nova` (reached from "Nova Regra" on Notificações por Status)
Page key: `notificacao-regras_status-nova-4ba76ba5`

## Shell
`DashboardShell` titled **Nova Regra por Status**. The live page highlights **no** sidebar
entry, so the route passes an empty `active`.

## Sections
1. **Adicionar Créditos** (`hbtn--secondary`, 173.78×36) in a `mb-6` row → credits modal.
2. **`#status-rule-form`** → `.hformpanel` (1062×713) with four `.hformsection`s:
   - **Configuração Geral** (244) — *Status do Agendamento* (in-field combobox, `md:max-w-md`,
     7 statuses, not clearable); "Aplicar a regra em todas as agendas"; *Agendas* chip
     multi-select (empty on the live account), hidden while the checkbox is on.
   - **Herança para Subcontas** (144.5) — "Aplicar nas subcontas", "Forçar em todas as
     subcontas…", and the explanation.
   - **Destinatários** (118.5) — acompanhantes, usuário responsável.
   - **Canais e Conteúdo** (164) — WhatsApp / SMS / email checkboxes, each revealing its
     block: WhatsApp template (+ read-only template text once one is picked), the SMS text
     (prefilled with `{{status}}`), and the email template.
3. **Save bar** — dock (1062×53) with **Voltar** and **Salvar Regra**, plus the floating
   "Regra ainda não salva" toast.

## Verified measurements (live vs. clone)

| Element | 1440 live | 1440 clone | 390 live | 390 clone |
|---|---|---|---|---|
| container | 1142×914 | 1142×914 | 390×1049 | 390×1049 |
| top row / button | 1062×36 / 173.78×36 | same | 342×40 / 177.78×40 | same |
| form panel | 1062×713 | 1062×713 | 342×792 | 342×792 |
| sections | 244 / 144.5 / 118.5 / 164 | same | 252 / 198 / 136 / 164 | same |
| all channels + all agendas | 966: 182.5 / 144.5 / 118.5 / 478.5 | same | — | — |
| dock | 1062×53 (top 893) | same | 342×105 | same |
| document height | 1023 | 1023 | 1182 | 1182 |
| Status popover | 448×242 | 448×242 | — | — |
| dirty toast | hidden (dock in view), left 328 / right 50 | same | shown at 0,779 390×65 | same |
