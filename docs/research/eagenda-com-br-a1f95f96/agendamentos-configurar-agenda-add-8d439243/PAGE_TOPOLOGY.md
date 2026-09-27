# /agendamentos/configurar/agenda/add?version=3 — Page Topology

Source: requires login; captured 26/09/2026 pelo botão "Nova Agenda" da tela de configuração de
agendas. É a mesma página que o botão "Configurar" de cada card abre, lá com a agenda carregada
(`/agendamentos/configurar_agenda/E<id>` no original).

## Rota
Aqui a página é `/agendamentos/configurar/agenda/add/`, e editar uma agenda existente é
`?id=<agenda>` — um export estático não publica uma página por agenda.

## Layout
```
DashboardShell (título "Configurações Gerais da Agenda"; "Configuração" ativo)
└ div.relative.mx-auto.w-full.max-w-[1550px].px-6.py-8.lg:px-10
  └ div.cfg-grid.lg:grid.lg:grid-cols-[19rem_minmax(0,1fr)]
    ├ div.cfg-nav-col > nav.cfg-nav--stepper > ol.hstepper.hstepper--lg.hstepper--responsive.hstepper--nav
    │   1 Básicas · 2 Horários · 3 Formulários · 4 Notificações · 5 Avançadas · 6 Acessos
    └ div > form.cfg-form
      ├ div.cfg-content   sete section.cfg-group
      └ div.hsavebar      Voltar / Salvar
```

Os sete blocos do passo "Básicas", cada um `section.cfg-group` com
`.cfg-group-head > h3.cfg-group-title` (+ `p.cfg-group-desc` quando há) e `.cfg-group-body`:

1. **Copiar de outra agenda** — "Agenda de origem" (combobox) + botão "Copiar".
2. **Identificação da agenda** — Nome* e Slug (`hslug-field` com o prefixo do endereço público).
3. **Serviços** — multisseleção em chips; escolhido algum, aparecem Seleção Máxima, Duração Total e
   Valor Total.
4. **Opções da agenda** — Videoconferência · Flexível · Atendimento em domicílio · Confirmar
   Agendamento.
5. **Responsáveis** — Proprietário da agenda e Unidade.
6. **Endereço de Atendimento** — grupo de rádio e a linha "Endereço padrão da conta: não cadastrado".
7. **Descrição** — texto exibido na página de agendamento.

## Interaction model
| Seção | Modelo |
|---|---|
| Stepper | o original habilita um passo por vez; só "Básicas" está clonado, os outros ficam desabilitados |
| Nome → Slug | o slug segue o nome até alguém editá-lo à mão |
| Serviços | os totais só aparecem com serviço escolhido, como no original |
| Save bar | o mesmo `hsavebar` das outras telas de formulário |
