/** Shapes of the data the Seiri prototype keeps in the browser. */

export type Status = "PENDING" | "CONFIRMED" | "ATTENDED" | "NO_SHOW" | "CANCELED";

export type Agenda = { id: string; name: string; color: string; active: boolean };

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
