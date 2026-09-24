/** Shapes of the data the Seiri prototype keeps in the browser. */

export type Status = "PENDING" | "CONFIRMED" | "ATTENDED" | "NO_SHOW" | "CANCELED";

export type Agenda = { id: string; name: string; color: string; active: boolean };

export type Service = { id: string; name: string; price: number | null; duration: number; agendaIds: string[]; tagIds: string[]; order: number; color: string };

export type Tag = { id: string; name: string };

export type Client = { id: string; name: string; email: string; phone: string; cpf?: string };

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

export type Data = {
  agendas: Agenda[];
  services: Service[];
  tags: Tag[];
  clients: Client[];
  appointments: Appointment[];
  waiting: WaitingEntry[];
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
