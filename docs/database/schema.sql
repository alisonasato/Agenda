-- Seiri — esquema do banco de dados (PostgreSQL 13+)
--
-- Traduz para tabelas o que o protótipo hoje guarda no localStorage (src/lib/seiri/types.ts).
-- Decisões gerais, o mapa coleção → tabela e os diagramas estão em docs/database/README.md.
--
-- Convenções:
--   * Chaves primárias uuid (gen_random_uuid(), nativo desde o PostgreSQL 13).
--   * Toda tabela de dados de cliente carrega organization_id: o sistema é multiempresa.
--   * Datas com hora em timestamptz; datas puras em date; horários do dia em time.
--   * Listas de valores fixos em text + CHECK, mais fáceis de estender do que tipos ENUM.
--   * Listas de ids do protótipo (agendaIds, tagIds...) viram tabelas de ligação.
--     Onde o protótipo trata "lista vazia" como "todas", a regra continua a mesma:
--     nenhuma linha na tabela de ligação = vale para todas.

BEGIN;

-- =====================================================================================
-- 1. Organizações, usuários e equipe
-- =====================================================================================

-- Endereço reaproveitado por clientes, unidades e sub-contas (o bloco "Endereço" dos formulários).
CREATE TABLE addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cep             text NOT NULL DEFAULT '',
  street          text NOT NULL DEFAULT '',
  number          text NOT NULL DEFAULT '',
  complement      text NOT NULL DEFAULT '',
  neighborhood    text NOT NULL DEFAULT '',
  district        text NOT NULL DEFAULT '',   -- "Distrito", só na edição completa do cliente
  city            text NOT NULL DEFAULT '',
  state           text NOT NULL DEFAULT '',
  country         text NOT NULL DEFAULT ''
);

-- A empresa que assina o Seiri. Tudo abaixo pertence a uma organização.
CREATE TABLE organizations (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      text NOT NULL,
  slug                      text NOT NULL UNIQUE,          -- Profile.orgSlug; vai no link público
  whatsapp_activation_code  text NOT NULL DEFAULT '',      -- Data.whatsappCode
  onboarding_checklist_dismissed  boolean NOT NULL DEFAULT false,  -- Data.checklistDismissed
  timezone                  text NOT NULL DEFAULT 'America/Sao_Paulo',  -- fuso dos horários das agendas
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- Sub-contas ("Administrar Contas"): filiais com link próprio dentro da mesma organização.
CREATE TABLE sub_accounts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  slug             text NOT NULL,                  -- "Sigla para link de agendamento"
  email            text NOT NULL DEFAULT '',
  phone            text NOT NULL DEFAULT '',
  address_id       uuid REFERENCES addresses(id) ON DELETE SET NULL,
  plan_status      text NOT NULL DEFAULT '' CHECK (plan_status IN ('', 'ACTIVE', 'EXPIRED')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);

-- Quem faz login. Uma pessoa pode pertencer a mais de uma organização (tabela members).
-- Junta os dados de "Sua Conta" (Profile) com o nome/e-mail/telefone do membro proprietário.
CREATE TABLE users (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  email                text NOT NULL UNIQUE,
  phone                text NOT NULL DEFAULT '',
  password_hash        text,                       -- nulo para quem só entra por login social
  email_verified       boolean NOT NULL DEFAULT false,
  newsletter           boolean NOT NULL DEFAULT false,
  notification_sound   boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- Profile.extraEmails: endereços adicionais, ainda não verificados.
CREATE TABLE user_emails (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email        text NOT NULL,
  verified_at  timestamptz,
  UNIQUE (user_id, email)
);

-- Profile.socialAccounts.
CREATE TABLE user_social_accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          text NOT NULL CHECK (provider IN ('facebook', 'google', 'microsoft')),
  provider_user_id  text NOT NULL,
  UNIQUE (provider, provider_user_id),
  UNIQUE (user_id, provider)
);

-- Membro da equipe ("Administrar Equipe"): o vínculo de um usuário com uma organização.
CREATE TABLE members (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sub_account_id   uuid REFERENCES sub_accounts(id) ON DELETE SET NULL,  -- nulo = conta principal
  profile          text NOT NULL CHECK (profile IN ('owner', 'manager', 'oper', 'read')),
  active           boolean NOT NULL DEFAULT true,
  last_login_at    timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- Catálogo das permissões (MEMBER_PERMISSIONS).
CREATE TABLE permissions (
  code   text PRIMARY KEY,
  label  text NOT NULL
);

INSERT INTO permissions (code, label) VALUES
  ('clients.read',         'Cadastro de Clientes - Leitura'),
  ('clients.write',        'Cadastro de Clientes - Escrita'),
  ('clients.delete',       'Cadastro de Clientes - Excluir Dados'),
  ('reports.access',       'Relatórios - Acesso ao Módulo'),
  ('appointments.manage',  'Agendamentos - Criar/Editar/Cancelar'),
  ('agendas.manage',       'Agendas - Criar/Editar/Excluir'),
  ('billing.access',       'Financeiro - Acesso a Faturamento e Pagamentos');

-- Member.permissions.
CREATE TABLE member_permissions (
  member_id        uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  permission_code  text NOT NULL REFERENCES permissions(code),
  PRIMARY KEY (member_id, permission_code)
);

-- "Grupos de Usuários".
CREATE TABLE user_groups (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text NOT NULL DEFAULT '',
  active           boolean NOT NULL DEFAULT true
);

CREATE TABLE user_group_members (
  user_group_id  uuid NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  member_id      uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (user_group_id, member_id)
);

CREATE TABLE user_group_permissions (
  user_group_id    uuid NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_code  text NOT NULL REFERENCES permissions(code),
  PRIMARY KEY (user_group_id, permission_code)
);

-- "Configurações Gerais" (OrgSettings) e "Tela de Agendamento" (BookingScreen): no protótipo são
-- mapas campo → valor de formulários com dezenas de campos; ficam em jsonb até estabilizarem.
CREATE TABLE organization_settings (
  organization_id  uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  general          jsonb NOT NULL DEFAULT '{}'::jsonb,   -- OrgSettings
  booking_screen   jsonb NOT NULL DEFAULT '{}'::jsonb,   -- BookingScreen
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Integrações conectadas (Data.integrations), pelo nome do card.
CREATE TABLE organization_integrations (
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider         text NOT NULL,
  connected_at     timestamptz NOT NULL DEFAULT now(),
  settings         jsonb NOT NULL DEFAULT '{}'::jsonb,   -- credenciais/opções de cada integração
  PRIMARY KEY (organization_id, provider)
);

-- =====================================================================================
-- 2. Agendas, unidades, serviços e tags
-- =====================================================================================

-- "Administrar Unidades".
CREATE TABLE units (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  slug             text NOT NULL,                  -- "Nome para o Link"
  email            text NOT NULL DEFAULT '',
  phone            text NOT NULL DEFAULT '',
  whatsapp         text NOT NULL DEFAULT '',
  description      text NOT NULL DEFAULT '',
  address_id       uuid REFERENCES addresses(id) ON DELETE SET NULL,
  UNIQUE (organization_id, slug)
);

CREATE TABLE agendas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sub_account_id   uuid REFERENCES sub_accounts(id) ON DELETE SET NULL,  -- nulo = conta principal
  unit_id          uuid REFERENCES units(id) ON DELETE SET NULL,
  name             text NOT NULL,
  color            text NOT NULL,
  active           boolean NOT NULL DEFAULT true,
  slug             text,                           -- "Identificador da Agenda"; nulo = sem link amigável
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);

-- AgendaRules: passo "Horários" da configuração da agenda (1:1 com agendas).
CREATE TABLE agenda_rules (
  agenda_id                uuid PRIMARY KEY REFERENCES agendas(id) ON DELETE CASCADE,
  duration_min             integer NOT NULL DEFAULT 30,
  gap_min                  integer NOT NULL DEFAULT 0,
  max_people               integer NOT NULL DEFAULT 1,
  granularity_min          integer NOT NULL DEFAULT 0,      -- 0 = duração + intervalo
  min_notice_hours         integer NOT NULL DEFAULT 1,
  max_ahead_days           integer NOT NULL DEFAULT 30,
  release_hour             integer NOT NULL DEFAULT 0,
  cancel_min_hours         integer NOT NULL DEFAULT 0,
  cancel_deadline_hours    integer NOT NULL DEFAULT 0,
  business_days_only       boolean NOT NULL DEFAULT false,
  block_national_holidays  boolean NOT NULL DEFAULT true,
  block_state_holidays     boolean NOT NULL DEFAULT false,
  start_date               date,
  end_date                 date
);

-- Horários de trabalho (Data.hours): intervalos por dia da semana; dia sem linhas = "Fechado".
CREATE TABLE agenda_working_hours (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id   uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  weekday     smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),   -- 0 = domingo
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  max_people  integer,                                             -- nulo = o da agenda
  CHECK (end_time > start_time)
);

CREATE INDEX agenda_working_hours_agenda_idx ON agenda_working_hours (agenda_id, weekday);

CREATE TABLE services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  price            numeric(12, 2),                 -- nulo = sem preço
  duration_min     integer NOT NULL,
  sort_order       integer NOT NULL DEFAULT 0,
  color            text NOT NULL DEFAULT '',
  max_people       integer                          -- nulo = o limite da agenda
);

CREATE TABLE service_agendas (
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  agenda_id   uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, agenda_id)
);

-- Service.members: no protótipo são nomes; aqui, membros de verdade.
CREATE TABLE service_members (
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, member_id)
);

CREATE TABLE tags (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  UNIQUE (organization_id, name)
);

CREATE TABLE service_tags (
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, tag_id)
);

-- Member.agendaIds / serviceIds / tagIds: a que o membro tem acesso (nenhuma linha = tudo).
CREATE TABLE member_agendas (
  member_id  uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  agenda_id  uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, agenda_id)
);

CREATE TABLE member_services (
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, service_id)
);

CREATE TABLE member_tags (
  member_id  uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, tag_id)
);

-- "Formulários" (Survey). Contagens de perguntas/respostas viram tabelas próprias quando o
-- construtor de formulários existir; por ora ficam como no protótipo.
CREATE TABLE surveys (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text NOT NULL DEFAULT '',
  stage            text NOT NULL DEFAULT '',
  expires_on       date,
  login_required   boolean NOT NULL DEFAULT false,
  template         text NOT NULL DEFAULT '',
  question_count   integer NOT NULL DEFAULT 0,
  response_count   integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE survey_agendas (
  survey_id  uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  agenda_id  uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (survey_id, agenda_id)
);

-- As perguntas de um formulário, da tela de detalhes. A ordem é a coluna "Ordem" do editor.
CREATE TABLE survey_questions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  text         text NOT NULL,
  type         text NOT NULL CHECK (type IN (
                 'text', 'short-text', 'licence-plate', 'radio', 'select', 'select-multiple',
                 'file-upload', 'integer', 'float', 'texto-nota', 'date',
                 'company-identification', 'checkbox')),
  position     integer NOT NULL,            -- "Ordem"; ORDER é palavra reservada
  required     boolean NOT NULL DEFAULT false,
  min_value    numeric,                     -- só para integer, float e texto-nota
  max_value    numeric,
  help_text    text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (survey_id, position),
  -- Alvo da chave estrangeira composta de survey_question_choices, abaixo.
  UNIQUE (id, type),
  CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);

CREATE INDEX survey_questions_survey_idx ON survey_questions (survey_id, position);

-- O protótipo guarda as alternativas numa string separada por vírgulas, como o original; aqui
-- cada uma é uma linha. Só três tipos as oferecem, e é o CHECK que garante isso: type é repetido
-- para que a regra caiba no banco, e a chave estrangeira composta impede que ele divirja.
CREATE TABLE survey_question_choices (
  question_id  uuid NOT NULL,
  type         text NOT NULL CHECK (type IN ('radio', 'select', 'select-multiple')),
  position     integer NOT NULL,
  label        text NOT NULL,
  PRIMARY KEY (question_id, position),
  FOREIGN KEY (question_id, type) REFERENCES survey_questions (id, type) ON DELETE CASCADE
);


-- AgendaOptions: passos Formulários, Notificações, Avançadas e Acessos (1:1 com agendas).
CREATE TABLE agenda_options (
  agenda_id                 uuid PRIMARY KEY REFERENCES agendas(id) ON DELETE CASCADE,
  -- "Dados solicitados no agendamento"
  request_email             boolean NOT NULL DEFAULT true,
  email_required            boolean NOT NULL DEFAULT true,
  request_phone             boolean NOT NULL DEFAULT true,
  phone_required            boolean NOT NULL DEFAULT true,
  request_cpf               boolean NOT NULL DEFAULT false,
  request_document          boolean NOT NULL DEFAULT false,
  request_birthday          boolean NOT NULL DEFAULT false,
  request_gender            boolean NOT NULL DEFAULT false,
  request_nationality       boolean NOT NULL DEFAULT false,
  request_place_of_birth    boolean NOT NULL DEFAULT false,
  request_profession        boolean NOT NULL DEFAULT false,
  request_address           boolean NOT NULL DEFAULT false,
  extra_text_field          boolean NOT NULL DEFAULT false,
  -- "Formulários": qual formulário responde cada etapa
  appointment_survey_id     uuid REFERENCES surveys(id) ON DELETE SET NULL,
  pre_survey_id             uuid REFERENCES surveys(id) ON DELETE SET NULL,
  internal_survey_id        uuid REFERENCES surveys(id) ON DELETE SET NULL,
  post_survey_id            uuid REFERENCES surveys(id) ON DELETE SET NULL,
  -- "Notificações"
  notify_internally         boolean NOT NULL DEFAULT true,
  notify_by_email           boolean NOT NULL DEFAULT true,
  email_cc                  text NOT NULL DEFAULT '',
  sms_cc                    text NOT NULL DEFAULT '',
  email_client              boolean NOT NULL DEFAULT true,
  -- "Avançadas"
  block_external_booking    boolean NOT NULL DEFAULT false,
  authorized_only           boolean NOT NULL DEFAULT false,
  password_hash             text,                -- AgendaOptions.password, nunca em texto puro
  distribute_automatically  boolean NOT NULL DEFAULT false,
  user_group_id             uuid REFERENCES user_groups(id) ON DELETE SET NULL,
  allow_companions          boolean NOT NULL DEFAULT false,
  count_companions          boolean NOT NULL DEFAULT false,
  request_companion_data    boolean NOT NULL DEFAULT false,
  email_companions          boolean NOT NULL DEFAULT false,
  max_companions            integer NOT NULL DEFAULT 0,
  group_service             boolean NOT NULL DEFAULT false,
  allow_recurring           boolean NOT NULL DEFAULT false,
  waiting_list              boolean NOT NULL DEFAULT false,
  default_value             numeric(12, 2) NOT NULL DEFAULT 0,
  -- "Acessos"
  owner_member_id           uuid REFERENCES members(id) ON DELETE SET NULL
);

-- AgendaOptions.accessUsers.
CREATE TABLE agenda_access_members (
  agenda_id  uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  member_id  uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (agenda_id, member_id)
);

-- Etapas da tela pública de agendamento (AgendaGroup). parent_id liga uma etapa às etapas que
-- ela oferece; no protótipo essa ligação ainda não existe, só a ordem.
CREATE TABLE agenda_groups (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id        uuid REFERENCES agenda_groups(id) ON DELETE SET NULL,
  label            text NOT NULL,
  slug             text NOT NULL,
  sort_order       integer NOT NULL DEFAULT 0,
  description      text NOT NULL DEFAULT '',     -- texto rico
  UNIQUE (organization_id, slug)
);

CREATE TABLE agenda_group_agendas (
  agenda_group_id  uuid NOT NULL REFERENCES agenda_groups(id) ON DELETE CASCADE,
  agenda_id        uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (agenda_group_id, agenda_id)
);

-- =====================================================================================
-- 3. Disponibilidade: bloqueios, ajustes de horário, horários manuais e feriados
-- =====================================================================================

-- "Bloquear Horários" (Block).
CREATE TABLE schedule_blocks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_date        date NOT NULL,
  to_date          date NOT NULL,
  start_time       time,                            -- nulo = o dia inteiro
  end_time         time,
  reason           text NOT NULL DEFAULT '',
  CHECK (to_date >= from_date)
);

CREATE TABLE schedule_block_agendas (
  schedule_block_id  uuid NOT NULL REFERENCES schedule_blocks(id) ON DELETE CASCADE,
  agenda_id          uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (schedule_block_id, agenda_id)
);

-- SlotInfo: o que os modais mudam em um único horário da agenda.
CREATE TABLE slot_overrides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id       uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  slot_start      timestamp NOT NULL,              -- o horário original, no fuso da organização
  start_time      time,
  end_time        time,
  max_people      integer,
  video_provider  text,
  video_url       text,
  UNIQUE (agenda_id, slot_start)
);

-- "Horários Manuais" (ManualHours), da ação em lote "Incluir Horários".
CREATE TABLE manual_hours (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_date        date NOT NULL,
  to_date          date NOT NULL,
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  interval_min     integer NOT NULL,
  max_people       integer NOT NULL
);

CREATE TABLE manual_hours_agendas (
  manual_hours_id  uuid NOT NULL REFERENCES manual_hours(id) ON DELETE CASCADE,
  agenda_id        uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (manual_hours_id, agenda_id)
);

-- "Feriados Customizados" (Holiday).
CREATE TABLE holidays (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  start_date       date NOT NULL,
  end_date         date,                            -- nulo = um dia só
  all_day          boolean NOT NULL DEFAULT true,
  start_time       time,
  end_time         time
);

CREATE TABLE holiday_agendas (
  holiday_id  uuid NOT NULL REFERENCES holidays(id) ON DELETE CASCADE,
  agenda_id   uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (holiday_id, agenda_id)
);

-- Feriados nacionais e estaduais (hoje NATIONAL_HOLIDAYS em src/lib/seiri/holidays.ts).
-- Tabela de referência, igual para todas as organizações.
CREATE TABLE public_holidays (
  holiday_date  date NOT NULL,
  scope         text NOT NULL CHECK (scope IN ('national', 'state')),
  state         text NOT NULL DEFAULT '',          -- UF, só para os estaduais
  name          text NOT NULL,
  PRIMARY KEY (holiday_date, scope, state)
);

-- HolidayRules: o que "Feriados da agenda" decide para cada agenda.
CREATE TABLE agenda_holiday_rules (
  agenda_id       uuid PRIMARY KEY REFERENCES agendas(id) ON DELETE CASCADE,
  block_national  boolean NOT NULL DEFAULT false,
  block_state     boolean NOT NULL DEFAULT false
);

-- HolidayRules.skipped: feriados nacionais desmarcados em "Personalizar quais feriados bloquear".
CREATE TABLE agenda_holiday_skips (
  agenda_id     uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  holiday_date  date NOT NULL,
  PRIMARY KEY (agenda_id, holiday_date)
);

-- =====================================================================================
-- 4. Clientes e agendamentos
-- =====================================================================================

CREATE TABLE clients (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                   text NOT NULL,
  email                  text NOT NULL DEFAULT '',
  phone                  text NOT NULL DEFAULT '',
  cpf                    text,
  gender                 text CHECK (gender IN ('male', 'female', 'other', 'undisclosed')),
  birthday               date,
  nationality            text,
  profession             text,
  marital_status         text CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widower', 'StableUnion')),
  identification_type    smallint CHECK (identification_type BETWEEN 1 AND 5),  -- IDENTIFICATION_TYPES
  identification_number  text,
  place_of_birth         text,
  company_name           text,
  company_cnpj           text,
  address_id             uuid REFERENCES addresses(id) ON DELETE SET NULL,
  access_key             text,                     -- "Cliente ID" do link de agendamento próprio
  inactive               boolean NOT NULL DEFAULT false,  -- desativado em vez de apagado
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX clients_cpf_key ON clients (organization_id, cpf) WHERE cpf IS NOT NULL AND cpf <> '';
CREATE UNIQUE INDEX clients_access_key ON clients (organization_id, access_key) WHERE access_key IS NOT NULL;
CREATE INDEX clients_email_idx ON clients (organization_id, lower(email));
CREATE INDEX clients_phone_idx ON clients (organization_id, phone);

-- "Agendamentos Recorrentes" (Recurrence). Salvar a regra gera os agendamentos dela.
CREATE TABLE recurrences (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code             text NOT NULL,
  label            text NOT NULL DEFAULT '',
  agenda_id        uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  service_id       uuid REFERENCES services(id) ON DELETE SET NULL,
  first_start      timestamp NOT NULL,              -- no fuso da organização
  status           text NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELED')),
  owner_member_id  uuid REFERENCES members(id) ON DELETE SET NULL,
  weekdays         smallint[] NOT NULL,             -- 0 = domingo
  interval_weeks   integer NOT NULL DEFAULT 1,
  end_date         date,
  max_count        integer NOT NULL DEFAULT 0,
  notify           boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE recurrence_clients (
  recurrence_id  uuid NOT NULL REFERENCES recurrences(id) ON DELETE CASCADE,
  client_id      uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (recurrence_id, client_id)
);

CREATE TABLE recurrence_tags (
  recurrence_id  uuid NOT NULL REFERENCES recurrences(id) ON DELETE CASCADE,
  tag_id         uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recurrence_id, tag_id)
);

CREATE TABLE appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code             text NOT NULL,                   -- "Identificador" curto da primeira coluna
  client_id        uuid NOT NULL REFERENCES clients(id),       -- cliente é desativado, nunca apagado
  agenda_id        uuid NOT NULL REFERENCES agendas(id),
  service_id       uuid REFERENCES services(id) ON DELETE SET NULL,
  starts_at        timestamptz NOT NULL,
  duration_min     integer NOT NULL,
  status           text NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELED')),
  owner_member_id  uuid REFERENCES members(id) ON DELETE SET NULL,   -- "Responsável"
  comment          text NOT NULL DEFAULT '',
  paid_externally  boolean NOT NULL DEFAULT false,
  recurrence_id    uuid REFERENCES recurrences(id) ON DELETE SET NULL,
  source           text NOT NULL DEFAULT 'panel' CHECK (source IN ('panel', 'public', 'recurrence', 'import')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE INDEX appointments_agenda_time_idx ON appointments (agenda_id, starts_at);
CREATE INDEX appointments_client_idx ON appointments (client_id, starts_at);
CREATE INDEX appointments_org_time_idx ON appointments (organization_id, starts_at);

CREATE TABLE appointment_tags (
  appointment_id  uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  tag_id          uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (appointment_id, tag_id)
);

-- Aba "Alterações" do detalhe do agendamento (Appointment.changes).
CREATE TABLE appointment_changes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  member_id       uuid REFERENCES members(id) ON DELETE SET NULL,
  description     text NOT NULL,
  new_status      text,
  changed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX appointment_changes_appointment_idx ON appointment_changes (appointment_id, changed_at);

-- Lista de espera (WaitingEntry).
CREATE TABLE waiting_list_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id        uuid NOT NULL REFERENCES clients(id),
  agenda_id        uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  service_id       uuid REFERENCES services(id) ON DELETE SET NULL,
  wished_start     timestamptz NOT NULL,
  status           text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'scheduled', 'cancelled')),
  position         integer NOT NULL,
  appointment_id   uuid REFERENCES appointments(id) ON DELETE SET NULL,  -- quando virou agendamento
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX waiting_list_agenda_idx ON waiting_list_entries (agenda_id, status, position);

-- =====================================================================================
-- 5. Regras de acesso: limites, bloqueios de contato e listas de acesso
-- =====================================================================================

-- "Limites de Agendamentos" (BookingLimit).
CREATE TABLE booking_limits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  limit_type       text NOT NULL CHECK (limit_type IN ('AGENDAMENTOS', 'FALTAS')),
  limit_key        text NOT NULL CHECK (limit_key IN (
                     'personal_identification_number', 'user', 'email', 'nome', 'phone', 'phone+name',
                     'email+name', 'phone+name+email', 'source_ip', 'custom', 'count')),
  interval         text NOT NULL CHECK (interval IN ('HORARIO', 'DIA', 'SEMANA', 'MES', 'NDAYS')),
  days             integer NOT NULL DEFAULT 0,       -- só com interval = NDAYS
  max_count        integer NOT NULL
);

CREATE TABLE booking_limit_agendas (
  booking_limit_id  uuid NOT NULL REFERENCES booking_limits(id) ON DELETE CASCADE,
  agenda_id         uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_limit_id, agenda_id)
);

CREATE TABLE booking_limit_services (
  booking_limit_id  uuid NOT NULL REFERENCES booking_limits(id) ON DELETE CASCADE,
  service_id        uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_limit_id, service_id)
);

-- "Listas de Bloqueio" (Suppression): contatos impedidos de agendar.
CREATE TABLE contact_blocks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_type         text NOT NULL CHECK (contact_type IN ('email', 'phone', 'identification')),
  contact              text NOT NULL,
  contact_normalized   text NOT NULL,               -- só dígitos para telefone/CPF, minúsculas para e-mail
  reason               text NOT NULL DEFAULT '',
  expires_at           timestamptz,                 -- nulo = nunca expira
  active               boolean NOT NULL DEFAULT true,
  created_by_member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_blocks_lookup_idx ON contact_blocks (organization_id, contact_type, contact_normalized) WHERE active;

-- "Listas de Controle de Acesso" (AccessList).
CREATE TABLE access_lists (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  key_type              text NOT NULL CHECK (key_type IN ('EMAIL', 'PHONE', 'PIN', 'PASSPORT', 'CONTRACT', 'INVITE_CODE')),
  max_appointments      integer NOT NULL DEFAULT 0,
  interval              text NOT NULL CHECK (interval IN ('DIA', 'SEMANA', 'MES', '15D', '30D', 'NDAYS', 'UNDEF')),
  days                  integer NOT NULL DEFAULT 0,
  expires_on            date,
  max_booking_date      date,
  login_required        boolean NOT NULL DEFAULT false,
  help_text             text NOT NULL DEFAULT '',
  use_external_list     boolean NOT NULL DEFAULT false,
  external_api_url      text NOT NULL DEFAULT '',
  unauthorized_message  text NOT NULL DEFAULT '',
  active                boolean NOT NULL DEFAULT true
);

CREATE TABLE access_list_agendas (
  access_list_id  uuid NOT NULL REFERENCES access_lists(id) ON DELETE CASCADE,
  agenda_id       uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (access_list_id, agenda_id)
);

CREATE TABLE access_list_services (
  access_list_id  uuid NOT NULL REFERENCES access_lists(id) ON DELETE CASCADE,
  service_id      uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (access_list_id, service_id)
);

-- AccessList.clientIds: quem a lista deixa entrar.
CREATE TABLE access_list_clients (
  access_list_id  uuid NOT NULL REFERENCES access_lists(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (access_list_id, client_id)
);

CREATE INDEX access_list_clients_client_idx ON access_list_clients (client_id);

-- =====================================================================================
-- 6. Comunicação: modelos, regras e envios
-- =====================================================================================

-- "Modelos de Email".
CREATE TABLE email_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  subject          text NOT NULL,
  body             text NOT NULL DEFAULT ''
);

-- "Modelos de WhatsApp".
CREATE TABLE whatsapp_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  template_type    text NOT NULL,
  text             text NOT NULL DEFAULT ''
);

-- "Regras de Notificações" (NotificationRule).
CREATE TABLE notification_rules (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  to_client             boolean NOT NULL DEFAULT true,
  to_companions         boolean NOT NULL DEFAULT false,
  to_owner              boolean NOT NULL DEFAULT false,
  to_team               boolean NOT NULL DEFAULT false,
  channel               text NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp')),
  sms_text              text NOT NULL DEFAULT '',
  email_template_id     uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  whatsapp_template_id  uuid REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  survey_id             uuid REFERENCES surveys(id) ON DELETE SET NULL,
  immediate             boolean NOT NULL DEFAULT false,
  offset_direction      text NOT NULL DEFAULT 'before' CHECK (offset_direction IN ('before', 'after')),
  offset_days           integer NOT NULL DEFAULT 0,
  offset_hours          integer NOT NULL DEFAULT 0,
  offset_minutes        integer NOT NULL DEFAULT 0,
  status_filter         text NOT NULL DEFAULT ''
);

CREATE TABLE notification_rule_agendas (
  notification_rule_id  uuid NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
  agenda_id             uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (notification_rule_id, agenda_id)
);

-- "Notificações por Status" (StatusRule): disparam quando um agendamento chega a um status.
CREATE TABLE status_rules (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status                text NOT NULL CHECK (status IN ('PENDING', 'DECLINED', 'CONFIRMED', 'CANCELED', 'ATTENDED', 'NO_SHOW', 'PENDING_PAYMENT')),
  apply_to_subaccounts  boolean NOT NULL DEFAULT false,
  force_on_subaccounts  boolean NOT NULL DEFAULT false,
  send_to_companions    boolean NOT NULL DEFAULT false,
  send_to_owner         boolean NOT NULL DEFAULT false,
  via_whatsapp          boolean NOT NULL DEFAULT false,
  via_sms               boolean NOT NULL DEFAULT false,
  via_email             boolean NOT NULL DEFAULT false,
  whatsapp_template_id  uuid REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  sms_text              text NOT NULL DEFAULT '',
  email_template_id     uuid REFERENCES email_templates(id) ON DELETE SET NULL
);

CREATE TABLE status_rule_agendas (
  status_rule_id  uuid NOT NULL REFERENCES status_rules(id) ON DELETE CASCADE,
  agenda_id       uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  PRIMARY KEY (status_rule_id, agenda_id)
);

-- "Modelos de Email da Agenda" (AgendaEmailTemplate): um por status do agendamento.
CREATE TABLE agenda_email_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id   uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  email_type  text NOT NULL CHECK (email_type IN ('CANCELED', 'CONFIRMED', 'PENDING_CONFIRMATION', 'REFUSED', 'RESCHEDULED')),
  name        text NOT NULL DEFAULT 'Sem título',
  subject     text NOT NULL DEFAULT '',
  body        text NOT NULL DEFAULT '',
  UNIQUE (agenda_id, email_type)
);

-- Envios. NÃO EXISTE NO PROTÓTIPO: lá, "Acompanhamento" calcula os envios na hora
-- (src/lib/seiri/sends.ts). Com servidor, cada envio precisa ficar registrado para não ser
-- repetido, para descontar créditos e para mostrar se saiu ou falhou.
CREATE TABLE message_deliveries (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id        uuid REFERENCES appointments(id) ON DELETE SET NULL,
  notification_rule_id  uuid REFERENCES notification_rules(id) ON DELETE SET NULL,
  status_rule_id        uuid REFERENCES status_rules(id) ON DELETE SET NULL,
  channel               text NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp')),
  recipient             text NOT NULL,
  scheduled_for         timestamptz NOT NULL,
  sent_at               timestamptz,
  status                text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'canceled')),
  error                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX message_deliveries_due_idx ON message_deliveries (scheduled_for) WHERE status = 'scheduled';
CREATE UNIQUE INDEX message_deliveries_once_idx
  ON message_deliveries (appointment_id, notification_rule_id, channel, recipient)
  WHERE notification_rule_id IS NOT NULL;

-- Caixa de entrada do sino (InboxNotification). recipient_user_id nulo = toda a equipe.
CREATE TABLE inbox_notifications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_user_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  level              text NOT NULL CHECK (level IN ('info', 'warning', 'success', 'error')),
  title              text NOT NULL,
  text               text NOT NULL DEFAULT '',
  read_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inbox_notifications_unread_idx ON inbox_notifications (organization_id, recipient_user_id) WHERE read_at IS NULL;

-- =====================================================================================
-- 7. Convites de cadastro de clientes
-- =====================================================================================

-- Textos reutilizáveis do fluxo de convite (InviteEmailTemplate).
CREATE TABLE invite_email_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kind             text NOT NULL CHECK (kind IN ('INVITE', 'PRE_REGISTRATION', 'APPROVED', 'BOOKING_RELEASED')),
  name             text NOT NULL,
  subject          text NOT NULL,
  body             text NOT NULL DEFAULT '',     -- "Mensagem extra", somada à do sistema
  is_default       boolean NOT NULL DEFAULT false
);

-- Um texto padrão por momento, por organização.
CREATE UNIQUE INDEX invite_email_templates_default_idx ON invite_email_templates (organization_id, kind) WHERE is_default;

-- RegistrationInvite: um lote de e-mails, um formulário.
CREATE TABLE registration_invites (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name               text NOT NULL,
  email_template_id  uuid REFERENCES invite_email_templates(id) ON DELETE SET NULL,  -- nulo = texto padrão do sistema
  auto_approve       boolean NOT NULL DEFAULT false,
  ask_password       boolean NOT NULL DEFAULT false,
  expires_in_days    integer NOT NULL DEFAULT 0,  -- 0 = não expira
  status             text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENDING', 'SENT', 'ARCHIVED')),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- RegistrationInvite.emails: um link único por destinatário.
CREATE TABLE registration_invite_recipients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id   uuid NOT NULL REFERENCES registration_invites(id) ON DELETE CASCADE,
  email       text NOT NULL,
  token       text NOT NULL UNIQUE,
  sent_at     timestamptz,
  UNIQUE (invite_id, email)
);

-- RegistrationInvite.fields / requiredFields (ids de INVITE_FIELDS).
CREATE TABLE registration_invite_fields (
  invite_id  uuid NOT NULL REFERENCES registration_invites(id) ON DELETE CASCADE,
  field      text NOT NULL CHECK (field IN ('telefone', 'cpf', 'data_nascimento', 'genero', 'nacionalidade',
               'profissao', 'local_nascimento', 'doc_id', 'empresa', 'matricula', 'endereco')),
  required   boolean NOT NULL DEFAULT false,
  PRIMARY KEY (invite_id, field)
);

-- RegistrationSubmission: o que chegou pelos links, à espera de decisão.
CREATE TABLE registration_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id     uuid NOT NULL REFERENCES registration_invites(id) ON DELETE CASCADE,
  recipient_id  uuid REFERENCES registration_invite_recipients(id) ON DELETE SET NULL,
  name          text NOT NULL,
  email         text NOT NULL,
  answers       jsonb NOT NULL DEFAULT '{}'::jsonb,   -- chaveado pelo id de INVITE_FIELDS
  status        text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTO_APPROVED', 'APPROVED', 'REJECTED')),
  reason        text,                                 -- motivo da rejeição
  client_id     uuid REFERENCES clients(id) ON DELETE SET NULL,  -- cliente criado ao aprovar
  received_at   timestamptz NOT NULL DEFAULT now(),
  decided_at    timestamptz
);

-- =====================================================================================
-- 8. Plano, créditos e cobrança
-- =====================================================================================

-- Catálogo de planos (PLAN_OFFERS), igual para todas as organizações.
CREATE TABLE plans (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id           text UNIQUE,              -- o id do original em /users/confirmar-plano/<id>
  name                text NOT NULL,
  max_appointments    integer NOT NULL,         -- por mês
  max_users           integer NOT NULL,
  active              boolean NOT NULL DEFAULT true
);

-- Frequências de pagamento de cada plano (PLAN_PRICINGS).
CREATE TABLE plan_prices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  legacy_id    text UNIQUE,
  cycle        text NOT NULL CHECK (cycle IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  amount       numeric(12, 2) NOT NULL,         -- cobrado por ciclo
  UNIQUE (plan_id, cycle)
);

-- "Personalize seu Plano" (PLAN_EXTRAS) e "Funcionalidades Extras" (PLAN_FEATURES).
CREATE TABLE plan_addons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  label       text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('unit', 'feature')),   -- preço por unidade ou mensalidade fixa
  unit_price  numeric(12, 2) NOT NULL
);

-- A assinatura da organização (Data.plan). Os medidores de uso (agendamentos e usuários
-- usados) são contados das tabelas appointments e members, não guardados.
CREATE TABLE subscriptions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_price_id    uuid NOT NULL REFERENCES plan_prices(id),
  status           text NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'expired')),
  billing_person   text CHECK (billing_person IN ('individual', 'company')),  -- BILLING_PERSON_TYPES
  started_at       timestamptz NOT NULL DEFAULT now(),
  ends_at          timestamptz,
  canceled_at      timestamptz
);

-- Uma assinatura em vigor por organização; as anteriores ficam como histórico (aba "Histórico").
CREATE UNIQUE INDEX subscriptions_current_idx ON subscriptions (organization_id) WHERE status IN ('trial', 'active', 'past_due');

CREATE TABLE subscription_addons (
  subscription_id  uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  addon_id         uuid NOT NULL REFERENCES plan_addons(id),
  quantity         integer NOT NULL DEFAULT 1,
  PRIMARY KEY (subscription_id, addon_id)
);

-- Faturas da assinatura (Payment, aba "Pagamentos").
CREATE TABLE invoices (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id  uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount           numeric(12, 2) NOT NULL,
  status           text NOT NULL CHECK (status IN ('open', 'paid', 'overdue', 'canceled')),
  due_date         date NOT NULL,
  paid_at          timestamptz,
  barcode          text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Saldos (Credits): AgendaCoins e créditos por canal, e como as coins são pagas.
CREATE TABLE credit_balances (
  organization_id       uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  coins                 integer NOT NULL DEFAULT 0,   -- Credits.general
  sms                   integer NOT NULL DEFAULT 0,
  email                 integer NOT NULL DEFAULT 0,
  whatsapp              integer NOT NULL DEFAULT 0,
  auto_recharge_coins   integer NOT NULL DEFAULT 0,   -- 0 = recarga mensal desligada
  payment_method        text NOT NULL DEFAULT '',     -- referência ao cartão no gateway, nunca o número
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (coins >= 0 AND sms >= 0 AND email >= 0 AND whatsapp >= 0)
);

-- Movimentos de AgendaCoins (CoinTransaction).
CREATE TABLE coin_transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kind             text NOT NULL,
  amount           integer NOT NULL,                  -- positivo entra, negativo sai
  description      text NOT NULL DEFAULT '',
  status           text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Pacotes de envio comprados (CreditPurchase).
CREATE TABLE credit_purchases (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel          text NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp')),
  quantity         integer NOT NULL,
  used             integer NOT NULL DEFAULT 0,
  status           text NOT NULL,
  purchased_at     timestamptz NOT NULL DEFAULT now()
);

-- "Programa de Indicações" (Referral). referred_organization_id liga à empresa indicada quando
-- ela existe no próprio Seiri.
CREATE TABLE referrals (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id           uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referred_organization_id  uuid REFERENCES organizations(id) ON DELETE SET NULL,
  referred_name             text NOT NULL,
  status                    text NOT NULL CHECK (status IN ('pending', 'first_payment', 'loyalty_rewarded', 'cancelled')),
  first_payment_reward      numeric(12, 2) NOT NULL DEFAULT 0,
  loyalty_reward            numeric(12, 2) NOT NULL DEFAULT 0,
  payments_count            integer NOT NULL DEFAULT 0,
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================================
-- 9. Suporte e históricos
-- =====================================================================================

-- Código de acesso do suporte (SupportCode). Gerar um novo revoga o anterior.
CREATE TABLE support_access_codes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token_hash       text NOT NULL,
  expires_at       timestamptz NOT NULL,
  revoked_at       timestamptz,
  created_by       uuid REFERENCES members(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Visitas da equipe de suporte (SupportVisit).
CREATE TABLE support_visits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  access_code_id   uuid REFERENCES support_access_codes(id) ON DELETE SET NULL,
  agent            text NOT NULL,
  started_at       timestamptz NOT NULL,
  ended_at         timestamptz,
  pages_viewed     integer NOT NULL DEFAULT 0,
  status           text NOT NULL CHECK (status IN ('closed', 'in_progress', 'expired'))
);

-- Logs de uma agenda (AgendaLog), nas duas abas.
CREATE TABLE agenda_change_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id    uuid NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  member_id    uuid REFERENCES members(id) ON DELETE SET NULL,
  action       text NOT NULL CHECK (action IN ('create', 'update', 'add', 'remove')),
  kind         text NOT NULL CHECK (kind IN ('config', 'hours')),
  field        text NOT NULL,               -- a configuração, ou o dia da semana numa linha de horários
  old_value    text NOT NULL DEFAULT '',
  new_value    text NOT NULL DEFAULT '',
  is_color     boolean NOT NULL DEFAULT false,
  changed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX agenda_change_logs_agenda_idx ON agenda_change_logs (agenda_id, kind, changed_at DESC);

-- "Histórico de Atividades de Usuários" (TeamLog).
CREATE TABLE team_activity_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id        uuid REFERENCES members(id) ON DELETE SET NULL,
  agenda_id        uuid REFERENCES agendas(id) ON DELETE SET NULL,
  appointment_id   uuid REFERENCES appointments(id) ON DELETE SET NULL,
  slot_at          timestamptz,
  action           text NOT NULL,
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX team_activity_logs_org_idx ON team_activity_logs (organization_id, occurred_at DESC);


-- =====================================================================================
-- 10. Webhooks, domínios e importação de clientes
-- =====================================================================================

-- "Webhook" (Integrações): para onde o Seiri faz POST quando um registro muda.
CREATE TABLE webhooks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_type       text NOT NULL CHECK (class_type IN ('APPOINTMENT', 'CALENDAR', 'MEMBERSHIP')),
  url              text NOT NULL,
  auth_header      jsonb NOT NULL DEFAULT '{}'::jsonb,   -- "Cabeçalho de Autenticação (JSON)"
  created_at       timestamptz NOT NULL DEFAULT now(),
  -- Alvo da chave estrangeira composta de webhook_events, abaixo.
  UNIQUE (id, class_type)
);

CREATE INDEX webhooks_org_idx ON webhooks (organization_id);

-- Os eventos que disparam um webhook. A tela só oferece cada evento para certos tipos de
-- registro (não existe cancelamento de agenda, nem exclusão de agendamento), e é isso que o
-- CHECK garante: class_type é repetido aqui só para que a regra possa ser escrita no banco,
-- e a chave estrangeira composta impede que ele divirja do webhook.
CREATE TABLE webhook_events (
  webhook_id  uuid NOT NULL,
  class_type  text NOT NULL,
  event       text NOT NULL CHECK (event IN ('CREATED', 'UPDATED', 'CANCELED', 'DELETED')),
  PRIMARY KEY (webhook_id, event),
  FOREIGN KEY (webhook_id, class_type) REFERENCES webhooks (id, class_type) ON DELETE CASCADE,
  CHECK (
    event IN ('CREATED', 'UPDATED')
    OR (event = 'CANCELED' AND class_type = 'APPOINTMENT')
    OR (event = 'DELETED' AND class_type IN ('CALENDAR', 'MEMBERSHIP'))
  )
);

-- "Gerenciamento de Domínios": os domínios que a organização reivindica, provados por um TXT.
CREATE TABLE organization_domains (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'failed')),
  txt_value        text NOT NULL,              -- o registro TXT que a tela manda publicar no DNS
  verified_at      timestamptz,                -- vazio no protótipo enquanto não verificado
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name),
  -- A data existe exatamente quando o domínio está verificado.
  CHECK ((status = 'verified') = (verified_at IS NOT NULL))
);

-- Duas organizações podem pedir o mesmo domínio, mas só uma chega a prová-lo.
CREATE UNIQUE INDEX organization_domains_verified_name_idx
  ON organization_domains (name)
  WHERE status = 'verified';

-- "Histórico de Importação" (Importar Clientes): um envio de planilha e como ele terminou.
CREATE TABLE client_imports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id        uuid REFERENCES members(id) ON DELETE SET NULL,   -- quem enviou o arquivo
  file_name        text NOT NULL,
  status           text NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'DONE', 'FAILED')),
  started_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX client_imports_org_idx ON client_imports (organization_id, started_at DESC);

COMMIT;
