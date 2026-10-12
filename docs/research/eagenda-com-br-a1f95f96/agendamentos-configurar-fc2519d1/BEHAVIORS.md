# /agendamentos/configurar/ — Behaviors

## Data (fase de lógica)
- Os cartões saem das agendas do navegador (docs/DATA-LAYER.md). Agendamentos futuros, horários
  livres, última data, duração, máximo por horário e a lista de serviços são calculados dos dados;
  aviso, dados solicitados e notificações continuam vindo do mock da captura.
- Busca e o filtro de status (Todas/Ativas/Inativas) filtram os cartões e a tabela.

## Revisto em 26/09/2026
O original tirou os filtros Unidade / Serviço / Usuário / Filtros desta barra: sobraram
**Nova Agenda**, **Organizar** e o menu **Configurações**. O clone acompanhou.

- **Organizar** abre "Organizar agendas" (lg): a lista numerada com setas para cima e para baixo,
  "Arraste pela alça ou use as setas…", e "Salvar ordem" grava a ordem, que é a ordem em que os
  cards e as outras telas listam as agendas.
- **Configurações** abre o menu do original: Serviços · Tags · Endereços · Acessos · Feriados ·
  Limites, cada um para a sua tela.
- **Horários de atendimento** no card agora vêm de `data.hours`: as abas da lombada acendem
  (`is-on`) nos dias com expediente e as linhas saem como no original ("Seg–Sab · 07:00–18:00"),
  agrupando dias que têm o mesmo horário. Com horários configurados o chip passa de "Problemas" para
  **"Funcionando"**.
- No rodapé do card, **Desativar** alterna a agenda (ela passa a aparecer só em "Inativas") e
  **Excluir** remove. **Configurar**, **Ver Agenda** e "Ver/Editar todos os horários" levam às telas
  correspondentes.

- **Atualizar** (ícone de setas circulares, `RefreshIcon`; antes estava o `ActivityIcon`, de linhas)
  abre um diálogo de alerta de destaque, e o original tem dois, um por visão (capturado em
  10/10/2026; o botão traz `data-agenda-action`, e a confirmação posta e recarrega a tela):
  - **Cartões** (`update`, POST `/agendamentos/atualizar_agenda/<id>`): "Atualizar agenda?" — "**Nome**
    terá os horários disponíveis reprocessados." — Cancelar / Atualizar. Se a agenda já está na fila
    (`data-agenda-queued="1"`), o mesmo diálogo vira "Atualização já solicitada" — "**Nome** já está na
    fila para atualizar — aguarde a conclusão do processo." — com o ícone de relógio e só **Fechar**.
  - **Tabela** (`generate`, POST `/agendamentos/gerardatas/<id>`): "Recalcular horários?" — "**Nome**
    terá os horários disponíveis para agendamento recalculados." — Cancelar / Atualizar, sem estado de fila.

  O clone não tem o que reprocessar: os horários livres saem dos horários da semana a cada leitura.
  Confirmar só fecha o diálogo; nos cartões a agenda fica "na fila" por 5 s (simulado, sem trabalhador)
  e, se o botão for clicado nesse intervalo, mostra "Atualização já solicitada". A fila não persiste:
  recarregar a página a esvazia. A confirmação não foi acionada no original, para não enfileirar nada
  na conta.
- **Desativar / Ativar / Excluir** pedem confirmação num diálogo de alerta pequeno nas duas visões
  (lidos no DOM do original em 10/10/2026; a confirmação posta e recarrega a tela, e não foi acionada):
  - "Desativar agenda?" (ícone de pausa, tom `danger`) — "**Nome** deixa de aceitar novos agendamentos e
    sai do ar para os clientes." — Cancelar / **Desativar** (`hbtn--danger`);
  - "Ativar agenda?" (ícone de play, tom `success`) — "**Nome** volta a aceitar novos agendamentos." —
    Cancelar / **Ativar** (`hbtn--success`);
  - "Excluir agenda?" (lixeira, tom `danger`) — "**Nome** será excluída permanentemente — esta ação
    não pode ser desfeita." — Cancelar / **Excluir** (`hbtn--danger`).
  Cancelar, o X e Esc fecham sem mexer na agenda; confirmar desativa, ativa ou remove.
  Remover chama `removeAgenda()` (`src/lib/seiri/agendas.ts`), que leva também o que é da agenda e a tira
  das listas que a citam; o que o original faz com os agendamentos dela não foi visto (ver
  `docs/DATA-LAYER.md`, "Excluir agenda").
- Ícones: **Desativar** é o círculo com duas barras (pausa; o clone usava o círculo com X) e **Excluir**
  é a lixeira, nas duas visões. O original só tem uma agenda ativa, então o botão de uma agenda
  **inativa** não foi visto: o clone usa o círculo com play (o do diálogo "Ativar agenda?"), título
  "Ativar" e mantém a classe `btn-icon-warning` do botão de desativar — nada disso é medido.

## Verificação
No build estático: o menu Configurações lista os seis destinos; Organizar troca a ordem e o store e
os cards seguem ("Unidade Centro" passou para o primeiro); Desativar deixa a agenda só na aba
"Inativas"; as abas da lombada acendem de segunda a sábado e ficam apagadas no domingo.

## Scroll sweep
- Ordinary page scroll (doc height 905 at 1440×900, 1139 at 390); no scroll-driven effects.
- The action bar is a rail with `.hrail-arrow` buttons when it overflows.

## Click sweep
- **Cards / Tabela:** switches `#agendas-container`; `.htabs-indicator` slides like every other tab bar.
  The table lists Agenda · Status · Horários · Serviços · Max/Hora · Min Ant. · Max Ant. · Intervalo ·
  Período · Confirmar · Dados Solicitados · Formulários · Ações.
- **Todas / Ativas / Inativas:** `.htag--active` filters the cards.
- **Unidade · Serviço · Usuário · Filtros · Configurações:** searchable popovers (240px) with
  "Limpar"/"Concluir"; empty ones show "Nenhum resultado encontrado".
- **Limpar filtros:** resets search and status.
- **Card:** weekday tabs, "Ver/Editar todos os horários", quick icons, Configurar, Ver Agenda and
  the update/deactivate/delete buttons all open modals or other pages on the live site.

## Hover states
- `.hnote-vital` and `.hnote-tab` highlight on hover; the "Problemas" chip has
  `hover:brightness-95` and a pointer cursor.

## Per-state content
- The live agenda has no schedule, so the card shows "Nenhum horário configurado", zero vitals,
  "—" for Última data, and a warning chip "Problemas" next to "Videoconferência".
- Card rules: Duração 30min · Opções a cada 30min · Máx./horário 1 · Antecedência 1h – 7 dia(s).
- Facts: "Pede ao cliente: Nome · email · telefone · cpf · endereço" and the notification
  on/off row (Confirmar off · Novos on · E-mail off).

## Responsive sweep
- **1440:** two cards per row (518×618 each), the spine tabs sit outside the page at x−26.
- **1024–1439:** still two columns (`lg:grid-cols-2`).
- **<1024:** single column with `pl-7` so the spine tabs stay visible; card 330 wide at 390,
  no horizontal page scroll.

## Links (fase de lógica)
- O nome da agenda e o botão **Configurar** de cada linha abrem a configuração daquela agenda
  (`?id=`), e o botão de link público do card abre o endereço da agenda, o mesmo que a tela de
  Links de Agendamento monta.
