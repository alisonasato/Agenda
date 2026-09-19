# Comunicação › Modelos de Email — Behaviors

## Corpo do Email (CKEditor)
The original uses CKEditor 5 **v43.2.0**, loaded by django_ckeditor_5. The clone installs the
same version from npm (`ckeditor5@43.2.0`) and reuses the original's configuration:
- the toolbar, in the same order: heading | bold italic link bulletedList numberedList blockQuote
  undo redo fontFamily fontSize fontColor fontBackgroundColor alignment | sourceEditing;
- the heading, font-family and font-size options.

Other details:
- The toolbar groups the overflow into "⋮", as the original does. At 1440 inside the modal, 11
  items stay visible.
- The UI is in Portuguese (pt-BR translation bundle). This is a deliberate product choice: the
  original loads no translation and shows English.
- The original's page `<style>` (`.het-*`) is copied verbatim into `inline-styles.css`. It
  restyles the toolbar and editable with HeroUI borders and gives them the shared `--het-h`
  height.

Licensing: ckeditor5 is GPL-2.0-or-later (v43 needs no license key). That is fine for the
internal prototype; a commercial product needs a commercial license or another editor.

## Exemplo de Texto
Picking an example replaces the editor body. The live page fetches
`/users/get-example-text/?example_type=…`; the clone inlines the three responses and sets
`<p>…</p>`. The field is not clearable.

## Variables
Clicking a variable inserts `{{code}}` at the caret and focuses the editor, as the original
does.

## Not cloned
- The "Prévia do Email" modal and the delete dialog: they are only reachable from a template
  row, and the account has none.
