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

## Data (fase de lógica)
- Os oito passos gravam em `data.orgSettings`, um mapa por nome de campo — é o mesmo formato que o
  original posta, e evita inventar um tipo para cada uma das dezenas de opções.
- **Salvar** guarda todos os campos nomeados do passo aberto, caixas incluídas, e o toast passa a
  "Configurações salvas".
- Cada campo reabre no que foi salvo: os textos e números pelo próprio helper, as caixas pelo
  `Check`, e os seletores de cada passo (segmento, termo do cliente, modo de uso, país, fuso,
  idioma, modelo da página, modelo da agenda, primeiro dia e fluxo) pelo estado inicial deles.

## Verificação
No build estático: marcar "Usar Captcha" no passo Privacidade e salvar grava
`is_use_captcha: true` junto com as outras caixas do passo; recarregar a página e voltar ao passo
traz a caixa marcada.

## Diferenças em relação ao original
- O que é gravado fica guardado, mas quase nada disso muda o resto do clone: o original usa esses
  campos na página pública de agendamento, que não faz parte deste clone.
- SMTP, dados fiscais e o preset de cores do segmento são guardados sem efeito, pelo mesmo motivo.
