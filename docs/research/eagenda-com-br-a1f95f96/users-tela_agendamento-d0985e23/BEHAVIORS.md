# Conta › Tela de Agendamento — Behaviors

## Model (bookingFlow)
- "Automático" resolves on the server by the account's creation date. For this account that
  is the new screen ("Tela nova").
- Every model-dependent block is an x-show, so the clone keeps them mounted with
  `display:none`.
- Leaving the classic or modern model while on Exibição or Grupos jumps back to Identidade,
  as the original's `x-effect` does.

## Fields
- **Sigla:** the space key is blocked.
- **Phone (`shared/PhoneInput`):** a port of the original's `hPhoneInput`, on intl-tel-input
  **18.1.6**, the version the site loads (its CSS is byte-identical).
  - The country list and flags come from the package. The flag sprite is the package's.
  - libphonenumber (`build/js/utils.js`) loads after the field, as the original's `utilsUrl`
    does. Once it arrives, the per-country masks, digit ceiling and placeholder apply
    ("11 96123-4567" for Brazil).
  - Pasting "+DDI …" switches the country.
  - On blur the number is validated: "Número incompleto", "muito comprido", "inválido", or
    "Código de país inválido".
  - The popover opens 6px below the field (above when there is no room) and is clamped to
    the viewport.
- **Colours (`shared/ColorPicker`):** a port of `hCellColorPicker`.
  - HSV area, hue rail and 12 presets.
  - The popover is 248px wide, right-aligned with the cell, and flips up when needed.
  - "Restaurar cor padrão" sets `#111827`.
  - The "Padrão" preset (classic) restores the default theme colours.
- **Images (`shared/FilePicker`):** a port of the inline `hfilepicker`.
  - Click, keyboard or drop to pick; there is a 1 MB cap with the original's message.
  - Shows a thumbnail preview and "Descartar seleção". Nothing is uploaded.
- **Rich text (`shared/RichTextEditor`):** the Email Templates editor, now shared.
  - The site's `select3.css` makes every editor at least 300px tall. That one rule is now in
    `inline-styles.css`.
- **Location:**
  - The original's lookups are server-paginated (10 per page, infinite scroll).
  - The clone ships the same data:
    - `public/sites/eagenda-com-br-a1f95f96/shared/geo/`, downloaded by
      `scripts/download-geo-eagenda.mjs`;
    - 250 countries, Brazil's 27 states, and 5,689 cities, which load when the step opens;
    - all options are listed at once.
  - Changing the country clears Estado and Município; changing the state clears Município.
  - States and cities exist only for Brazil. The live site's city list with no state picked
    is worldwide; the clone's is empty.
- **CEP:**
  - The field masks as you type (`00000-000`). On blur, the original posts to its backend.
  - The prototype queries **ViaCEP** (public API) instead and matches state and city by
    name. It shows the original's spinner/check/cross icon and messages ("Buscando...",
    "Endereço preenchido!" for 3s, errors for 5s).
  - ViaCEP is an external service; decide before production.

## Save bar (shared `SaveBar`, fixed here for every page)
- The toast shows when the form is dirty and the dock is still **below** the viewport.
  Scrolling past the dock counts as seen.
- The toast runs edge to edge up to **640px** (it was <1024 before). This is the same
  component and code on every eAgenda page.
- Position is re-measured on scroll, resize, body resize, and every change to `dirty`.
  Before, a late-loading editor left the toast hidden.

## Not cloned
- "Abrir tela pública" goes to `/minhaempresa/` (a mock slug); the public booking screen
  isn't cloned.
- "Adicionar Etapa 1" in Grupos links to `#`, because the group editor isn't cloned.
- The popover enter transitions (scale 0.95).

## Portuguese interface (deliberate change)
- The rich-text editor UI uses CKEditor's pt-BR bundle. The original shows English.
- The phone country list shows pt-BR names (`Intl.DisplayNames`), sorted in Portuguese. The
  original shows intl-tel-input's English names, e.g. "Brazil (Brasil)".
