# BookingScreenSettings

`src/components/sites/eagenda-com-br-a1f95f96/users-tela_agendamento-d0985e23/BookingScreenSettings.tsx`

## State
- `tab`, and `flow` (with `effective` / `isNew` / `isLegacy` / `isModern`).
- `dirty`: set by the form's `onChange` and by the custom fields' callbacks.
- `preset`, `colors`, `showAdvanced`.
- `country`, `state`, `city`, the lazily loaded `cities`, `cep` and `cepStatus`.

## Local parts
`Group` (cfg-group), `TextField` (hinput), `Option` (cfg-opt plus hcheckbox), the radius tile
data and the colour data.

## Shared pieces introduced or changed here
- New:
  - `PhoneInput`, `ColorPicker`, `FilePicker`;
  - `RichTextEditor`, which replaces the Email Templates-only `EmailEditor`;
  - the icons `CheckboxMark`, `ExternalLinkIcon`, `GalleryIcon` and `FlowIcon`.
- `CheckboxMark` is the original's polyline tick, drawn in by CSS. Every `hcheckbox` in the
  clone now uses it; before, it used `CheckReadIcon`, a different glyph with no animation.
- `SaveBar`: see BEHAVIORS.
- `src/types/intl-tel-input.d.ts`: types for the two intl-tel-input build files.
