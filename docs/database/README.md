# Banco de dados do Seiri

Proposta de esquema relacional (PostgreSQL) para quando o Seiri tiver servidor. **Nada no app usa
isto ainda**: o protótipo continua guardando tudo no `localStorage`, como descreve
[`docs/DATA-LAYER.md`](../DATA-LAYER.md). Este esquema traduz para tabelas as coleções de
[`src/lib/seiri/types.ts`](../../src/lib/seiri/types.ts).

| Arquivo | O que tem |
|---|---|
| [`schema.sql`](schema.sql) | O esquema completo: 90 tabelas, chaves, índices e restrições |
| este README | Decisões, o mapa coleção → tabela e os diagramas |

Os diagramas abaixo foram gerados a partir do banco criado por `schema.sql`, então batem com ele
coluna por coluna. O GitHub desenha os blocos `mermaid` direto na página.

## Como criar o banco

```bash
createdb seiri
psql -d seiri -v ON_ERROR_STOP=1 -f docs/database/schema.sql
```

Usa `gen_random_uuid()`, que é nativo desde o 13.

As seções 1 a 9 foram criadas num PostgreSQL 16 de verdade, e os diagramas saíram desse banco.
A seção 10 (webhooks, domínios e importação), acrescentada depois, não passou por um servidor:
foi validada com o próprio analisador do PostgreSQL (`libpg-query`), que confirma a sintaxe, a
ordem de criação das tabelas e que toda chave estrangeira aponta para colunas com PK/UNIQUE —
mas rodar `psql -f` continua sendo a prova final.

## Decisões

- **Multiempresa.** A tabela `organizations` é o inquilino, e toda tabela com dados de uma empresa
  carrega `organization_id`. As sub-contas ("Administrar Contas") ficam dentro da organização, em
  `sub_accounts`, e agendas e membros apontam para elas como no protótipo (`accountId`).
- **Usuário ≠ membro.** `users` é quem faz login, com os dados de "Sua Conta". `members` é o vínculo
  desse usuário com uma organização: perfil, permissões e a que agendas, serviços e tags ele tem
  acesso. Assim a mesma pessoa pode trabalhar em mais de uma empresa.
- **Listas de ids viram tabelas de ligação.** `agendaIds`, `tagIds`, `serviceIds`, `clientIds`... viram
  tabelas como `service_agendas` e `appointment_tags`. A regra do protótipo continua: onde "lista
  vazia" quer dizer "todas" (limites, feriados, regras de notificação, listas de acesso, acesso de
  membros), **nenhuma linha na tabela de ligação = vale para todas**.
- **Datas de verdade.** O protótipo guarda datas como texto (`"dd/mm/aaaa hh:mm"`, `"2026-09-24T09:00"`).
  Aqui elas são `timestamptz`, `date` ou `time`. Os horários dos agendamentos são `timestamptz`; o fuso
  que a tela usa fica em `organizations.timezone` (padrão `America/Sao_Paulo`).
- **Valores fixos em `text` + `CHECK`.** Status, perfis, canais etc. Dá para acrescentar um valor sem
  migrar um tipo `ENUM`.
- **Formulários ainda soltos em `jsonb`.** "Configurações Gerais" e "Tela de Agendamento" são mapas
  de dezenas de campos de formulário no protótipo; ficam em `organization_settings` como `jsonb` até
  os campos estabilizarem. Também em `jsonb`: as respostas de um cadastro por convite e as opções de
  cada integração.
- **Contadores não são guardados.** Os medidores do plano (agendamentos e usuários usados) saem de
  `appointments` e `members`; o "Usado em" dos modelos sai das regras que apontam para eles.

## O que muda em relação ao protótipo

O protótipo simplifica coisas que um banco real não pode simplificar. Onde o esquema difere:

| No protótipo | No esquema | Por quê |
|---|---|---|
| `Appointment.owner`, `Service.members`, `TeamLog.user` são nomes ou e-mails | `member_id` apontando para `members` | Renomear alguém não pode quebrar o histórico |
| `AgendaOptions.password` em texto | `agenda_options.password_hash` | Senha nunca em texto puro |
| `SupportCode.token` em texto | `support_access_codes.token_hash`, com histórico e revogação | Idem; e "Gerar novo" revoga o anterior |
| `Credits.paymentMethod` | referência ao cartão no gateway de pagamento | O número do cartão não entra no banco |
| Envios calculados na hora (`src/lib/seiri/sends.ts`) | `message_deliveries` (**tabela nova**) | Com servidor, cada envio precisa ser registrado: para não repetir, para descontar créditos e para mostrar falhas |
| Feriados nacionais fixos no código (`holidays.ts`) | `public_holidays`, tabela de referência | Atualizar o calendário sem publicar código |
| Catálogo de planos fixo no código (`PLAN_OFFERS`, `PLAN_PRICINGS`, `PLAN_EXTRAS`, `PLAN_FEATURES`) | `plans`, `plan_prices`, `plan_addons` | Idem; `legacy_id` guarda o id do original |
| Rótulos em português como valor (`Gender`, `AGENDA_EMAIL_TYPES`, status das visitas do suporte, permissões) | códigos (`female`, `CONFIRMED`, `closed`, `clients.read`) | O rótulo é coisa da tela; o código não muda quando o texto muda |
| `Plan` é um objeto só | `subscriptions` (com histórico) + `invoices` | A aba "Histórico" e a aba "Pagamentos" passam a sair daí |
| `AgendaGroup` só tem ordem | `agenda_groups.parent_id` | Para a etapa que escolhe entre outros grupos saber quais |

## Pontos em aberto

Coisas que o protótipo ainda não define e que o esquema não inventou:

- **Acompanhantes.** As opções da agenda falam em acompanhantes (`allowCompanions`, `maxCompanions`),
  mas o protótipo não guarda acompanhantes em lugar nenhum. Quando existirem, cabem numa tabela
  `appointment_companions`.
- **Construtor de formulários.** `surveys` guarda só o que a lista mostra (nome, etapa, contagens).
  Perguntas e respostas precisam de tabelas próprias quando o construtor existir.
- **Campos de "Configurações Gerais" e da tela pública.** Quando os campos forem conhecidos, o que for
  consultado com frequência deve sair do `jsonb` para colunas.
- **Isolamento entre empresas.** O esquema tem `organization_id` em todo lugar, mas não liga o
  Row Level Security do PostgreSQL. Vale decidir junto com o backend se o isolamento fica no banco
  (RLS) ou na aplicação.
- **LGPD.** `clients` guarda CPF, data de nascimento e endereço. Falta definir retenção, exportação e
  exclusão a pedido do titular.

## Mapa coleção → tabela

Cada chave de `Data` em `src/lib/seiri/types.ts` e onde ela vai parar:

| Coleção no protótipo | Tabela(s) |
|---|---|
| `agendas` | `agendas` |
| `agendaRules` | `agenda_rules` |
| `agendaOptions` | `agenda_options`, `agenda_access_members` |
| `hours` | `agenda_working_hours` |
| `services` | `services`, `service_agendas`, `service_tags`, `service_members` |
| `tags` | `tags` |
| `units` | `units`, `addresses` |
| `clients` | `clients`, `addresses` |
| `appointments` | `appointments`, `appointment_tags`, `appointment_changes` |
| `waiting` | `waiting_list_entries` |
| `recurrences` | `recurrences`, `recurrence_clients`, `recurrence_tags` |
| `blocks` | `schedule_blocks`, `schedule_block_agendas` |
| `slotInfo` | `slot_overrides` |
| `manualHours` | `manual_hours`, `manual_hours_agendas` |
| `holidays` | `holidays`, `holiday_agendas` |
| `holidayRules` | `agenda_holiday_rules`, `agenda_holiday_skips` (+ `public_holidays`) |
| `limits` | `booking_limits`, `booking_limit_agendas`, `booking_limit_services` |
| `suppressions` | `contact_blocks` |
| `accessLists` | `access_lists`, `access_list_agendas`, `access_list_services`, `access_list_clients` |
| `notificationRules` | `notification_rules`, `notification_rule_agendas` |
| `statusRules` | `status_rules`, `status_rule_agendas` |
| `emailTemplates` | `email_templates` |
| `whatsappTemplates` | `whatsapp_templates` |
| `agendaEmails` | `agenda_email_templates` |
| — (calculado em `sends.ts`) | `message_deliveries` |
| `notifications` | `inbox_notifications` |
| `members` | `members`, `member_permissions`, `member_agendas`, `member_services`, `member_tags` |
| `userGroups` | `user_groups`, `user_group_members`, `user_group_permissions` |
| `accounts` | `sub_accounts` |
| `profile` | `users`, `user_emails`, `user_social_accounts` |
| `orgSettings`, `bookingScreen` | `organization_settings` |
| `integrations` | `organization_integrations` |
| `whatsappCode` | `organizations.whatsapp_activation_code` |
| `surveys` | `surveys`, `survey_agendas` |
| `agendaGroups` | `agenda_groups`, `agenda_group_agendas` |
| `invites` | `registration_invites`, `registration_invite_recipients`, `registration_invite_fields` |
| `submissions` | `registration_submissions` |
| `inviteEmails` | `invite_email_templates` |
| `plan`, `planHistory` | `subscriptions`, `subscription_addons` (+ catálogo `plans`, `plan_prices`, `plan_addons`) |
| `payments` | `invoices` |
| `credits` | `credit_balances` |
| `coinTransactions` | `coin_transactions` |
| `creditPurchases` | `credit_purchases` |
| `referrals` | `referrals` |
| `supportCode` | `support_access_codes` |
| `supportVisits` | `support_visits` |
| `agendaLogs` | `agenda_change_logs` |
| `teamLogs` | `team_activity_logs` |
| `clientImports` | `client_imports` |
| `webhooks` | `webhooks`, `webhook_events` |
| `domains` | `organization_domains` |

## Visão geral

As entidades centrais e como se ligam. Os diagramas por área, mais abaixo, mostram todas as colunas.

```mermaid
erDiagram
  organizations ||--o{ sub_accounts : tem
  organizations ||--o{ members : tem
  users ||--o{ members : "é membro via"
  organizations ||--o{ units : tem
  organizations ||--o{ agendas : tem
  units |o--o{ agendas : agrupa
  sub_accounts |o--o{ agendas : possui
  agendas ||--|| agenda_rules : "regras"
  agendas ||--|| agenda_options : "opções"
  agendas ||--o{ agenda_working_hours : expediente
  organizations ||--o{ services : oferece
  services }o--o{ agendas : "service_agendas"
  organizations ||--o{ clients : atende
  clients ||--o{ appointments : marca
  agendas ||--o{ appointments : recebe
  services |o--o{ appointments : "é de"
  members |o--o{ appointments : "responsável"
  recurrences |o--o{ appointments : gera
  clients ||--o{ waiting_list_entries : espera
  organizations ||--o{ subscriptions : assina
```

Nos diagramas das áreas 2 a 9, a ligação de cada tabela com `organizations` (pelo
`organization_id`) não é desenhada, para não poluir. A coluna aparece marcada como `FK`.
Tabelas de outras áreas aparecem só com o `id`.

## Diagramas por área

### 1. Organizações, usuários e equipe

A organização é o inquilino: quase toda tabela aponta para ela. `users` é quem faz login; `members` é o vínculo de um usuário com uma organização, com perfil e permissões.

```mermaid
erDiagram
  organizations {
    uuid id PK
    text name
    text slug
    text whatsapp_activation_code
    text timezone
    timestamptz created_at
  }
  sub_accounts {
    uuid id PK
    uuid organization_id FK
    text name
    text slug
    text email
    text phone
    uuid address_id FK
    text plan_status
    timestamptz created_at
  }
  addresses {
    uuid id PK
    text cep
    text street
    text number
    text complement
    text neighborhood
    text district
    text city
    text state
    text country
  }
  users {
    uuid id PK
    text name
    text email
    text phone
    text password_hash
    boolean email_verified
    boolean newsletter
    boolean notification_sound
    timestamptz created_at
  }
  user_emails {
    uuid id PK
    uuid user_id FK
    text email
    timestamptz verified_at
  }
  user_social_accounts {
    uuid id PK
    uuid user_id FK
    text provider
    text provider_user_id
  }
  members {
    uuid id PK
    uuid organization_id FK
    uuid user_id FK
    uuid sub_account_id FK
    text profile
    boolean active
    timestamptz last_login_at
    timestamptz created_at
  }
  permissions {
    text code PK
    text label
  }
  member_permissions {
    uuid member_id PK,FK
    text permission_code PK,FK
  }
  user_groups {
    uuid id PK
    uuid organization_id FK
    text name
    text description
    boolean active
  }
  user_group_members {
    uuid user_group_id PK,FK
    uuid member_id PK,FK
  }
  user_group_permissions {
    uuid user_group_id PK,FK
    text permission_code PK,FK
  }
  organization_settings {
    uuid organization_id PK,FK
    jsonb general
    jsonb booking_screen
    timestamptz updated_at
  }
  organization_integrations {
    uuid organization_id PK,FK
    text provider PK
    timestamptz connected_at
    jsonb settings
  }
  addresses |o--o| sub_accounts : "address_id"
  members ||--o| member_permissions : "member_id"
  members ||--o| user_group_members : "member_id"
  organizations ||--o| members : "organization_id"
  organizations ||--o| organization_integrations : "organization_id"
  organizations ||--o| organization_settings : "organization_id"
  organizations ||--o| sub_accounts : "organization_id"
  organizations ||--o| user_groups : "organization_id"
  permissions ||--o| member_permissions : "permission_code"
  permissions ||--o| user_group_permissions : "permission_code"
  sub_accounts |o--o| members : "sub_account_id"
  user_groups ||--o| user_group_members : "user_group_id"
  user_groups ||--o| user_group_permissions : "user_group_id"
  users ||--o| members : "user_id"
  users ||--o| user_emails : "user_id"
  users ||--o| user_social_accounts : "user_id"
```

### 2. Agendas, unidades, serviços e tags

A agenda é o centro da configuração. `agenda_rules` e `agenda_options` são 1:1 com ela e guardam os passos do assistente de configuração.

```mermaid
erDiagram
  units {
    uuid id PK
    uuid organization_id FK
    text name
    text slug
    text email
    text phone
    text whatsapp
    text description
    uuid address_id FK
  }
  agendas {
    uuid id PK
    uuid organization_id FK
    uuid sub_account_id FK
    uuid unit_id FK
    text name
    text color
    boolean active
    text slug
    timestamptz created_at
  }
  agenda_rules {
    uuid agenda_id PK,FK
    integer duration_min
    integer gap_min
    integer max_people
    integer granularity_min
    integer min_notice_hours
    integer max_ahead_days
    integer release_hour
    integer cancel_min_hours
    integer cancel_deadline_hours
    boolean business_days_only
    boolean block_national_holidays
    boolean block_state_holidays
    date start_date
    date end_date
  }
  agenda_options {
    uuid agenda_id PK,FK
    boolean request_email
    boolean email_required
    boolean request_phone
    boolean phone_required
    boolean request_cpf
    boolean request_document
    boolean request_birthday
    boolean request_gender
    boolean request_nationality
    boolean request_place_of_birth
    boolean request_profession
    boolean request_address
    boolean extra_text_field
    uuid appointment_survey_id FK
    uuid pre_survey_id FK
    uuid internal_survey_id FK
    uuid post_survey_id FK
    boolean notify_internally
    boolean notify_by_email
    text email_cc
    text sms_cc
    boolean email_client
    boolean block_external_booking
    boolean authorized_only
    text password_hash
    boolean distribute_automatically
    uuid user_group_id FK
    boolean allow_companions
    boolean count_companions
    boolean request_companion_data
    boolean email_companions
    integer max_companions
    boolean group_service
    boolean allow_recurring
    boolean waiting_list
    numeric default_value
    uuid owner_member_id FK
  }
  agenda_working_hours {
    uuid id PK
    uuid agenda_id FK
    smallint weekday
    time start_time
    time end_time
    integer max_people
  }
  agenda_access_members {
    uuid agenda_id PK,FK
    uuid member_id PK,FK
  }
  services {
    uuid id PK
    uuid organization_id FK
    text name
    numeric price
    integer duration_min
    integer sort_order
    text color
    integer max_people
  }
  service_agendas {
    uuid service_id PK,FK
    uuid agenda_id PK,FK
  }
  service_members {
    uuid service_id PK,FK
    uuid member_id PK,FK
  }
  tags {
    uuid id PK
    uuid organization_id FK
    text name
  }
  service_tags {
    uuid service_id PK,FK
    uuid tag_id PK,FK
  }
  member_agendas {
    uuid member_id PK,FK
    uuid agenda_id PK,FK
  }
  member_services {
    uuid member_id PK,FK
    uuid service_id PK,FK
  }
  member_tags {
    uuid member_id PK,FK
    uuid tag_id PK,FK
  }
  surveys {
    uuid id PK
    uuid organization_id FK
    text name
    text description
    text stage
    date expires_on
    boolean login_required
    text template
    integer question_count
    integer response_count
    timestamptz created_at
  }
  survey_agendas {
    uuid survey_id PK,FK
    uuid agenda_id PK,FK
  }
  agenda_groups {
    uuid id PK
    uuid organization_id FK
    uuid parent_id FK
    text label
    text slug
    integer sort_order
    text description
  }
  agenda_group_agendas {
    uuid agenda_group_id PK,FK
    uuid agenda_id PK,FK
  }
  addresses {
    uuid id PK
  }
  members {
    uuid id PK
  }
  sub_accounts {
    uuid id PK
  }
  user_groups {
    uuid id PK
  }
  addresses |o--o| units : "address_id"
  agenda_groups |o--o| agenda_groups : "parent_id"
  agenda_groups ||--o| agenda_group_agendas : "agenda_group_id"
  agendas ||--o| agenda_access_members : "agenda_id"
  agendas ||--o| agenda_group_agendas : "agenda_id"
  agendas ||--o| agenda_options : "agenda_id"
  agendas ||--o| agenda_rules : "agenda_id"
  agendas ||--o| agenda_working_hours : "agenda_id"
  agendas ||--o| member_agendas : "agenda_id"
  agendas ||--o| service_agendas : "agenda_id"
  agendas ||--o| survey_agendas : "agenda_id"
  members |o--o| agenda_options : "owner_member_id"
  members ||--o| agenda_access_members : "member_id"
  members ||--o| member_agendas : "member_id"
  members ||--o| member_services : "member_id"
  members ||--o| member_tags : "member_id"
  members ||--o| service_members : "member_id"
  services ||--o| member_services : "service_id"
  services ||--o| service_agendas : "service_id"
  services ||--o| service_members : "service_id"
  services ||--o| service_tags : "service_id"
  sub_accounts |o--o| agendas : "sub_account_id"
  surveys |o--o| agenda_options : "appointment_survey_id"
  surveys |o--o| agenda_options : "internal_survey_id"
  surveys |o--o| agenda_options : "post_survey_id"
  surveys |o--o| agenda_options : "pre_survey_id"
  surveys ||--o| survey_agendas : "survey_id"
  tags ||--o| member_tags : "tag_id"
  tags ||--o| service_tags : "tag_id"
  units |o--o| agendas : "unit_id"
  user_groups |o--o| agenda_options : "user_group_id"
```

### 3. Disponibilidade

O que abre e fecha horários além do expediente da agenda: bloqueios, ajustes de um horário só, horários manuais e feriados.

```mermaid
erDiagram
  schedule_blocks {
    uuid id PK
    uuid organization_id FK
    date from_date
    date to_date
    time start_time
    time end_time
    text reason
  }
  schedule_block_agendas {
    uuid schedule_block_id PK,FK
    uuid agenda_id PK,FK
  }
  slot_overrides {
    uuid id PK
    uuid agenda_id FK
    timestamp slot_start
    time start_time
    time end_time
    integer max_people
    text video_provider
    text video_url
  }
  manual_hours {
    uuid id PK
    uuid organization_id FK
    date from_date
    date to_date
    time start_time
    time end_time
    integer interval_min
    integer max_people
  }
  manual_hours_agendas {
    uuid manual_hours_id PK,FK
    uuid agenda_id PK,FK
  }
  holidays {
    uuid id PK
    uuid organization_id FK
    text name
    date start_date
    date end_date
    boolean all_day
    time start_time
    time end_time
  }
  holiday_agendas {
    uuid holiday_id PK,FK
    uuid agenda_id PK,FK
  }
  public_holidays {
    date holiday_date PK
    text scope PK
    text state PK
    text name
  }
  agenda_holiday_rules {
    uuid agenda_id PK,FK
    boolean block_national
    boolean block_state
  }
  agenda_holiday_skips {
    uuid agenda_id PK,FK
    date holiday_date PK
  }
  agendas {
    uuid id PK
  }
  agendas ||--o| agenda_holiday_rules : "agenda_id"
  agendas ||--o| agenda_holiday_skips : "agenda_id"
  agendas ||--o| holiday_agendas : "agenda_id"
  agendas ||--o| manual_hours_agendas : "agenda_id"
  agendas ||--o| schedule_block_agendas : "agenda_id"
  agendas ||--o| slot_overrides : "agenda_id"
  holidays ||--o| holiday_agendas : "holiday_id"
  manual_hours ||--o| manual_hours_agendas : "manual_hours_id"
  schedule_blocks ||--o| schedule_block_agendas : "schedule_block_id"
```

### 4. Clientes e agendamentos



```mermaid
erDiagram
  clients {
    uuid id PK
    uuid organization_id FK
    text name
    text email
    text phone
    text cpf
    text gender
    date birthday
    text nationality
    text profession
    text marital_status
    smallint identification_type
    text identification_number
    text place_of_birth
    text company_name
    text company_cnpj
    uuid address_id FK
    text access_key
    boolean inactive
    timestamptz created_at
    timestamptz updated_at
  }
  appointments {
    uuid id PK
    uuid organization_id FK
    text code
    uuid client_id FK
    uuid agenda_id FK
    uuid service_id FK
    timestamptz starts_at
    integer duration_min
    text status
    uuid owner_member_id FK
    text comment
    boolean paid_externally
    uuid recurrence_id FK
    text source
    timestamptz created_at
    timestamptz updated_at
  }
  appointment_tags {
    uuid appointment_id PK,FK
    uuid tag_id PK,FK
  }
  appointment_changes {
    uuid id PK
    uuid appointment_id FK
    uuid member_id FK
    text description
    text new_status
    timestamptz changed_at
  }
  recurrences {
    uuid id PK
    uuid organization_id FK
    text code
    text label
    uuid agenda_id FK
    uuid service_id FK
    timestamp first_start
    text status
    uuid owner_member_id FK
    smallint_array weekdays
    integer interval_weeks
    date end_date
    integer max_count
    boolean notify
    timestamptz created_at
  }
  recurrence_clients {
    uuid recurrence_id PK,FK
    uuid client_id PK,FK
  }
  recurrence_tags {
    uuid recurrence_id PK,FK
    uuid tag_id PK,FK
  }
  waiting_list_entries {
    uuid id PK
    uuid organization_id FK
    uuid client_id FK
    uuid agenda_id FK
    uuid service_id FK
    timestamptz wished_start
    text status
    integer position
    uuid appointment_id FK
    timestamptz created_at
  }
  addresses {
    uuid id PK
  }
  agendas {
    uuid id PK
  }
  members {
    uuid id PK
  }
  services {
    uuid id PK
  }
  tags {
    uuid id PK
  }
  addresses |o--o| clients : "address_id"
  agendas ||--o| appointments : "agenda_id"
  agendas ||--o| recurrences : "agenda_id"
  agendas ||--o| waiting_list_entries : "agenda_id"
  appointments |o--o| waiting_list_entries : "appointment_id"
  appointments ||--o| appointment_changes : "appointment_id"
  appointments ||--o| appointment_tags : "appointment_id"
  clients ||--o| appointments : "client_id"
  clients ||--o| recurrence_clients : "client_id"
  clients ||--o| waiting_list_entries : "client_id"
  members |o--o| appointment_changes : "member_id"
  members |o--o| appointments : "owner_member_id"
  members |o--o| recurrences : "owner_member_id"
  recurrences |o--o| appointments : "recurrence_id"
  recurrences ||--o| recurrence_clients : "recurrence_id"
  recurrences ||--o| recurrence_tags : "recurrence_id"
  services |o--o| appointments : "service_id"
  services |o--o| recurrences : "service_id"
  services |o--o| waiting_list_entries : "service_id"
  tags ||--o| appointment_tags : "tag_id"
  tags ||--o| recurrence_tags : "tag_id"
```

### 5. Regras de acesso

Quem pode agendar e quanto: limites por cliente, contatos bloqueados e listas de acesso.

```mermaid
erDiagram
  booking_limits {
    uuid id PK
    uuid organization_id FK
    text limit_type
    text limit_key
    text interval
    integer days
    integer max_count
  }
  booking_limit_agendas {
    uuid booking_limit_id PK,FK
    uuid agenda_id PK,FK
  }
  booking_limit_services {
    uuid booking_limit_id PK,FK
    uuid service_id PK,FK
  }
  contact_blocks {
    uuid id PK
    uuid organization_id FK
    text contact_type
    text contact
    text contact_normalized
    text reason
    timestamptz expires_at
    boolean active
    uuid created_by_member_id FK
    timestamptz created_at
  }
  access_lists {
    uuid id PK
    uuid organization_id FK
    text title
    text key_type
    integer max_appointments
    text interval
    integer days
    date expires_on
    date max_booking_date
    boolean login_required
    text help_text
    boolean use_external_list
    text external_api_url
    text unauthorized_message
    boolean active
  }
  access_list_agendas {
    uuid access_list_id PK,FK
    uuid agenda_id PK,FK
  }
  access_list_services {
    uuid access_list_id PK,FK
    uuid service_id PK,FK
  }
  access_list_clients {
    uuid access_list_id PK,FK
    uuid client_id PK,FK
  }
  agendas {
    uuid id PK
  }
  clients {
    uuid id PK
  }
  members {
    uuid id PK
  }
  services {
    uuid id PK
  }
  access_lists ||--o| access_list_agendas : "access_list_id"
  access_lists ||--o| access_list_clients : "access_list_id"
  access_lists ||--o| access_list_services : "access_list_id"
  agendas ||--o| access_list_agendas : "agenda_id"
  agendas ||--o| booking_limit_agendas : "agenda_id"
  booking_limits ||--o| booking_limit_agendas : "booking_limit_id"
  booking_limits ||--o| booking_limit_services : "booking_limit_id"
  clients ||--o| access_list_clients : "client_id"
  members |o--o| contact_blocks : "created_by_member_id"
  services ||--o| access_list_services : "service_id"
  services ||--o| booking_limit_services : "service_id"
```

### 6. Comunicação

Modelos, as duas famílias de regras de notificação, os envios e a caixa de entrada do sino.

```mermaid
erDiagram
  email_templates {
    uuid id PK
    uuid organization_id FK
    text name
    text subject
    text body
  }
  whatsapp_templates {
    uuid id PK
    uuid organization_id FK
    text name
    text template_type
    text text
  }
  notification_rules {
    uuid id PK
    uuid organization_id FK
    text title
    boolean to_client
    boolean to_companions
    boolean to_owner
    boolean to_team
    text channel
    text sms_text
    uuid email_template_id FK
    uuid whatsapp_template_id FK
    uuid survey_id FK
    boolean immediate
    text offset_direction
    integer offset_days
    integer offset_hours
    integer offset_minutes
    text status_filter
  }
  notification_rule_agendas {
    uuid notification_rule_id PK,FK
    uuid agenda_id PK,FK
  }
  status_rules {
    uuid id PK
    uuid organization_id FK
    text status
    boolean apply_to_subaccounts
    boolean force_on_subaccounts
    boolean send_to_companions
    boolean send_to_owner
    boolean via_whatsapp
    boolean via_sms
    boolean via_email
    uuid whatsapp_template_id FK
    text sms_text
    uuid email_template_id FK
  }
  status_rule_agendas {
    uuid status_rule_id PK,FK
    uuid agenda_id PK,FK
  }
  agenda_email_templates {
    uuid id PK
    uuid agenda_id FK
    text email_type
    text name
    text subject
    text body
  }
  message_deliveries {
    uuid id PK
    uuid organization_id FK
    uuid appointment_id FK
    uuid notification_rule_id FK
    uuid status_rule_id FK
    text channel
    text recipient
    timestamptz scheduled_for
    timestamptz sent_at
    text status
    text error
    timestamptz created_at
  }
  inbox_notifications {
    uuid id PK
    uuid organization_id FK
    uuid recipient_user_id FK
    text level
    text title
    text text
    timestamptz read_at
    timestamptz created_at
  }
  agendas {
    uuid id PK
  }
  appointments {
    uuid id PK
  }
  surveys {
    uuid id PK
  }
  users {
    uuid id PK
  }
  agendas ||--o| agenda_email_templates : "agenda_id"
  agendas ||--o| notification_rule_agendas : "agenda_id"
  agendas ||--o| status_rule_agendas : "agenda_id"
  appointments |o--o| message_deliveries : "appointment_id"
  email_templates |o--o| notification_rules : "email_template_id"
  email_templates |o--o| status_rules : "email_template_id"
  notification_rules |o--o| message_deliveries : "notification_rule_id"
  notification_rules ||--o| notification_rule_agendas : "notification_rule_id"
  status_rules |o--o| message_deliveries : "status_rule_id"
  status_rules ||--o| status_rule_agendas : "status_rule_id"
  surveys |o--o| notification_rules : "survey_id"
  users |o--o| inbox_notifications : "recipient_user_id"
  whatsapp_templates |o--o| notification_rules : "whatsapp_template_id"
  whatsapp_templates |o--o| status_rules : "whatsapp_template_id"
```

### 7. Convites de cadastro



```mermaid
erDiagram
  invite_email_templates {
    uuid id PK
    uuid organization_id FK
    text kind
    text name
    text subject
    text body
    boolean is_default
  }
  registration_invites {
    uuid id PK
    uuid organization_id FK
    text name
    uuid email_template_id FK
    boolean auto_approve
    boolean ask_password
    integer expires_in_days
    text status
    timestamptz created_at
  }
  registration_invite_recipients {
    uuid id PK
    uuid invite_id FK
    text email
    text token
    timestamptz sent_at
  }
  registration_invite_fields {
    uuid invite_id PK,FK
    text field PK
    boolean required
  }
  registration_submissions {
    uuid id PK
    uuid invite_id FK
    uuid recipient_id FK
    text name
    text email
    jsonb answers
    text status
    text reason
    uuid client_id FK
    timestamptz received_at
    timestamptz decided_at
  }
  clients {
    uuid id PK
  }
  clients |o--o| registration_submissions : "client_id"
  invite_email_templates |o--o| registration_invites : "email_template_id"
  registration_invite_recipients |o--o| registration_submissions : "recipient_id"
  registration_invites ||--o| registration_invite_fields : "invite_id"
  registration_invites ||--o| registration_invite_recipients : "invite_id"
  registration_invites ||--o| registration_submissions : "invite_id"
```

### 8. Plano, créditos e cobrança

`plans`, `plan_prices` e `plan_addons` são catálogo, iguais para todas as organizações.

```mermaid
erDiagram
  plans {
    uuid id PK
    text legacy_id
    text name
    integer max_appointments
    integer max_users
    boolean active
  }
  plan_prices {
    uuid id PK
    uuid plan_id FK
    text legacy_id
    text cycle
    numeric amount
  }
  plan_addons {
    uuid id PK
    text code
    text label
    text kind
    numeric unit_price
  }
  subscriptions {
    uuid id PK
    uuid organization_id FK
    uuid plan_price_id FK
    text status
    text billing_person
    timestamptz started_at
    timestamptz ends_at
    timestamptz canceled_at
  }
  subscription_addons {
    uuid subscription_id PK,FK
    uuid addon_id PK,FK
    integer quantity
  }
  invoices {
    uuid id PK
    uuid organization_id FK
    uuid subscription_id FK
    numeric amount
    text status
    date due_date
    timestamptz paid_at
    text barcode
    timestamptz created_at
  }
  credit_balances {
    uuid organization_id PK,FK
    integer coins
    integer sms
    integer email
    integer whatsapp
    integer auto_recharge_coins
    text payment_method
    timestamptz updated_at
  }
  coin_transactions {
    uuid id PK
    uuid organization_id FK
    text kind
    integer amount
    text description
    text status
    timestamptz created_at
  }
  credit_purchases {
    uuid id PK
    uuid organization_id FK
    text channel
    integer quantity
    integer used
    text status
    timestamptz purchased_at
  }
  referrals {
    uuid id PK
    uuid organization_id FK
    uuid referred_organization_id FK
    text referred_name
    text status
    numeric first_payment_reward
    numeric loyalty_reward
    integer payments_count
    timestamptz created_at
  }
  plan_addons ||--o| subscription_addons : "addon_id"
  plan_prices ||--o| subscriptions : "plan_price_id"
  plans ||--o| plan_prices : "plan_id"
  subscriptions |o--o| invoices : "subscription_id"
  subscriptions ||--o| subscription_addons : "subscription_id"
```

### 9. Suporte e históricos



```mermaid
erDiagram
  support_access_codes {
    uuid id PK
    uuid organization_id FK
    text token_hash
    timestamptz expires_at
    timestamptz revoked_at
    uuid created_by FK
    timestamptz created_at
  }
  support_visits {
    uuid id PK
    uuid organization_id FK
    uuid access_code_id FK
    text agent
    timestamptz started_at
    timestamptz ended_at
    integer pages_viewed
    text status
  }
  agenda_change_logs {
    uuid id PK
    uuid agenda_id FK
    uuid member_id FK
    text action
    text kind
    text field
    text old_value
    text new_value
    boolean is_color
    timestamptz changed_at
  }
  team_activity_logs {
    uuid id PK
    uuid organization_id FK
    uuid member_id FK
    uuid agenda_id FK
    uuid appointment_id FK
    timestamptz slot_at
    text action
    timestamptz occurred_at
  }
  agendas {
    uuid id PK
  }
  appointments {
    uuid id PK
  }
  members {
    uuid id PK
  }
  agendas |o--o| team_activity_logs : "agenda_id"
  agendas ||--o| agenda_change_logs : "agenda_id"
  appointments |o--o| team_activity_logs : "appointment_id"
  members |o--o| agenda_change_logs : "member_id"
  members |o--o| support_access_codes : "created_by"
  members |o--o| team_activity_logs : "member_id"
  support_access_codes |o--o| support_visits : "access_code_id"
```


### 10. Webhooks, domínios e importação de clientes

```mermaid
erDiagram
  webhooks {
    uuid id PK
    uuid organization_id FK
    text class_type
    text url
    jsonb auth_header
    timestamptz created_at
  }
  webhook_events {
    uuid webhook_id FK
    text class_type
    text event
  }
  organization_domains {
    uuid id PK
    uuid organization_id FK
    text name
    text status
    text txt_value
    timestamptz verified_at
    timestamptz created_at
  }
  client_imports {
    uuid id PK
    uuid organization_id FK
    uuid member_id FK
    text file_name
    text status
    timestamptz started_at
  }
  organizations {
    uuid id PK
  }
  members {
    uuid id PK
  }
  organizations ||--o{ webhooks : "organization_id"
  organizations ||--o{ organization_domains : "organization_id"
  organizations ||--o{ client_imports : "organization_id"
  members |o--o{ client_imports : "member_id"
  webhooks ||--o{ webhook_events : "webhook_id, class_type"
```

`webhook_events` repete `class_type` de propósito. A tela só oferece cada evento para certos
tipos de registro — não existe cancelamento de agenda nem exclusão de agendamento — e essa regra
só pode virar um CHECK se a coluna estiver na mesma linha do evento. A chave estrangeira composta
contra `webhooks (id, class_type)` impede que as duas divirjam.
