<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Seiri

Prototype of Seiri, an online scheduling system, rebuilt screen by screen from the eAgenda dashboard
(eagenda.com.br). There is no backend: every screen reads and writes the browser's localStorage.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **Styling:** the original's own class names (`hbtn`, `htable-row`, `hchip`...), compiled into
  `src/app/eagenda.css` by `scripts/build-css-eagenda.sh`; Tailwind CSS v4 utilities for the rest
- **Icons:** SVGs extracted from the original in `src/components/sites/eagenda-com-br-a1f95f96/shared/icons.tsx`
- **Libraries:** chart.js (charts), ckeditor5 (rich text), intl-tel-input (phone field),
  qrcode, lottie-web (onboarding animations), lucide-react (a few icons)
- **Deployment:** GitHub Pages, as a static export (`.github/workflows/pages.yml`),
  at https://alisonasato.github.io/Agenda/

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm test` — Unit tests: every `*.test.mjs` under `src/`, via `node --test`
- `npm run check` — Run lint + typecheck + tests + build (what CI runs)
- `GITHUB_PAGES=1 npx next build` — Static export to `out/`, as Pages builds it

`next dev` does not hydrate routes that use `<Suspense>` + `useSearchParams`; verify those on the
static export (see `docs/DATA-LAYER.md`, "Notas de ambiente").

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Reuse the original's classes from `eagenda.css` before adding Tailwind utilities; no inline styles
- 2-space indentation
- Responsive: mobile-first
- Links to the app's own files outside `next/link` (plain `<a>`, `<img>`, `fetch()`) go through
  `withBase()` from `src/lib/basePath.ts`, so they work under `/Agenda` on Pages

## Design Principles
- **Pixel-perfect emulation** — match the original's spacing, colors, typography exactly
- **No personal aesthetic changes** — match 1:1 first, customize later
- **Real content** — use the original's actual text and assets, never placeholders; when something
  could not be seen in the original (e.g. a table row on an empty account), say so in that page's notes

## Project Structure
```
src/
  app/                                   # one route per cloned screen
    eagenda.css                          # the original's compiled styles (generated)
    globals.css                          # Tailwind entry and the theme tokens behind bg-primary, rounded-xl...
  components/sites/eagenda-com-br-a1f95f96/
    <page-key>/                          # components of one screen
    shared/                              # shell, sidebar, topbar, modals, inputs, icons
  lib/
    basePath.ts                          # withBase() for the Pages sub-path
    seiri/                               # data layer: types, seed, localStorage store, rules
  types/                                 # declarations for untyped packages
public/
  brand/                                 # Seiri logo and favicon
  sites/eagenda-com-br-a1f95f96/         # assets downloaded from the original, per screen
docs/
  FUNCIONALIDADES.md                     # user guide: what every screen lets you do, and its limits
  DATA-LAYER.md                          # how the data layer works, collection by collection
  database/                              # proposed PostgreSQL schema (schema.sql) and its diagrams
  research/eagenda-com-br-a1f95f96/      # per-screen notes: PAGE_TOPOLOGY, BEHAVIORS, component specs
  design-references/                     # screenshots (written by /clone-website)
scripts/                                 # CSS build and asset download scripts
```

## Adding a screen
New screens are cloned with `/clone-website` (`.claude/skills/clone-website/SKILL.md`), which writes
the notes under `docs/research/` before building. Screens that need data add a collection to
`src/lib/seiri/types.ts` and `seed.ts` and a section to `docs/DATA-LAYER.md`.

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
