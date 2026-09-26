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

export type Data = {
  agendas: Agenda[];
  services: Service[];
  tags: Tag[];
  clients: Client[];
  appointments: Appointment[];
  waiting: WaitingEntry[];
  hours: Hours;
  blocks: Block[];
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
