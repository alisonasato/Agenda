import { DEFAULT_OPTIONS, DEFAULT_RULES } from "./types";
import type { Agenda, AgendaOptions, Data, Service } from "./types";
import { slotsOf } from "./slots";

/** A day the public calendar can offer, and why it may not take anyone. */
export type DayCell = {
  day: number;
  /** "2026-10-05". */
  dateStr: string;
  date: Date;
  isToday: boolean;
  isPast: boolean;
  hasAvailability: boolean;
  /** "" when the day is open, "full" when every slot is taken, "holiday" when the agenda is closed. */
  status: "" | "full" | "holiday";
};

export type TimeOption = { id: string; label: string; start: string; max: number; taken: number };

const pad = (n: number) => String(n).padStart(2, "0");
export const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const optionsOf = (data: Data, agendaId: string): AgendaOptions => data.agendaOptions[agendaId] ?? DEFAULT_OPTIONS;
export const rulesOf = (data: Data, agendaId: string) => data.agendaRules[agendaId] ?? DEFAULT_RULES;

/** The agendas a visitor may book: active, not closed to the outside. */
export const publicAgendas = (data: Data): Agenda[] => data.agendas.filter((a) => a.active && !optionsOf(data, a.id).blockExternalBooking);

export const servicesOf = (data: Data, agendaId: string): Service[] =>
  data.services.filter((s) => s.agendaIds.includes(agendaId)).sort((a, b) => a.order - b.order);

/**
 * The times an agenda still offers on a day, honouring the agenda's own minimum notice and the
 * places each slot has left. A service makes the appointment as long as the service says.
 */
export function timesOf(data: Data, agendaId: string, day: Date, now = new Date()): TimeOption[] {
  const rules = rulesOf(data, agendaId);
  const earliest = new Date(now.getTime() + rules.minNotice * 3600_000);
  return slotsOf(data, agendaId, day)
    .filter((slot) => !slot.blocked && slot.appointments.length < slot.max && new Date(`${slot.start}:00`) >= earliest)
    .map((slot) => ({ id: slot.start, label: slot.start.slice(11, 16), start: slot.start, max: slot.max, taken: slot.appointments.length }));
}

/** Every cell of the month grid, with the availability dot the original paints under each day. */
export function monthCells(data: Data, agendaId: string, month: Date, now = new Date()): (DayCell | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const rules = rulesOf(data, agendaId);
  const last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + rules.maxAhead);
  const todayStr = dateStr(now);

  const cells: (DayCell | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= days; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const key = dateStr(date);
    const slots = slotsOf(data, agendaId, date);
    const times = timesOf(data, agendaId, date, now);
    // Past, beyond the agenda's horizon, or a day the agenda simply does not work: no dot at all.
    const isPast = key < todayStr || date > last;
    const status = !slots.length ? "" : slots.every((s) => s.blocked) ? "holiday" : times.length ? "" : "full";
    cells.push({ day, dateStr: key, date, isToday: key === todayStr, isPast, hasAvailability: !isPast && times.length > 0, status });
  }
  return cells;
}

/** The fields "Dados solicitados no agendamento" turns on, in the order the original asks them. */
export const formFields = (options: AgendaOptions) =>
  [
    { name: "name", label: "Nome", type: "text", on: true, required: true },
    { name: "email", label: "E-mail", type: "email", on: options.requestEmail, required: options.emailRequired },
    { name: "phone", label: "Telefone", type: "tel", on: options.requestPhone, required: options.phoneRequired },
    { name: "cpf", label: "CPF", type: "text", on: options.requestCpf, required: false },
    { name: "identificationNumber", label: "Documento", type: "text", on: options.requestDocument, required: false },
    { name: "birthday", label: "Data de Nascimento", type: "text", on: options.requestBirthday, required: false },
    { name: "gender", label: "Sexo", type: "text", on: options.requestGender, required: false },
    { name: "nationality", label: "Nacionalidade", type: "text", on: options.requestNationality, required: false },
    { name: "placeOfBirth", label: "Naturalidade", type: "text", on: options.requestPlaceOfBirth, required: false },
    { name: "profession", label: "Profissão", type: "text", on: options.requestProfession, required: false },
    { name: "address", label: "Endereço", type: "text", on: options.requestAddress, required: false },
    { name: "comment", label: "Observações", type: "textarea", on: options.extraTextField, required: false },
  ].filter((f) => f.on);
