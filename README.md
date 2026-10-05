# Seiri

Protótipo do Seiri, um sistema de agendamento online, em Next.js 16 (App Router, React 19,
TypeScript) com Tailwind CSS v4.

## Estado atual

A interface está sendo construída tela a tela a partir de uma referência visual. Ainda não há
backend: os dados de exemplo são fictícios e as alterações ficam salvas só no navegador
(localStorage) — ver `docs/DATA-LAYER.md`.

Versão publicada: https://alisonasato.github.io/Agenda/ (GitHub Pages, atualizada a cada push em
`main`).

## Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run lint       # ESLint
npm run typecheck  # checagem de tipos
npm run check      # lint + typecheck + testes + build (o mesmo que o CI roda)
GITHUB_PAGES=1 npx next build   # export estático em out/, como o GitHub Pages
npm test                        # testes unitários (todos os *.test.mjs em src/)
```

## Estrutura

```
src/app/                 # rotas (uma por tela) e eagenda.css, o CSS gerado a partir do original
src/components/sites/    # componentes das telas (shared/ = peças reutilizadas)
src/lib/seiri/           # camada de dados: tipos, dados iniciais, localStorage e regras
public/                  # marca do Seiri e imagens/dados baixados do original
docs/FUNCIONALIDADES.md  # guia de tudo o que dá para fazer, tela por tela
docs/DATA-LAYER.md       # como a camada de dados funciona
docs/database/           # proposta de banco PostgreSQL: schema.sql e diagramas
docs/research/           # notas de extração e verificação de cada tela
scripts/                 # geração do CSS e download de dados
```

Instruções para agentes de IA: `AGENTS.md` (importado por `CLAUDE.md`).

## Créditos

Iniciado a partir do [AI Website Cloner Template](https://github.com/JCodesMore/ai-website-cloner-template)
(licença MIT, ver `LICENSE`).
