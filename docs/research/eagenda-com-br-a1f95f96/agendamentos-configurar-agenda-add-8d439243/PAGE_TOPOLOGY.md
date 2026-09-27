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

## Passo 2 — Horários
Quatro blocos, capturados em 27/09/2026 em `/agendamentos/configurar_agenda/E<id>` (é lá que os
passos 2 a 6 ficam habilitados):

1. **Configuração de Horários** — "Duração, intervalos e capacidade dos atendimentos.": Duração do
   Atendimento (min) · Intervalo entre Atendimentos (min) · Agendamentos por Horário ·
   Granularidade dos Horários (min), cada um com a sua explicação.
2. **Restrições de Agendamento** — "Quando os clientes podem agendar e cancelar.": Antecedência
   Mínima (horas) · Antecedência Máxima (dias) · Horário de Liberação (hora) · Tempo Mínimo para
   Cancelar (horas) · Prazo Máximo para Cancelar (horas); as caixas Antecedência em dias úteis ·
   Bloquear feriados nacionais · Bloquear feriados estaduais; e Data de início / Data de fim.
3. **Tabela de Horários Semanal** — os botões "Copiar Seg → Ter a Sex", "Copiar Seg → Ter a Dom" e
   "Adicionar Horário" sobre a tabela Dia · Início · Fim · Por Horário · Horários Gerados · Ações,
   uma linha por dia da semana.
4. **Horários Extras e Limites** — "Datas específicas fora da grade semanal e regras de volume de
   agendamentos.", com as tabelas vazias.

## Passos 3 a 6
- **Formulários**: "Dados solicitados no agendamento" — treze caixas numa grade de três colunas
  (e-mail, telefone e os dois "obrigatório", CPF, documento, data de nascimento, gênero,
  nacionalidade, naturalidade, profissão, endereço e campo texto adicional) — e "Formulários", com o
  botão "Gerenciar formulários" e os quatro seletores (Formulário de Agendamento, Pré-atendimento,
  Atendimento interno, Pesquisa de satisfação) sobre o aviso de que não há formulário cadastrado.
- **Notificações**: "Notificações internas" (Notificar internamente · Notificar por e-mail · E-mail
  CC · SMS CC), "Notificações para clientes" (E-mail para o cliente), e as tabelas "Regras de
  lembrete" e "Regras de status", cada uma com o seu botão "Gerenciar".
- **Avançadas**: Privacidade e Acesso · Distribuição de Agendamentos · Acompanhantes · Capacidade e
  Modalidades · Agendas Vinculadas · Pagamento.
- **Acessos**: "Responsável e acesso", com Usuário Responsável e Usuários com Acesso.

## Interaction model
| Seção | Modelo |
|---|---|
| Stepper | os seis passos trocam a seção ao clicar |
| Nome → Slug | o slug segue o nome até alguém editá-lo à mão |
| Serviços | os totais só aparecem com serviço escolhido, como no original |
| Save bar | o mesmo `hsavebar` das outras telas de formulário |
