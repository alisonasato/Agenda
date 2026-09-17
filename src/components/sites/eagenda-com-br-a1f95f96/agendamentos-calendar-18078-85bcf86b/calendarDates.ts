export type CalendarView = "day" | "week" | "month";

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
export const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAYS_LONG = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",
];
export const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Keeps the day of month (clamped), so switching views lands on the same week. */
export const addMonths = (d: Date, n: number) => {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), lastDay));
};
/** Weeks start on Sunday, like the original. */
export const startOfWeek = (d: Date) => addDays(d, -d.getDay());
export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
export const isoDay = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Six-or-five week grid covering the anchor's month, padded to whole weeks. */
export function monthDays(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const start = startOfWeek(first);
  const end = addDays(startOfWeek(last), 6);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

export function shiftDate(date: Date, view: CalendarView, dir: 1 | -1): Date {
  if (view === "day") return addDays(date, dir);
  if (view === "week") return addDays(date, 7 * dir);
  return addMonths(date, dir);
}

/** Topbar title (desktop) and the compact one used below md. */
export function periodTitle(date: Date, view: CalendarView, short = false): string {
  if (view === "day") {
    return short
      ? `${WEEKDAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
      : `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (view === "month") return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  const [start, end] = [startOfWeek(date), addDays(startOfWeek(date), 6)];
  if (short) {
    const from = `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]}`;
    const to = `${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
    // The compact title never repeats the starting year ("27 dez – 2 jan 2027").
    return start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
      ? `${start.getDate()} – ${to}`
      : `${from} – ${to}`;
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} – ${end.getDate()} de ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  }
  const from = `${start.getDate()} ${MONTHS[start.getMonth()]}`;
  const to = `${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  return start.getFullYear() === end.getFullYear() ? `${from} – ${to}` : `${from} ${start.getFullYear()} – ${to}`;
}

export type CalendarEvent = { title: string; bg: string; color: string };

// Mock data: Brazilian national holidays, the only events the live page shows for an empty agenda.
const HOLIDAYS: Record<string, string> = {
  "1-1": "Confraternização Universal",
  "4-21": "Tiradentes",
  "5-1": "Dia do Trabalho",
  "9-7": "Independência do Brasil",
  "10-12": "Nossa Senhora Aparecida",
  "11-2": "Finados",
  "11-15": "Proclamação da República",
  "12-25": "Natal",
};

export function eventsOn(day: Date): CalendarEvent[] {
  const title = HOLIDAYS[`${day.getMonth() + 1}-${day.getDate()}`];
  return title ? [{ title, bg: "rgb(251, 240, 224)", color: "rgb(154, 89, 0)" }] : [];
}
