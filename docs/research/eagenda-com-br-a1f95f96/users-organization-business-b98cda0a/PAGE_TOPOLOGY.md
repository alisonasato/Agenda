# Conta › Dados da Conta ("Configurações Gerais") — Page Topology

Source: `https://eagenda.com.br/users/organization/business/?version=3`
Route: `/users/organization/business`
Page key: `users-organization-business-b98cda0a`

In the live site's new sidebar this entry is called **Configurações Gerais**; the clone's sidebar
still calls it Dados da Conta.

## Layout
The same frame as Tela de Agendamento:
- the `cfg-grid`;
- an 8-step `hstepper` on the left, with no public-page button;
- `#org-settings-panel` on the right.

Each step is its own server partial (`/users/organization/<step>/`), swapped in with htmx
without changing the URL. The clone mounts only the active step, remounting it on every
click, so a step reloads fresh like the original.

## Steps
1. **Seu negócio:**
   - Segmento: a combobox with 13 segments, plus the "aplicar cores" checkbox.
   - Painel: two `hselect`s, "Como você chama quem você atende?" (11 terms) and "Modo de uso".
2. **Local e horário:** País (the original's 249 ISO countries), Fuso horário, Idioma.
3. **Privacidade:** an accent alert (verify email), then 10 options in a `cfg-opt-list`. The
   2-factor option is disabled.
4. **Políticas:** 4 URL fields.
5. **Emails:**
   - a danger alert (feature not on the plan);
   - SMTP fields, where the port is a number stepper, and TLS/SSL/subaccount options;
   - a different dock (Cancelar, Salvar, Enviar Teste, Limpar) with no toast.
6. **Agendamentos:** 6 number fields with steppers and 2 options.
7. **Tela de agendamento:** 4 comboboxes, Google Analytics id, 2 options.
8. **Dados fiscais:**
   - Responsável: name, CPF (masked), birth date (`hdatepicker`), email, phone (`hphone`).
   - Negócio: description, website, fiscal address.
   - Recebimentos: 2 number fields.
   - Termos: one option.

## Verified measurements (live vs. clone), all identical

| Step | 1440 panel / content | 390 panel / content / H |
|---|---|---|
| 1 | 736×450.23 / 373.23 | 653.36 / 524.36 / 959 |
| 2 | 736×448 / 151 | 447 / 318 / 844 |
| 3 | 726×998.97 / 817.97 (alert 88) | 1317.05 / 1044.05 / 1622 |
| 4 | 736×448 / 291.34 | 610.19 / 481.19 / 916 |
| 5 | 726×754.02 / 613.02 (alert 48) | 1319.64 / 1014.64 / 1625 (4-button dock 201) |
| 6 | 726×784.41 / 707.41 | 1499.2 / 1370.2 / 1805 |
| 7 | 736×619.56 / 542.56 | 881.34 / 752.34 / 1187 |
| 8 | 726×934 / 857 | 1353.5 / 1224.5 / 1659 |

Every field box inside each step matches as well. The `hselect` list is 282×256 (11 options).
