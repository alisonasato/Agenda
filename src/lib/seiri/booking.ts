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

/** One day of an agenda's calendar, with the availability dot the original paints under it. */
function dayCell(data: Data, agendaId: string, date: Date, now: Date): DayCell {
  const rules = rulesOf(data, agendaId);
  const last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + rules.maxAhead);
  const key = dateStr(date);
  const slots = slotsOf(data, agendaId, date);
  const times = timesOf(data, agendaId, date, now);
  // Past, beyond the agenda's horizon, or a day the agenda simply does not work: no dot at all.
  const isPast = key < dateStr(now) || date > last;
  const status = !slots.length ? "" : slots.every((s) => s.blocked) ? "holiday" : times.length ? "" : "full";
  return { day: date.getDate(), dateStr: key, date, isToday: key === dateStr(now), isPast, hasAvailability: !isPast && times.length > 0, status };
}

/** Every cell of the month grid, with the availability dot the original paints under each day. */
export function monthCells(data: Data, agendaId: string, month: Date, now = new Date()): (DayCell | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (DayCell | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= days; day++) cells.push(dayCell(data, agendaId, new Date(month.getFullYear(), month.getMonth(), day), now));
  return cells;
}

/**
 * The agenda's own calendar in the original is not a month but a window of six weeks that starts on a day of the
 * visitor's choosing (the first free one, to begin with): that day sits in its weekday's column, the cells before it
 * in the first row are blank, and the grid always has 42 cells, so the page's height does not jump as it moves.
 */
export const WINDOW_CELLS = 42;

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** The last day on show: the window holds 42 cells counting the blanks, so 42 minus the start's weekday days. */
export const windowEnd = (start: Date) => addDays(start, WINDOW_CELLS - 1 - start.getDay());

/** The 42 cells of the window from `start`: blanks up to its weekday, then one cell per day. */
export function windowCells(data: Data, agendaId: string, start: Date, now = new Date()): (DayCell | null)[] {
  const cells: (DayCell | null)[] = Array.from({ length: start.getDay() }, () => null);
  for (let i = 0; cells.length < WINDOW_CELLS; i++) cells.push(dayCell(data, agendaId, addDays(start, i), now));
  return cells;
}

/** "Next" starts the day after the last one on show (a Sunday, so a full 42 days). */
export const nextWindowStart = (start: Date) => addDays(windowEnd(start), 1);

/** "Previous" goes back 42 days but never before the floor, the first free day: nothing to see in the past. */
export function prevWindowStart(start: Date, floor: Date) {
  const back = addDays(start, -WINDOW_CELLS);
  return back < floor ? floor : back;
}

/** Opens the window on `day`, never before the floor. */
export const anchorWindow = (day: Date, floor: Date) => (startOfDay(day) < floor ? floor : startOfDay(day));

const MONTH_ABBREVIATIONS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** The window is 36 to 42 days long, so it always crosses a month end and its title is a range: "Out – Nov 2026", "Dez 2026 – Jan 2027". */
export function windowLabel(start: Date) {
  const end = windowEnd(start);
  const [sy, ey] = [start.getFullYear(), end.getFullYear()];
  if (sy === ey) return `${MONTH_ABBREVIATIONS[start.getMonth()]} – ${MONTH_ABBREVIATIONS[end.getMonth()]} ${sy}`;
  return `${MONTH_ABBREVIATIONS[start.getMonth()]} ${sy} – ${MONTH_ABBREVIATIONS[end.getMonth()]} ${ey}`;
}

/** The first day with a free time, today on, as far ahead as the agenda takes bookings; null when there is none. */
export function firstFreeDay(data: Data, agendaId: string, now = new Date()): Date | null {
  const horizon = rulesOf(data, agendaId).maxAhead;
  for (let i = 0; i <= horizon; i++) {
    const day = addDays(now, i);
    if (timesOf(data, agendaId, day, now).length > 0) return day;
  }
  return null;
}

/** A day of "Por Data": the agendas that can take someone that day, whichever of them it is. */
export type DateFirstCell = DayCell & { agendaIds: string[] };

/**
 * The month grid of "Por Data", where the visitor picks the day first and the agenda after. A day has a dot when any
 * of the agendas can take someone; when none can it is "full" if some agenda is out of vacancies, else "holiday" if
 * some is closed, else plain. It is past when every agenda counts it past (a day beyond one agenda's horizon can still
 * be open on another). This is the original's bulk-days endpoint, computed here from the same slots as each agenda's own
 * calendar.
 */
export function dateFirstCells(data: Data, agendas: Agenda[], month: Date, now = new Date()): (DateFirstCell | null)[] {
  const per = agendas.map((a) => ({ id: a.id, cells: monthCells(data, a.id, month, now) }));
  const lead = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells: (DateFirstCell | null)[] = Array.from({ length: lead }, () => null);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let i = 0; i < days; i++) {
    const own = per.map((p) => ({ id: p.id, cell: p.cells[lead + i] as DayCell }));
    const free = own.filter((o) => o.cell.hasAvailability).map((o) => o.id);
    const day = new Date(month.getFullYear(), month.getMonth(), i + 1);
    const key = dateStr(day);
    const status = free.length ? "" : own.some((o) => o.cell.status === "full") ? "full" : own.some((o) => o.cell.status === "holiday") ? "holiday" : "";
    cells.push({
      day: i + 1,
      dateStr: key,
      date: day,
      isToday: key === dateStr(now),
      isPast: own.every((o) => o.cell.isPast),
      hasAvailability: free.length > 0,
      status,
      agendaIds: free,
    });
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
