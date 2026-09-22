# /onboarding/ — Page Topology

Source: requires login; captured 2026-09-22. Route: `/onboarding` (sidebar entry Ajuda › Passo a Passo).
The wizard drops the dashboard shell: no sidebar, no topbar, no footer. It loads the same
`dashboard.css` plus an inline `<style>` block of its own (fonts, `onb-*` animations, thin scrollbar).

## Layout
```
main.relative.h-full.flex.flex-col.overflow-hidden
├ header          logo · divisor · avatar + nome da conta + "Configuração inicial" · Sair
├ stepper         7 bolinhas + rótulo da etapa (só na fase "config")
└ div.relative.flex-1.overflow-hidden
  └ #step-wrapper > #step-content.overflow-y-auto.onb-scroll
    └ section.min-h-full (a etapa atual, centralizada)
```

## The 7 steps
`Início · Perfil · Agenda · Horários · Atendimento · Avisos · Google Agenda`, lidos de
`#onb-step-labels`. Cada etapa é um partial servido por htmx; o avanço é um **POST** para
`/onboarding/` que grava a resposta na conta. O clone traz a **etapa 1** — as outras exigiriam
gravar dados numa conta real para serem capturadas.

## Step 1 — two phases
| Fase | Conteúdo |
|---|---|
| `ask` | Lottie de boas-vindas, "VAMOS PREPARAR SUA AGENDA", saudação, Começar a configuração · Pular e configurar depois |
| `config` | "ETAPA 1 DE 7", "Como você vai usar o Seiri?", dois cartões (Para mim · Para equipes) e Voltar |

A troca é local (Alpine `phase`), sem requisição. O indicador de etapas só aparece na fase
`config` (`dotsVisible()` = `stepPhase === 'config'`).

## Interaction model
| Section | Model |
|---|---|
| Começar a configuração / Voltar | click-driven: alterna a fase da etapa 1 |
| Cartões de uso | click-driven: submit da etapa (POST no original; sem efeito no clone) |
| Sair / Pular e configurar depois | click-driven: abre o alert dialog "Quer continuar depois?" |
| Bolinhas | só clicáveis para etapas já cumpridas (`stepReachable`); na etapa 1 ficam travadas |
