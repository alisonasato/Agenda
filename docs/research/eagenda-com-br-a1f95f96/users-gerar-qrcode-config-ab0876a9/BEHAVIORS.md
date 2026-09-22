# /users/gerar-qrcode-config/ — Behaviors

## Scroll sweep
- Em 1440×900 a página cabe na viewport (doc 900). Em 390×844 os dois cartões empilham e a página
  rola (doc 999 no original, 983 no clone porque o nome fictício da plataforma ocupa uma linha a menos).
- Sem efeitos ligados ao scroll.

## Click sweep
- Único elemento clicável é o selo da Google Play: `href="#"`, `target="_blank"`, hover reduz a
  opacidade para 90%.

## Hover states
- Selo: `hover:opacity-90` com transição de 200ms. Os cartões e os números não reagem.

## Responsive sweep
- **1440:** grade de 5 colunas — passos em 3 (633.6px) e QR em 2 (414.4px), altura 440px.
- **1024 e abaixo:** `lg:` deixa de valer e os cartões empilham em largura total.
- **390:** cartões de 342px, QR centralizado em 176×176.

## Verification
Medido contra o site ao vivo em 1440×900 e 390×844: grade, cartões, lista, selo (40×44) e QR (176×176)
batem; só a nota final difere em largura, porque o texto cita a plataforma fictícia.
