# Integrações — Behaviors

## Tabs and search
- **Tabs** switch client-side. Both panels stay mounted (x-show), and the indicator slides.
- **Search** is accent-insensitive (NFD without diacritics) and matches each card's keywords.
  Cards that don't match get `display:none`. With no matches, the "Nenhuma integração
  encontrada" block and its "Limpar busca" button show.
  - That block has an x-transition (opacity and scale 0.95) on the original. The clone
    shows it without the transition.

## Links
- Every Conectar/Configurar button leads to an integration page, and none is cloned yet, so
  they link to `#`.
- Documentação and Suporte also link to `#`. They pointed at eAgenda's own docs and contact
  pages.

## Not cloned
- The team tab's "Sincronização iniciada" toast.
- The "team video agendas" modal.

Both only follow actions on a member row, and the owner's row has none.

## Brand assets
Logos for Google Calendar, Microsoft Teams, Zoom, RD Station and Mercado Pago are
third-party trademarks. That's fine for the internal prototype; check each brand's usage
rules before shipping.

## Shared fix found here
`scripts/extract-css-eagenda.mjs` no longer requires classes that appear inside `:not(...)`.
Rules like `.htabs:not(.htabs--vertical) .htabs-tab-icon` were being dropped, which lost the
tab icon's 6px margin. This also restored the original's active sidebar item (blue, bold),
which was missing on every page.

## Data (fase de lógica)
- `data.integrations` guarda quais integrações estão conectadas. O chip de cada card passa de
  "Não conectado" para "Conectado" e o botão vira "Desconectar".
- A aba **Integrações da Equipe** lista os membros da conta com o cargo, as integrações conectadas
  em chips e quantas agendas cada um alcança.
- A busca por palavras-chave continua como no original, com o mesmo estado vazio quando nada casa.

## Verificação
No build estático: conectar o Google Calendar troca o chip e o botão do card, e a aba da equipe
passa a mostrar o chip "Google Calendar" nas duas linhas de membro.

## Diferenças em relação ao original
- No original cada "Conectar" leva a uma página própria da integração (OAuth, chaves, webhooks);
  nenhuma delas foi clonada, então aqui o próprio card liga e desliga a integração.
- Por isso a conexão não faz nada além de ficar registrada: não há serviço do outro lado.
- O original guarda a integração por membro; aqui ela é da conta, e a aba da equipe mostra o mesmo
  conjunto para todos.
