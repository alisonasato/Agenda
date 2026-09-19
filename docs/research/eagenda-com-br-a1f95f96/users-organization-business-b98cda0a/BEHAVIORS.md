# Conta › Configurações Gerais — Behaviors

- **Steps:** click-to-switch. Every switch reloads the step, so unsaved edits are dropped, as
  on the live page.
- **Save bar:** the shared `SaveBar`, with Voltar going back to this page. The toast shows
  when edited and the dock is below the viewport.
  - The Emails step uses its own dock instead: Cancelar reloads the step, Salvar / Enviar
    Teste / Limpar submit, and there is no toast.
- **Number fields:** the steppers call the native `stepUp()` / `stepDown()`, so
  `step`/`min` apply.
- **CPF:** masked as `000.000.000-00` while typing (the original uses jQuery Mask).
- **Phone:** the shared `PhoneInput`, the same component as on Tela de Agendamento.
- **Birth date:** the shared `DatePicker`.
- **Country list:** stored as the original's ISO codes in its order. Names come from
  `Intl.DisplayNames('pt-BR')`, except 47 that the original words differently (e.g.
  "Coréia do Sul", "Holanda"); those are stored.

## Deliberate differences
- **Fuso horário:** the original's list is empty (only the saved "America/Sao_Paulo"
  shows). The clone lists all IANA zones (`Intl.supportedValuesOf`), with the same text
  for the selected value.
- **Fluxo de Agendamento:** the live account's saved value ("0") matches no option, so the
  original shows a blank field. The clone shows its empty state: the "Selecione..."
  placeholder.
- **Links that go nowhere yet:** "Clique aqui" (verify email) points to `#`, because the
  profile page isn't cloned yet.

## Page CSS
The page's `<style>` is Tela de Agendamento's `cfg-*` block, with these differences:
- `.cfg-opt` padding .625rem;
- `.cfg-content` gap .625rem below 768px;
- `.cfg-opt-list` separators.

`inline-styles.css` scopes them to `#org-settings-panel`.
