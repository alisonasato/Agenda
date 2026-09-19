# Integrações — Page Topology

Source: `https://eagenda.com.br/integracoes/?version=3`
Route: `/integracoes` (title "Integrações e Apps")
Page key: `integracoes-526c97c5`

## Shell
`DashboardShell`, with the sidebar on Integrações.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **Header row:**
   - `htabs` with two tabs: Integrações (plug icon) and Integrações da Equipe (users icon),
     plus the sliding indicator;
   - `hui-search` "Buscar integrações...", shown only on the first tab.
2. **Integrações tab:**
   - **Card grid** (1/2/3 columns). There are 10 cards, each with:
     - the logo and name;
     - a "Não conectado" chip (Emails also has "Requer plano");
     - a description;
     - a Conectar/Configurar button.
   - Logos are downloaded to `public/sites/eagenda-com-br-a1f95f96/integracoes-526c97c5/`.
     WideChat has no logo and uses a chat icon in a slate box.
   - "Nenhuma integração encontrada" block, shown when a search matches nothing.
   - `halert--accent` with the Documentação and Suporte buttons.
3. **Integrações da Equipe tab:**
   - An `htable` of members: Membro / Cargo / Integrações / Agendas / Ações.
   - Only the owner is listed, as mock "Maria Souza".
   - The original loads it over htmx the first time the tab opens.

## Verified measurements (live vs. clone)

| Element | 1440 | 390 |
|---|---|---|
| tabs (1st / 2nd active) | 397.56 / 404.34 wide | 342 wide |
| cards | 340.66×217, 3 per row, 20px gap | 342×213 stacked |
| alert | 1062×56 at y 1120 | 342×128 |
| document height | 1253 (1st tab) / 900 (team) | 2683 / 875 |
| team table / row | 1072×606 / 56 tall | 342×606 |
| no-results block | 1072×252 | — |

Every value is identical on both, except one. At 390 the team row width follows its text:
the clone's is 515.5 and the live is 506.23, because the clone's name and email are mock
values.
