# EmailTemplates

`src/components/sites/eagenda-com-br-a1f95f96/notificacao-email_template-5993b09f/`

## EmailTemplates.tsx
- **Listing:** the filter form, the `ScrollRail` action bar (3 links) and the empty `htable`.
- **EmailTemplateModal:**
  - uses the shared `Modal`, which gains a `size` prop (`lg` stays the default; this modal
    passes `4xl`);
  - uses the `Combobox` with `searchInPopover`;
  - its state is `example`, plus an `editorRef` for the example text and variable insertion.

## Editor
The body field uses `shared/RichTextEditor` (it was a local `EmailEditor` until Tela de Agendamento needed the same editor), loaded with `next/dynamic` and `ssr: false`.
