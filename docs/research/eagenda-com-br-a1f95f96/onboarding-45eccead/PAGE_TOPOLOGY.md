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
Rótulos (de `#onb-step-labels`): `Início · Perfil · Agenda · Horários · Atendimento · Avisos · Google Agenda`.

| # | Chave | Fase "ask" | Fase "config" |
|---|---|---|---|
| 1 | `usage_mode` | boas-vindas (Lottie `hello`) | Para mim · Para equipes |
| 2 | `profile` | Personalizar agora · Deixar para depois | logo, cor, contatos e mensagem |
| 3 | `services` | Ofereço serviços · Agendamento único (Lottie `services`) | nome da agenda → lista de serviços **ou** duração |
| 4 | `schedule` | Definir meus horários (Lottie `agenda`) | dias → horários, fuso e janela de agendamento |
| 5 | `location` | Presencial · Online · Os dois (sem Lottie) | endereço (CEP) e/ou plataforma de vídeo |
| 6 | `notifications` | Sim, quero avisar · Não, aviso por conta própria (Lottie `alert`) | avisos automáticos → dados do cliente |
| 7 | `integration` | Sim, sincronizar com o Google · Agora não (Lottie `google`) | — (envia direto) |
| — | `finish` | "Sua agenda está no ar!" (Lottie `congrats`) | — |

No original cada avanço é um **POST** para `/onboarding/` (htmx troca `#step-content`); `Voltar` entre
etapas é um **GET** `/onboarding/?step=N`, liberado só para etapas já cumpridas. O clone faz a mesma
navegação em memória, sem enviar nada.

## Interaction model
| Section | Model |
|---|---|
| Cartões de escolha | click-driven: definem o caminho e abrem a fase "config" |
| Sub-passos (3, 4 e 6) | click-driven: "Próximo"/"Continuar" trocam o bloco sem sair da etapa |
| Campos | input-driven: CEP consulta o ViaCEP, o contador da mensagem conta caracteres |
| Bolinhas | só clicáveis para etapas já cumpridas; na primeira visita ficam travadas |
| Sair / Pular | click-driven: abrem o alert dialog "Quer continuar depois?" |

## Revisiting
Numa conta já configurada (o caminho real de Ajuda › Passo a Passo) o servidor devolve cada etapa já
na fase "config", com os dados salvos preenchidos. O clone sempre começa na fase "ask" com dados
fictícios, que é o estado de uma conta nova.
