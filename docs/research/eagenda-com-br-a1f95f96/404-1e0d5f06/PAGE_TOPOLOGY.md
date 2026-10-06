# 404 — Page Topology

Source: any unknown path on `https://eagenda.com.br/`, e.g. `/rota-que-nao-existe/`
Route: `src/app/not-found.tsx`, which the static export writes as `404.html` and GitHub Pages
serves for every unknown path
Page key: `404-1e0d5f06` (keyed on `/404` for a stable name; the original has no canonical path
for it)

## Shell
None. The original's 404 has no sidebar and no topbar: it is its own full-screen page on
`bg-gray-50`. In the clone the app's `<body>` is a flex row for the dashboard shell, so the page
takes `flex-1 w-full` to claim the whole row.

## Sections
A single centred `max-w-lg` column (`min-h-screen flex items-center justify-center`):

1. A `w-20 h-20 rounded-full bg-primary/10` badge holding a 48px outlined warning-circle icon
   (`text-primary animate-spin-slow`).
2. `<h1>` "404" in `text-6xl font-extrabold text-primary`, entering with `animate-fade-in-delay`.
3. `<h2>` "Página não encontrada".
4. The two-line apology: "Desculpe, não conseguimos encontrar a página que você procurava." /
   "Verifique o endereço ou volte para a página inicial."
5. Two buttons, stacked on a phone and side by side from `sm`: "Voltar para o início"
   (`bg-primary text-white`) and "Voltar para a página anterior" (`bg-white border border-primary
   text-primary`, calling `history.back()`).

## Animations
The original defines its own, which are **not** Tailwind's defaults; they live in `globals.css`
under `seiri-` keyframe names so they cannot shadow the utilities the rest of the app uses:

| class | animation |
| --- | --- |
| `animate-fade-in` | `0.7s ease` — opacity 0 and `translateY(30px)` to rest |
| `animate-fade-in-delay` | the same, `1.2s ease 0.3s backwards` |
| `animate-bounce-soft` | `1.2s ease infinite alternate`, to `translateY(-10px)` (the original calls this `animate-bounce`, overriding Tailwind's) |
| `animate-spin-slow` | `2.5s linear infinite` |

## Deviations
- "Voltar para o início" points at the clone's dashboard (`/`), where the original points at
  `/painel/`.
- The palette is Seiri's blue; the original's is its orange.
