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
  integrations: Integrations;
  manualHours: ManualHours[];
  surveys: Survey[];
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
