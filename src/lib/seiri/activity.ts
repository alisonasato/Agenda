import { dayKey, keyFromToday } from "./select";
import type { Appointment, Data } from "./types";

/** "Os agendamentos dos últimos 7 dias", the original's own wording for what its drawer lists. */
export const ACTIVITY_DAYS = 7;

/**
 * What "Atividade recente" lists: the appointments whose day is one of the last seven, today
 * included, newest first. Seven days means today and the six before, the same count the period
 * picker uses for "Próximos 7 dias", read backwards.
 *
 * The empty state's wording is the original's, captured; which field the original filters on, and
 * what a filled row looks like, were not — the reference account has nothing in that window — so
 * this reads the appointment's own day, and the drawer's rows are this clone's.
 */
export function recentAppointments(data: Data, today = new Date(), days = ACTIVITY_DAYS): Appointment[] {
  const from = keyFromToday(-(days - 1), today);
  const to = keyFromToday(0, today);
  return data.appointments
    .filter((a) => {
      const key = dayKey(a.start);
      return key >= from && key <= to;
    })
    .sort((a, b) => b.start.localeCompare(a.start));
}
