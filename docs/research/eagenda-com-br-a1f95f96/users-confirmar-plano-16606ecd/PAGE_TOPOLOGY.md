# Confirmar Plano — Page Topology

Source: `https://eagenda.com.br/users/confirmar-plano/<id>?version=3`
Route: `/users/confirmar-plano` (title "Confirmar Plano")
Page key: `users-confirmar-plano-16606ecd`

## Shell
`DashboardShell` on Conta › Meu Plano. Reached from "Selecionar Plano" on Alterar Plano and from
the two "Assinar Plano Básico" buttons on Meu Plano.

## Sections
"Voltar" (`hbtn--secondary`), then `<form id="confirm-plan-form" class="mt-6 space-y-6" novalidate>`
holding a `cfg-content` with six `cfg-group` cards:

1. **Plano Selecionado** — a `w-11 h-11 rounded-xl bg-primary/10 text-primary` badge (`CrownIcon`)
   beside the plan name, printed twice (name over slug, identical on this account).
2. **Pagamento** — "Frequência de Pagamento" (`hcombobox`, required) over a static "Forma de
   Pagamento: Boleto, Pix ou cartão de crédito — você escolhe na hora de pagar."
3. **Personalize seu Plano** — four required number fields, each with its unit price as the
   description: `limite_agendamentos` (R$ 0,09/agendamento), `limite_usuarios` (R$ 5,90/usuário),
   `limite_contas` (R$ 15,00/conta), `limite_unidades` (R$ 9,90/unidade).
4. **Funcionalidades Extras** — five `hcheckbox`es sharing `name="features"`, ids 2, 7, 8, 10, 5.
5. **Dados do Contratante** — "Tipo de Pessoa para o Faturamento" (`hcombobox`, 1 = Pessoa Física,
   2 = Pessoa Jurídica), Nome ou Razão Social, E-mail, Telefone de Contato (`hPhoneInput`), and
   then CPF **or** CNPJ, each shown only for its person type.
6. **Endereço de Cobrança** — CEP, Distrito, Endereço, Número, Complemento, Bairro, and the
   País / Estado / Município cascade.

Below the card, an `hsection` "Confirmação de contratação" with the review note, the terms
checkbox (required) and "Prosseguir para Pagamento".

## Frequências por plano
Each plan carries its own four rows, with the ids the original posts as `plan_pricing`:

| Plano | Mensal | Trimestral | Semestral | Anual |
| --- | --- | --- | --- | --- |
| Básico (3) | 1 — R$ 45,00 | 6 — R$ 129,00 | 7 — R$ 255,00 | 5 — R$ 488,00 |
| Intermediário (4) | 2 — R$ 90,00 | 8 — R$ 261,00 | 9 — R$ 510,00 | 10 — R$ 976,00 |
| Avançado (5) | 3 — R$ 172,00 | 11 — R$ 497,00 | 12 — R$ 974,00 | 13 — R$ 1886,00 |
| Empresa (220) | 18 — R$ 387,00 | 19 — R$ 1118,00 | 20 — R$ 2191,00 | 21 — R$ 4199,00 |

## Deviation
The plan arrives as `?id=` instead of a path segment, like every other per-record screen in the
static export. `?frequencia=anual` preselects the annual row, as the original's link does.
