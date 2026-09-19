# Conta › Tela de Agendamento — Page Topology

Source: `https://eagenda.com.br/users/tela_agendamento/?version=3`
Route: `/users/tela_agendamento`
Page key: `users-tela_agendamento-d0985e23`

## Shell
`DashboardShell`, sidebar Conta › Tela de Agendamento. The container is
`#page-content.relative.mx-auto.w-full.max-w-[1550px].px-6.py-8.lg:px-10.min-w-0`.

## Layout
`.cfg-grid` is two columns from 1024px (`19rem` plus the content, with an 8 gap):

- **Left column** (`.cfg-nav-col`, sticky at `top: 5rem`):
  - an `hstepper` with the steps Identidade, Contato, Aparência, Endereço, plus Exibição and
    Grupos, which only show for the classic and modern models;
  - an "Abrir tela pública" button.
- **Right column:**
  - the Grupos panel, outside the form;
  - `#booking-screen-form.cfg-form`, holding one panel per step and the `hsavebar`.

Below 1024px the stepper becomes a horizontal card that scrolls.

## Steps

### Identidade
- Nome / Sigla.
- Nome curto and its checkbox (not on the new model).
- Texto da Página Inicial, a CKEditor at least 300px tall.

### Contato
- E-mail, Site, Telefone and WhatsApp, the last two being `hphone` fields.
- Redes Sociais: 5 links, in up to 3 columns.

### Aparência
- **Modelo:** a combobox with Automático, Clássica, Moderna and Nova, plus an explanation.
- **Colours:**
  - The new model shows "Cor de Destaque": the main colour, Restaurar cor padrão, and "Usar
    cor de destaque no rodapé".
  - The other models show "Paleta de Cores":
    - Classic also has "Preset de cores" (Customizado/Padrão).
    - Both have the header colour and "Ver todas as cores", which expands to the secondary
      and link colours. Modern adds social, shortcut, card and banner-card colours.
- **Bordas Arredondadas:** modern only, 4 groups of radio tiles.
- **Imagens:** banner, background, mobile background (not on the new model), logo and favicon.

### Exibição (classic and modern)
- Display options.
- Card Sobreposto ao Banner (modern only).

### Endereço
- CEP, which looks up the address when the field loses focus.
- País / Estado / Município, cascading.
- Logradouro, Número, Complemento, Bairro, Distrito.

## Verified measurements (live vs. clone), all identical

| State | 1440 | 390 |
|---|---|---|
| nav column / steps / button | 304×292 / 4 × 284×58 / 284×36 | stepper card 342×84.39, 4 × 77×54.39 |
| Identidade | content 736×605.42, editor 676×355.42, H 900 | content 342×690.92, H 1181 |
| Contato | content 736×467.84 | content 342×921.69, H 1412 |
| Aparência (new) | content 726×800.56, H 1051 | content 342×1106.89, H 1597 |
| Endereço | content 736×564.19 | content 342×947.88, H 1438 |
| Aparência (modern) | 726×1133.88, 6 steps (col 304×384), H 1384 | — |
| Aparência (modern, all colours) | 726×1977.52, H 2228 | — |
| Exibição (modern) | 736×459.53 | — |
| Aparência / Exibição (classic) | 726×819.03 / 736×170.84 | — |
| Grupos | 736×350 | — |
| popovers | phone 304×271 at +6; colour 248×374 (right-aligned); Modelo 384×158; País 330×242 | — |
| save bar toast | — | 390×65 at the bottom once something changes |
