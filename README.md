# Seiri

Protótipo do Seiri, um sistema de agendamento online, em Next.js 16 (App Router, React 19,
TypeScript) com Tailwind CSS v4.

## Estado atual

A interface está sendo construída tela a tela a partir de uma referência visual. Ainda não há
backend: os dados são fictícios e nada é salvo.

## Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run lint       # ESLint
npm run typecheck  # checagem de tipos
npm run check      # lint + typecheck + build
```

## Estrutura

```
src/app/                 # rotas
src/components/sites/    # componentes das telas (shared/ = peças reutilizadas)
public/                  # imagens, dados geográficos e marca
docs/research/           # notas de extração e verificação de cada tela
scripts/                 # geração do CSS e download de dados
```

Instruções para agentes de IA: `AGENTS.md` (importado por `CLAUDE.md`).

## Créditos

Iniciado a partir do [AI Website Cloner Template](https://github.com/JCodesMore/ai-website-cloner-template)
(licença MIT, ver `LICENSE`).
