# /agendamentos/link_agendamento/ — Behaviors

## Scroll sweep
- Ordinary page scroll (doc height 900 at 1440×900, 1039 at 390); no scroll-driven effects.

## Click sweep
- **Copiar / WhatsApp / QR Code / Abrir** on every `.hlinkfield`: copy uses the clipboard, QR opens a
  modal on the live site (out of scope in the clone), "abrir" opens the public page in a new tab.
- **Selecionar agendas:** `.hms` field opens a 494px popover with search, options
  ("Agenda Principal (sem identificador)"), a "N selecionados" counter and "Concluir".
  Picked agendas become chips with an "×"; a clear button empties them.
- **Gerar:** fills `#generated-link` with the segmented URL and enables Copiar and WhatsApp
  (both start `disabled`).
- **Accordion:** each agenda is a `<details>`; the chevron rotates 180° when open.
- **Salvar (identificador):** posts on the live site; the clone stores the slug in component state,
  which also drops the "Sem identificador" chip.

## Hover states
- `summary:hover` gets `bg-gray-50`; ghost icon buttons follow the shared `.hbtn--ghost` rules.

## Per-state content
- The live agenda has no slug, so it shows the warning chip "Sem identificador" and the hint
  "Defina um identificador para gerar o link amigável desta agenda."
- `.halert--warning` exists but stays empty/hidden until the generator has something to report.

## Responsive sweep
- **1440:** two cards side by side (526×238); "Todas as Agendas" row is horizontal.
- **1024–1439:** same two columns (`lg:grid-cols-2`).
- **<1024:** single column; the "Todas as Agendas" card stacks its label over the link field;
  buttons wrap. Card 342 wide at 390, no horizontal page scroll.
