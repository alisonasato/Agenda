/** Shapes of the data the Seiri prototype keeps in the browser. */

export type Status = "PENDING" | "CONFIRMED" | "ATTENDED" | "NO_SHOW" | "CANCELED";

/** `slug` is the "Identificador da Agenda"; without it the agenda has no friendly link. */
/** `accountId` is the sub-account the agenda belongs to; unset means the main account. */
export type Agenda = { id: string; name: string; color: string; active: boolean; slug?: string; unitId?: string; accountId?: string };

export type Service = {
  id: string;
  name: string;
  price: number | null;
  duration: number;
  agendaIds: string[];
  tagIds: string[];
  order: number;
  color: string;
  /** "Máximo de pessoas no mesmo horário"; null means the agenda's own limit. */
  maxPeople: number | null;
  /** Names of the team members who attend it. */
  members: string[];
};

export type Tag = { id: string; name: string };

/** The four pills the edit page offers; the quick form only sets the first two. */
export type Gender = "Masculino" | "Feminino" | "Outro" | "Prefiro não informar";

/** The address block the client forms keep under "Endereço". */
export type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  /** "Distrito", only on the edit page. */
  district: string;
  country: string;
  state: string;
  city: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  gender?: Gender;
  /** "dd/mm/aaaa", the way the form shows it. */
  birthday?: string;
  nationality?: string;
  profession?: string;
  /** One of MARITAL_STATUS below. */
  maritalStatus?: string;
  address?: Address;
  /** "Tipo de identidade" (RG, CNH, …) and its number, from the edit page. */
  identificationType?: string;
  identificationNumber?: string;
  /** "Naturalidade". */
  placeOfBirth?: string;
  companyName?: string;
  companyCnpj?: string;
  /** The original "desativa" a client: it leaves the lists, its appointments stay. */
  inactive?: boolean;
  /** The "Cliente ID" of an authorized client, which its own booking link carries. */
  accessKey?: string;
};

/** "Tipo de identidade" options, with the values the original stores. */
export const IDENTIFICATION_TYPES = [
  { value: "1", label: "RG" },
  { value: "2", label: "CNH" },
  { value: "3", label: "Passaporte" },
  { value: "4", label: "Carteira de Trabalho" },
  { value: "5", label: "Carteira de Identidade Profissional (OAB, CRC, CRM, CRA, CREA, etc)" },
];

/** "Estado Civil" options, with the values the original stores. */
export const MARITAL_STATUS = [
  { value: "Single", label: "Solteiro(a)" },
  { value: "Married", label: "Casado(a)" },
  { value: "Divorced", label: "Divorciado(a)" },
  { value: "Widower", label: "Viúvo(a)" },
  { value: "StableUnion", label: "União Estável" },
];

export type Appointment = {
  id: string;
  /** The original's "Identificador": a short code shown in the first column. */
  code: string;
  clientId: string;
  agendaId: string;
  serviceId: string;
  /** Start of the appointment, ISO 8601 with no timezone ("2026-09-24T09:00"). */
  start: string;
  /** Minutes. */
  duration: number;
  status: Status;
  owner: string;
  tagIds: string[];
  comment: string;
  /** Ticked on "Aceitar Agendamento"; the receipt reads it. */
  paidExternally?: boolean;
  /** "25/09/2026 22:18", shown under Detalhes and beside the time in the list. */
  createdAt?: string;
  updatedAt?: string;
  /** The "Alterações" tab of the detail page. */
  changes?: { at: string; user: string; text: string }[];
  /** Set when the appointment came from a recurrence. */
  recurrenceId?: string;
};

/** A rule that repeats an appointment, from "Agendamentos Recorrentes". */
export type Recurrence = {
  id: string;
  /** The short code the table's "Identificador" column shows. */
  code: string;
  /** "dd/mm/aaaa hh:mm". */
  createdAt: string;
  label: string;
  agendaId: string;
  serviceId: string;
  /** The first occurrence, same format as `Appointment.start`. */
  start: string;
  status: Status;
  clientIds: string[];
  owner: string;
  tagIds: string[];
  /** Weekdays it repeats on (0 = Sunday). */
  weekdays: number[];
  /** "A cada N semanas". */
  interval: number;
  /** "dd/mm/aaaa", empty when only the count limits it. */
  endDate: string;
  maxCount: number;
  notify: boolean;
};

/** "Limites de Agendamentos": how many appointments or no-shows a client may pile up. */
export type LimitType = "AGENDAMENTOS" | "FALTAS";

/** The window the count is taken over. */
export type LimitInterval = "HORARIO" | "DIA" | "SEMANA" | "MES" | "NDAYS";

export const LIMIT_INTERVALS: { value: LimitInterval; label: string }[] = [
  { value: "HORARIO", label: "POR HORÁRIOS" },
  { value: "DIA", label: "POR DIA" },
  { value: "SEMANA", label: "POR SEMANA" },
  { value: "MES", label: "POR MÊS" },
  { value: "NDAYS", label: "DIAS CORRIDOS" },
];

/** Which client fields identify "the same person" for the count. */
export type LimitKey =
  "personal_identification_number" | "user" | "email" | "nome" | "phone" | "phone+name" | "email+name" | "phone+name+email" | "source_ip" | "custom" | "count";

export const LIMIT_KEYS: { value: LimitKey; label: string }[] = [
  { value: "personal_identification_number", label: "CPF" },
  { value: "user", label: "Usuário Cadastrado" },
  { value: "email", label: "Email" },
  { value: "nome", label: "Nome" },
  { value: "phone", label: "Telefone" },
  { value: "phone+name", label: "Mesmos Nome e Telefone" },
  { value: "email+name", label: "Mesmos Nome e E-mail" },
  { value: "phone+name+email", label: "Mesmos Nome, Telefone e E-mail" },
  { value: "source_ip", label: "IP de Origem" },
  { value: "custom", label: "Chave Customizada" },
  { value: "count", label: "Total de Agendamentos" },
];

export type BookingLimit = {
  id: string;
  type: LimitType;
  key: LimitKey | "";
  /** Empty means "todas as agendas em conjunto". */
  agendaIds: string[];
  /** Empty means "todos os serviços". */
  serviceIds: string[];
  interval: LimitInterval | "";
  /** Only used when the interval is NDAYS. */
  days: number;
  max: number;
};

/** A "Feriado Customizado": a day (or a stretch of days) an agenda does not attend. */
export type Holiday = {
  id: string;
  name: string;
  /** "aaaa-mm-dd". */
  date: string;
  /** "aaaa-mm-dd" for a stretch of days, empty for a single one. */
  endDate: string;
  allDay: boolean;
  /** "hh:mm", only used when it does not block the whole day. */
  startTime: string;
  endTime: string;
  /** Empty means "aplicar em todas as agendas". */
  agendaIds: string[];
};

/** What "Feriados da agenda" decides for one agenda. */
export type HolidayRules = {
  national: boolean;
  state: boolean;
  /** The national dates ("aaaa-mm-dd") unticked in "Personalizar quais feriados bloquear". */
  skipped: string[];
};

export const DEFAULT_HOLIDAY_RULES: HolidayRules = { national: false, state: false, skipped: [] };

/** What a "Lista de Bloqueio" entry matches a would-be client by. */
export type BlockType = "email" | "phone" | "identification";

export const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "identification", label: "CPF" },
];

/** A contact that may not book, from "Listas de Bloqueio". */
export type Suppression = {
  id: string;
  type: BlockType;
  /** The e-mail, phone or CPF itself. */
  contact: string;
  reason: string;
  /** "aaaa-mm-ddThh:mm", empty when the block never expires. */
  expiresAt: string;
  /** "dd/mm/aaaa hh:mm". */
  createdAt: string;
  createdBy: string;
  active: boolean;
};

/** How a notification rule reaches people. */
export type Channel = "sms" | "email" | "whatsapp";

export const CHANNEL_LABELS: Record<Channel, string> = { sms: "SMS", email: "Email", whatsapp: "WhatsApp" };

/** A rule from "Regras de Notificações". */
export type NotificationRule = {
  id: string;
  title: string;
  /** Empty means "aplicar a todas as agendas". */
  agendaIds: string[];
  recipients: { client: boolean; companions: boolean; owner: boolean; team: boolean };
  channel: Channel | "";
  smsText: string;
  /** The template id, for the email and whatsapp channels. */
  emailTemplate: string;
  whatsappTemplate: string;
  survey: string;
  /** Sends as soon as the appointment is created; otherwise the offset below applies. */
  immediate: boolean;
  when: "before" | "after";
  days: number;
  hours: number;
  minutes: number;
  /** The "Filtro de Status" of whichever side `when` picked. */
  statusFilter: string;
};

/** A rule from "Notificações por Status": fires when an appointment reaches a status. */
export type StatusRule = {
  id: string;
  /** One of STATUS_RULE_STATUSES below. */
  status: string;
  /** Empty means "aplicar a regra em todas as agendas", which is what "Regras Gerais" lists. */
  agendaIds: string[];
  applyToSubaccounts: boolean;
  forceOnSubaccounts: boolean;
  sendToCompanions: boolean;
  sendToOwner: boolean;
  channels: { whatsapp: boolean; sms: boolean; email: boolean };
  whatsappTemplate: string;
  smsText: string;
  emailTemplate: string;
};

/** The statuses that form offers, which are not quite the appointment ones. */
export const STATUS_RULE_STATUSES: { value: string; label: string }[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "DECLINED", label: "Recusado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "ATTENDED", label: "Atendido" },
  { value: "NO_SHOW", label: "Não Compareceu" },
  { value: "PENDING_PAYMENT", label: "Pagamento Pendente" },
];

/** A model from "Modelos de Email". */
export type EmailTemplate = { id: string; name: string; subject: string; body: string };

/** A model from "Modelos de WhatsApp". */
export type WhatsappTemplate = { id: string; name: string; type: string; text: string };

export const WHATSAPP_TEMPLATE_TYPES: { value: string; label: string }[] = [
  { value: "follow_up_info", label: "Mensagem de Resposta Automática - Mais Informações" },
];

/** A place from "Administrar Unidades"; agendas point at one through `Agenda.unitId`. */
export type Unit = {
  id: string;
  name: string;
  /** "Nome para o Link". */
  slug: string;
  email: string;
  phone: string;
  whatsapp: string;
  description: string;
  address: Address;
};

/** Someone on the team, from "Administrar Equipe". */
export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** One of MEMBER_PROFILES below. */
  profile: string;
  active: boolean;
  /** Empty means "permitir acesso à todas as agendas". */
  agendaIds: string[];
  serviceIds: string[];
  tagIds: string[];
  permissions: string[];
  /** "dd/mm/aaaa hh:mm", empty for someone who never signed in. */
  lastLogin: string;
  /** The sub-account this member belongs to; unset means the main account. */
  accountId?: string;
};

export const MEMBER_PROFILES: { value: string; label: string }[] = [
  { value: "owner", label: "Proprietário da Conta" },
  { value: "manager", label: "Administrador" },
  { value: "oper", label: "Colaborador" },
  { value: "read", label: "Visualização" },
];

/** A sub-account from "Administrar Contas". Agendas and members point at one through `accountId`. */
export type SubAccount = {
  id: string;
  name: string;
  /** "Sigla para link de agendamento". */
  slug: string;
  email: string;
  phone: string;
  address: Address;
  /** "Ativo", "Expirado" or "" for a sub-account with no plan. */
  plan: string;
};

/** Every field of "Configurações Gerais", by the name the form gives it. */
export type OrgSettings = Record<string, string | boolean>;

/** The same idea for "Tela de Agendamento", which posts one form for all of its steps. */
export type BookingScreen = Record<string, string | boolean>;

/** The credit balances the Comunicação pages show, and what "Pacotes de Envio" lists. */
/** The coin balance, the notification credits and how the coins are paid for. */
export type Credits = {
  general: number;
  sms: number;
  email: number;
  whatsapp: number;
  /** Coins added every month, 0 when the monthly recharge is off. */
  autoRecharge: number;
  /** Empty when no card is on file. */
  paymentMethod: string;
};

export type CreditPurchase = {
  id: string;
  /** "dd/mm/aaaa". */
  date: string;
  /** "SMS", "Email" or "WhatsApp". */
  kind: string;
  bought: number;
  used: number;
  status: string;
};

/** A company that signed up through the account's referral link. */
export type Referral = {
  id: string;
  organization: string;
  /** "pending", "first_payment", "loyalty_rewarded" or "cancelled". */
  status: string;
  /** Reward in reais for the referred company's first payment. */
  firstPayment: number;
  /** Reward in reais for six months of payments. */
  loyalty: number;
  payments: number;
  /** "dd/mm/aaaa". */
  date: string;
};

/** A list from "Listas de Controle de Acesso": who may book, and under what limits. */
export type AccessList = {
  id: string;
  title: string;
  /** One of ACCESS_KEY_TYPES below. */
  keyType: string;
  maxAppointments: number;
  /** One of ACCESS_INTERVALS below. */
  interval: string;
  /** Only used when the interval is NDAYS. */
  days: number;
  /** "dd/mm/aaaa", empty when it never expires. */
  expiresAt: string;
  /** "dd/mm/aaaa", the last day the list may book. */
  maxDate: string;
  /** Empty means "acessar todas as agendas". */
  agendaIds: string[];
  /** Empty means "acessar todos os serviços". */
  serviceIds: string[];
  loginRequired: boolean;
  helpText: string;
  useExternalList: boolean;
  externalApiUrl: string;
  unauthorizedMessage: string;
  /** The clients the list lets in. */
  clientIds: string[];
  active: boolean;
};

export const ACCESS_KEY_TYPES: { value: string; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Telefone" },
  { value: "PIN", label: "CPF" },
  { value: "PASSPORT", label: "Passaporte" },
  { value: "CONTRACT", label: "Número de Contrato" },
  { value: "INVITE_CODE", label: "Código de Convite" },
];

export const ACCESS_INTERVALS: { value: string; label: string }[] = [
  { value: "DIA", label: "Por Dia" },
  { value: "SEMANA", label: "Por semana" },
  { value: "MES", label: "Por Mês" },
  { value: "15D", label: "15 Dias Corridos" },
  { value: "30D", label: "30 Dias Corridos" },
  { value: "NDAYS", label: "Dias Corridos" },
  { value: "UNDEF", label: "Sem Prazo" },
];

/** One visit the support team made to the account, from "Autorizar Suporte". */
export type SupportVisit = {
  id: string;
  agent: string;
  /** "dd/mm/aaaa hh:mm". */
  start: string;
  pages: number;
  /** In minutes. */
  duration: number;
  /** "Encerrado", "Em andamento" or "Expirado". */
  status: string;
};

/** The access code in force, if any. */
export type SupportCode = { token: string; expires: string } | null;

/** Which integrations are connected, by the name the card shows. */
export type Integrations = Record<string, boolean>;

/** A row of "Horários Manuais", from the "Incluir Horários" batch action. */
export type ManualHours = {
  id: string;
  agendaIds: string[];
  /** "aaaa-mm-dd". */
  from: string;
  to: string;
  startTime: string;
  endTime: string;
  /** Minutes between slots. */
  interval: number;
  maxPeople: number;
};

/** A form from "Formulários". */
export type Survey = {
  id: string;
  name: string;
  description: string;
  /** One of the survey stages the form offers. */
  stage: string;
  /** Empty means the form is not tied to an agenda yet. */
  agendaIds: string[];
  /** "dd/mm/aaaa", empty when it never expires. */
  expiresAt: string;
  loginRequired: boolean;
  /** The imported template, empty when the form was created from scratch. */
  template: string;
  questions: number;
  responses: number;
};

/** The account's subscription, as "Planos" shows it. */
/** The permissions a user group may hold, as /autocomplete/member_permissions lists them. */
export const MEMBER_PERMISSIONS = [
  "Cadastro de Clientes - Leitura",
  "Cadastro de Clientes - Escrita",
  "Cadastro de Clientes - Excluir Dados",
  "Relatórios - Acesso ao Módulo",
  "Agendamentos - Criar/Editar/Cancelar",
  "Agendas - Criar/Editar/Excluir",
  "Financeiro - Acesso a Faturamento e Pagamentos",
] as const;

/** One step of the public booking screen: a group of agendas the visitor picks between. */
export type AgendaGroup = {
  id: string;
  /** "Nome do Grupo", shown on the booking screen. */
  label: string;
  /** "Nome para o Link"; filled from the name when left empty. */
  slug: string;
  order: number;
  /** Empty when the step chooses between other groups instead of agendas. */
  agendaIds: string[];
  /** "Texto da Tela do Grupo", rich text. */
  description: string;
};

/** A row of "Grupos de Usuários". */
export type UserGroup = {
  id: string;
  name: string;
  description: string;
  /** Members of `members`, by id. */
  memberIds: string[];
  /** Entries of MEMBER_PERMISSIONS. */
  permissions: string[];
  active: boolean;
};

/** A row of an agenda's "Logs", in either of the two tabs. */
export type AgendaLog = {
  id: string;
  agendaId: string;
  /** "dd/mm/aaaa hh:mm". */
  at: string;
  user: string;
  /** "Criar", "Atualizar", "Adicionar" or "Remover". */
  action: string;
  /** Which tab the row belongs to. */
  kind: "config" | "hours";
  /** The setting that changed, or the weekday for an hours row. */
  field: string;
  /** The old and new values; for an hours row, the start and the end of the window. */
  before: string;
  after: string;
  /** Set when the new value is a colour, so the row shows its swatch. */
  color?: boolean;
};

/** A "Modelos de Email da Agenda" row. The last two labels are untranslated on the live site too. */
export const AGENDA_EMAIL_TYPES = ["Agendamento Cancelado", "Agendamento Confirmado", "Agendamento Pendente Confirmação", "refused", "rescheduled"] as const;

export type AgendaEmailTemplate = {
  id: string;
  agendaId: string;
  /** One of AGENDA_EMAIL_TYPES. */
  type: string;
  /** "Sem título" while the template has no name of its own. */
  name: string;
  subject: string;
};

/** A line of the notifications inbox. */
export type InboxNotification = {
  id: string;
  level: NotificationLevel;
  title: string;
  text: string;
  /** "dd/mm/aaaa hh:mm". */
  at: string;
  read: boolean;
};

export type NotificationLevel = "info" | "warning" | "success" | "error";

export const NOTIFICATION_LEVELS: { value: "" | NotificationLevel; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "info", label: "Informação" },
  { value: "warning", label: "Alerta" },
  { value: "success", label: "Sucesso" },
  { value: "error", label: "Erro" },
];

export const NOTIFICATION_STATUSES: { value: "" | "unread" | "read"; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "unread", label: "Não lidas" },
  { value: "read", label: "Lidas" },
];

/** "Sua Conta": what the signed-in user's own account page keeps, beside their member record. */
export type Profile = {
  emailVerified: boolean;
  newsletter: boolean;
  /** Providers already connected: "Facebook", "Google" or "Microsoft Graph". */
  socialAccounts: string[];
  /** Addresses added beside the member's own, none of them verified yet. */
  extraEmails: string[];
  /** The organisation the user owns, as the Organizações table names it. */
  orgSlug: string;
  /** The "Som ativado" toggle at the top of the notifications inbox. */
  notificationSound: boolean;
};

export const SOCIAL_PROVIDERS = ["Facebook", "Google", "Microsoft Graph"] as const;

export type Plan = {
  name: string;
  /** "Mensal" or "Anual". */
  cycle: string;
  /** In reais, per cycle. */
  price: number;
  appointmentsUsed: number;
  appointmentsMax: number;
  usersUsed: number;
  usersMax: number;
  /** The small print under the meters. */
  note: string;
  limits: string;
};

/** One AgendaCoins movement, from "Detalhes de AgendaCoins". */
export type CoinTransaction = {
  id: string;
  /** "dd/mm/aaaa hh:mm". */
  at: string;
  kind: string;
  amount: number;
  description: string;
  status: string;
};

/** A subscription invoice, from the "Pagamentos" tab. */
export type Payment = {
  id: string;
  status: string;
  /** "dd/mm/aaaa". */
  dueDate: string;
  barcode: string;
};

/** A line of the "Histórico" tab. */
export type PlanChange = {
  id: string;
  plan: string;
  status: string;
  /** "dd/mm/aaaa". */
  startedAt: string;
  amount: number;
  period: string;
};

export type WaitingEntry = {
  id: string;
  clientId: string;
  agendaId: string;
  serviceId: string;
  /** Wished slot, same format as `Appointment.start`. */
  start: string;
  status: "waiting" | "scheduled" | "cancelled";
  position: number;
  createdAt: string;
};

/** The switches the agenda's Formulários, Notificações, Avançadas and Acessos steps keep. */
export type AgendaOptions = {
  /** "Dados solicitados no agendamento". */
  requestEmail: boolean;
  emailRequired: boolean;
  requestPhone: boolean;
  phoneRequired: boolean;
  requestCpf: boolean;
  requestDocument: boolean;
  requestBirthday: boolean;
  requestGender: boolean;
  requestNationality: boolean;
  requestPlaceOfBirth: boolean;
  requestProfession: boolean;
  requestAddress: boolean;
  extraTextField: boolean;
  /** "Formulários": which form answers each stage. */
  appointmentForm: string;
  preSurvey: string;
  internalSurvey: string;
  postSurvey: string;
  /** "Notificações". */
  notifyInternally: boolean;
  notifyByEmail: boolean;
  emailCc: string;
  smsCc: string;
  emailClient: boolean;
  /** "Avançadas". */
  blockExternalBooking: boolean;
  authorizedOnly: boolean;
  password: string;
  distributeAutomatically: boolean;
  usersGroup: string;
  allowCompanions: boolean;
  countCompanions: boolean;
  requestCompanionData: boolean;
  emailCompanions: boolean;
  maxCompanions: number;
  groupService: boolean;
  allowRecurring: boolean;
  waitingList: boolean;
  defaultValue: number;
  /** "Acessos". */
  ownerUser: string;
  accessUsers: string[];
};

export const DEFAULT_OPTIONS: AgendaOptions = {
  requestEmail: true,
  emailRequired: true,
  requestPhone: true,
  phoneRequired: true,
  requestCpf: false,
  requestDocument: false,
  requestBirthday: false,
  requestGender: false,
  requestNationality: false,
  requestPlaceOfBirth: false,
  requestProfession: false,
  requestAddress: false,
  extraTextField: false,
  appointmentForm: "",
  preSurvey: "",
  internalSurvey: "",
  postSurvey: "",
  notifyInternally: true,
  notifyByEmail: true,
  emailCc: "",
  smsCc: "",
  emailClient: true,
  blockExternalBooking: false,
  authorizedOnly: false,
  password: "",
  distributeAutomatically: false,
  usersGroup: "",
  allowCompanions: false,
  countCompanions: false,
  requestCompanionData: false,
  emailCompanions: false,
  maxCompanions: 0,
  groupService: false,
  allowRecurring: false,
  waitingList: false,
  defaultValue: 0,
  ownerUser: "",
  accessUsers: [],
};

/** The rules the agenda's "Horários" step keeps: how long, how often and how far ahead. */
export type AgendaRules = {
  /** "Duração do Atendimento (min)". */
  duration: number;
  /** "Intervalo entre Atendimentos (min)". */
  gap: number;
  /** "Agendamentos por Horário". */
  maxPeople: number;
  /** "Granularidade dos Horários (min)"; 0 uses duration + gap. */
  granularity: number;
  /** "Antecedência Mínima (horas)" and "Antecedência Máxima (dias)". */
  minNotice: number;
  maxAhead: number;
  releaseHour: number;
  cancelMin: number;
  cancelDeadline: number;
  businessDaysOnly: boolean;
  blockNationalHolidays: boolean;
  blockStateHolidays: boolean;
  /** "dd/mm/aaaa", empty for an agenda with no end. */
  startDate: string;
  endDate: string;
};

export const DEFAULT_RULES: AgendaRules = {
  duration: 30,
  gap: 0,
  maxPeople: 1,
  granularity: 0,
  minNotice: 1,
  maxAhead: 30,
  releaseHour: 0,
  cancelMin: 0,
  cancelDeadline: 0,
  businessDaysOnly: false,
  blockNationalHolidays: true,
  blockStateHolidays: false,
  startDate: "",
  endDate: "",
};

/** One working interval of a weekday, as "Configurar Horários" edits it. */
export type Interval = { start: string; end: string; max: number | null };

/** Working intervals per agenda, indexed by weekday (0 = Sunday). An empty day is "Fechado". */
export type Hours = Record<string, Interval[][]>;

/** A range the agenda does not take bookings in ("Bloquear Horários"). */
export type Block = {
  id: string;
  agendaIds: string[];
  /** "2026-09-26"; `to` repeats `from` for a single day. */
  from: string;
  to: string;
  /** "09:00", or "" for the whole day. */
  startTime: string;
  endTime: string;
  reason: string;
};

/** What the slot modals change on one half-hour slot, keyed "<agendaId>|<start>". */
export type SlotInfo = { start?: string; end?: string; max?: number | null; videoProvider?: string; videoUrl?: string };

export type Data = {
  agendas: Agenda[];
  services: Service[];
  tags: Tag[];
  clients: Client[];
  appointments: Appointment[];
  waiting: WaitingEntry[];
  hours: Hours;
  blocks: Block[];
  slotInfo: Record<string, SlotInfo>;
  agendaRules: Record<string, AgendaRules>;
  agendaOptions: Record<string, AgendaOptions>;
  recurrences: Recurrence[];
  limits: BookingLimit[];
  holidays: Holiday[];
  holidayRules: Record<string, HolidayRules>;
  suppressions: Suppression[];
  notificationRules: NotificationRule[];
  statusRules: StatusRule[];
  emailTemplates: EmailTemplate[];
  whatsappTemplates: WhatsappTemplate[];
  units: Unit[];
  members: Member[];
  accounts: SubAccount[];
  orgSettings: OrgSettings;
  bookingScreen: BookingScreen;
  credits: Credits;
  creditPurchases: CreditPurchase[];
  referrals: Referral[];
  accessLists: AccessList[];
  supportVisits: SupportVisit[];
  supportCode: SupportCode;
  /** The token the WhatsApp activation screen asks the user to send. */
  whatsappCode: string;
  teamLogs: TeamLog[];
  integrations: Integrations;
  manualHours: ManualHours[];
  surveys: Survey[];
  profile: Profile;
  notifications: InboxNotification[];
  userGroups: UserGroup[];
  agendaGroups: AgendaGroup[];
  invites: RegistrationInvite[];
  submissions: RegistrationSubmission[];
  inviteEmails: InviteEmailTemplate[];
  agendaLogs: AgendaLog[];
  agendaEmails: AgendaEmailTemplate[];
  plan: Plan;
  coinTransactions: CoinTransaction[];
  payments: Payment[];
  planHistory: PlanChange[];
};

export const STATUS_LABELS: Record<Status, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  ATTENDED: "Atendido",
  NO_SHOW: "Não compareceu",
  CANCELED: "Cancelado",
};

/** The `.hchip--<tone>` the design system paints each status with. */
export const STATUS_TONES: Record<Status, string> = {
  PENDING: "hchip--warning",
  CONFIRMED: "hchip--accent",
  ATTENDED: "hchip--success",
  NO_SHOW: "hchip--danger",
  CANCELED: "hchip--default",
};

/** A client-registration invite: one upload of e-mails, one form, one link per recipient. */
export type RegistrationInvite = {
  id: string;
  /** "Nome do convite". */
  name: string;
  /** One address per line of "Lista de emails", plus whatever the spreadsheet carried. */
  emails: string[];
  /** An InviteEmailTemplate id; empty means "Texto padrão do sistema". */
  templateId: string;
  /** Ids of INVITE_FIELDS the form asks for, and which of them are required. */
  fields: string[];
  requiredFields: string[];
  autoApprove: boolean;
  /** "O cliente cria uma senha de acesso". */
  askPassword: boolean;
  /** "Validade do link (dias)"; 0 means no expiry. */
  expiresInDays: number;
  status: InviteStatus;
  /** "dd/mm/aaaa hh:mm". */
  createdAt: string;
};

export type InviteStatus = "DRAFT" | "SENDING" | "SENT" | "ARCHIVED";

export const INVITE_STATUSES: { value: "" | InviteStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "SENDING", label: "Enviando" },
  { value: "SENT", label: "Enviado" },
  { value: "ARCHIVED", label: "Arquivado" },
];

/** The `.hchip--<tone>` each invite status is painted with. */
export const INVITE_STATUS_TONES: Record<InviteStatus, string> = {
  DRAFT: "hchip--default",
  SENDING: "hchip--warning",
  SENT: "hchip--success",
  ARCHIVED: "hchip--default",
};

/** "Campos pedidos no cadastro"; name and e-mail are always asked, so they are not listed. */
export const INVITE_FIELDS: { id: string; label: string }[] = [
  { id: "telefone", label: "Telefone" },
  { id: "cpf", label: "Documento de identificação" },
  { id: "data_nascimento", label: "Data de nascimento" },
  { id: "genero", label: "Gênero" },
  { id: "nacionalidade", label: "Nacionalidade" },
  { id: "profissao", label: "Profissão" },
  { id: "local_nascimento", label: "Local de nascimento" },
  { id: "doc_id", label: "Documento de identidade" },
  { id: "empresa", label: "Empresa / local de trabalho" },
  { id: "matricula", label: "Matrícula" },
  { id: "endereco", label: "Endereço" },
];

/** What someone filled in through an invite's link, waiting for a decision. */
export type RegistrationSubmission = {
  id: string;
  inviteId: string;
  name: string;
  email: string;
  /** Answers to the invite's optional fields, keyed by INVITE_FIELDS id. */
  answers: Record<string, string>;
  status: SubmissionStatus;
  /** "dd/mm/aaaa hh:mm". */
  receivedAt: string;
  /** "Motivo (opcional)" of a rejection. */
  reason?: string;
};

export type SubmissionStatus = "PENDING" | "AUTO_APPROVED" | "APPROVED" | "REJECTED";

export const SUBMISSION_STATUSES: { value: "" | SubmissionStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendente de aprovação" },
  { value: "AUTO_APPROVED", label: "Aprovado automaticamente" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
];

export const SUBMISSION_STATUS_TONES: Record<SubmissionStatus, string> = {
  PENDING: "hchip--warning",
  AUTO_APPROVED: "hchip--success",
  APPROVED: "hchip--success",
  REJECTED: "hchip--danger",
};

/** "Momento": which e-mail of the invite flow a text replaces. */
export const INVITE_EMAIL_KINDS: { value: string; label: string }[] = [
  { value: "INVITE", label: "Convite de cadastro" },
  { value: "PRE_REGISTRATION", label: "Pré-cadastro recebido" },
  { value: "APPROVED", label: "Cadastro aprovado" },
  { value: "BOOKING_RELEASED", label: "Agendamento liberado" },
];

/** The suggested subject and the body placeholder each moment starts from. */
export const INVITE_EMAIL_DEFAULTS: Record<string, { subject: string; body: string }> = {
  INVITE: { subject: "{{nome_empresa}} te convidou para se cadastrar", body: "Qualquer dúvida, fale com a nossa recepção pelo telefone (00) 0000-0000." },
  PRE_REGISTRATION: { subject: "{{nome_empresa}} - Recebemos seu cadastro", body: "Costumamos responder em até 2 dias úteis." },
  APPROVED: { subject: "{{nome_empresa}} - Cadastro aprovado", body: "Na primeira visita, traga um documento com foto." },
  BOOKING_RELEASED: { subject: "{{nome_empresa}} - Seu agendamento está liberado", body: "O atendimento é no 3º andar, sala 302." },
};

/** "Variáveis disponíveis": what each moment's text may interpolate. */
export const INVITE_EMAIL_VARS: Record<string, { name: string; title: string }[]> = {
  INVITE: [
    { name: "{{email_cliente}}", title: "E-mail de quem recebe" },
    { name: "{{link_cadastro}}", title: "Link único de cadastro (o texto padrão já o traz)" },
    { name: "{{nome_cliente}}", title: "Nome de quem recebe o e-mail" },
    { name: "{{nome_empresa}}", title: "Nome da sua empresa" },
    { name: "{{validade_dias}}", title: "Validade do link, em dias" },
  ],
  PRE_REGISTRATION: [
    { name: "{{email_cliente}}", title: "E-mail de quem recebe" },
    { name: "{{nome_cliente}}", title: "Nome de quem recebe o e-mail" },
    { name: "{{nome_empresa}}", title: "Nome da sua empresa" },
  ],
  APPROVED: [
    { name: "{{email_cliente}}", title: "E-mail de quem recebe" },
    { name: "{{link_login}}", title: "Link de acesso à plataforma" },
    { name: "{{nome_cliente}}", title: "Nome de quem recebe o e-mail" },
    { name: "{{nome_empresa}}", title: "Nome da sua empresa" },
  ],
  BOOKING_RELEASED: [
    { name: "{{email_cliente}}", title: "E-mail de quem recebe" },
    { name: "{{link_agendamento}}", title: "O mesmo que {{link_lista}} (nome antigo)" },
    { name: "{{link_lista}}", title: 'Link da lista de acesso — o mesmo do botão "Copiar link" na tela de listas' },
    { name: "{{nome_cliente}}", title: "Nome de quem recebe o e-mail" },
    { name: "{{nome_empresa}}", title: "Nome da sua empresa" },
    { name: "{{nome_lista}}", title: "Nome da lista de acesso que liberou o cliente" },
  ],
};

/** A reusable text for one moment of the invite flow. */
export type InviteEmailTemplate = {
  id: string;
  /** One of INVITE_EMAIL_KINDS. */
  kind: string;
  name: string;
  subject: string;
  /** "Mensagem extra": added to the system's message, never replacing it. */
  body: string;
  isDefault: boolean;
};

/** The catalogue "Alterar Plano" lists; prices are the ones the live page shows. */
export type PlanOffer = {
  /** The id the original puts in /users/confirmar-plano/<id>. */
  id: string;
  name: string;
  /** Reais per month on the monthly cycle, and what the annual cycle bills per month. */
  monthly: string;
  annualMonthly: string;
  /** Reais billed once a year, shown only while the annual cycle is picked. */
  annualTotal: number;
  appointments: number;
  users: number;
};

export const PLAN_OFFERS: PlanOffer[] = [
  { id: "3", name: "Plano Básico", monthly: "45", annualMonthly: "40,67", annualTotal: 488, appointments: 500, users: 3 },
  { id: "4", name: "Plano Intermediário", monthly: "90", annualMonthly: "81,33", annualTotal: 976, appointments: 1000, users: 3 },
  { id: "5", name: "Plano Avançado", monthly: "172", annualMonthly: "157,17", annualTotal: 1886, appointments: 2000, users: 3 },
  { id: "220", name: "Plano Empresa", monthly: "387", annualMonthly: "349,92", annualTotal: 4199, appointments: 5000, users: 3 },
];

/** One row of "Frequência de Pagamento"; the ids are the ones the original posts. */
export type PlanPricing = { value: string; label: string };

/** Keyed by PlanOffer id. */
export const PLAN_PRICINGS: Record<string, PlanPricing[]> = {
  "3": [
    { value: "1", label: "R$ 45,00 para pagamento Mensal" },
    { value: "6", label: "R$ 129,00 para pagamento Trimestral. Equivalente a R$ 43,00/mês" },
    { value: "7", label: "R$ 255,00 para pagamento Semestral. Equivalente a R$ 42,50/mês" },
    { value: "5", label: "R$ 488,00 para pagamento Anual. Equivalente a R$ 40,67/mês" },
  ],
  "4": [
    { value: "2", label: "R$ 90,00 para pagamento Mensal" },
    { value: "8", label: "R$ 261,00 para pagamento Trimestral. Equivalente a R$ 87,00/mês" },
    { value: "9", label: "R$ 510,00 para pagamento Semestral. Equivalente a R$ 85,00/mês" },
    { value: "10", label: "R$ 976,00 para pagamento Anual. Equivalente a R$ 81,33/mês" },
  ],
  "5": [
    { value: "3", label: "R$ 172,00 para pagamento Mensal" },
    { value: "11", label: "R$ 497,00 para pagamento Trimestral. Equivalente a R$ 165,67/mês" },
    { value: "12", label: "R$ 974,00 para pagamento Semestral. Equivalente a R$ 162,33/mês" },
    { value: "13", label: "R$ 1886,00 para pagamento Anual. Equivalente a R$ 157,17/mês" },
  ],
  "220": [
    { value: "18", label: "R$ 387,00 para pagamento Mensal" },
    { value: "19", label: "R$ 1118,00 para pagamento Trimestral. Equivalente a R$ 372,67/mês" },
    { value: "20", label: "R$ 2191,00 para pagamento Semestral. Equivalente a R$ 365,17/mês" },
    { value: "21", label: "R$ 4199,00 para pagamento Anual. Equivalente a R$ 349,92/mês" },
  ],
};

/** "Personalize seu Plano": what each extra unit costs on top of the plan. */
export const PLAN_EXTRAS: { name: string; label: string; price: string }[] = [
  { name: "limite_agendamentos", label: "Agendamentos Extras por mês", price: "R$ 0,09/agendamento" },
  { name: "limite_usuarios", label: "Usuários adicionais", price: "R$ 5,90/usuário" },
  { name: "limite_contas", label: "Contas adicionais", price: "R$ 15,00/conta" },
  { name: "limite_unidades", label: "Unidades de atendimento adicionais", price: "R$ 9,90/unidade" },
];

/** "Funcionalidades Extras", with the original's ids and its own "+ 0.00/mês" spelling. */
export const PLAN_FEATURES: { value: string; label: string }[] = [
  { value: "2", label: "Incorporar Tela de Agendamento em Seu Site: + 0.00/mês" },
  { value: "7", label: "Upload de arquivos no formulário de agendamento: + 9.00/mês" },
  { value: "8", label: "Envio de Pesquisa de Satisfação: + 10.00/mês" },
  { value: "10", label: "Upload de arquivos grandes no formulário de agendamento: + 18.00/mês" },
  { value: "5", label: "Enviar e-mails usando o seu domínio comercial: + 30.00/mês" },
];

export const BILLING_PERSON_TYPES: { value: string; label: string }[] = [
  { value: "1", label: "Pessoa Física" },
  { value: "2", label: "Pessoa Jurídica" },
];

/** A row of "Histórico de Atividades de Usuários": one action the team took on an appointment. */
export type TeamLog = {
  id: string;
  /** When the action happened, "dd/mm/aaaa hh:mm". */
  at: string;
  agendaId: string;
  /** The slot the action touched, "dd/mm/aaaa hh:mm". */
  slotAt: string;
  /** The appointment's short code, shown as a `<code>`. */
  code: string;
  /** The member's e-mail, which is how the original names the user. */
  user: string;
  action: string;
};

/** The chip tone each action is painted with; anything else falls back to the plain one. */
export const TEAM_LOG_TONES: Record<string, string> = {
  "Agendamento criado": "hchip--accent",
  "Agendamento cancelado": "hchip--danger",
};
