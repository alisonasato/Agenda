import { DEFAULT_HOLIDAY_RULES, type Data, type Holiday } from "./types";

/** The national holidays the original lists under "Personalizar quais feriados bloquear". */
export const NATIONAL_HOLIDAYS: { date: string; name: string }[] = [
  { date: "2026-01-01", name: "Ano novo" },
  { date: "2026-02-17", name: "Carnaval" },
  { date: "2026-02-18", name: "Quarta-feira de cinzas (Início da Quaresma)" },
  { date: "2026-04-03", name: "Sexta-feira Santa" },
  { date: "2026-04-05", name: "Páscoa" },
  { date: "2026-04-21", name: "Tiradentes" },
  { date: "2026-05-01", name: "Dia Mundial do Trabalho" },
  { date: "2026-06-04", name: "Corpus Christi" },
  { date: "2026-09-07", name: "Independência do Brasil" },
  { date: "2026-10-12", name: "Nossa Senhora Aparecida" },
  { date: "2026-11-02", name: "Finados" },
  { date: "2026-11-15", name: "Proclamação da República" },
  { date: "2026-12-25", name: "Natal" },
  { date: "2027-01-01", name: "Ano novo" },
  { date: "2027-02-09", name: "Carnaval" },
  { date: "2027-02-10", name: "Quarta-feira de cinzas (Início da Quaresma)" },
  { date: "2027-03-26", name: "Sexta-feira Santa" },
  { date: "2027-03-28", name: "Páscoa" },
  { date: "2027-04-21", name: "Tiradentes" },
  { date: "2027-05-01", name: "Dia Mundial do Trabalho" },
  { date: "2027-05-27", name: "Corpus Christi" },
  { date: "2027-09-07", name: "Independência do Brasil" },
  { date: "2027-10-12", name: "Nossa Senhora Aparecida" },
  { date: "2027-11-02", name: "Finados" },
  { date: "2027-11-15", name: "Proclamação da República" },
  { date: "2027-12-25", name: "Natal" },
];

export const rulesOf = (data: Data, agendaId: string) => data.holidayRules[agendaId] ?? DEFAULT_HOLIDAY_RULES;

/** The days a custom holiday covers: one day, or every day from `date` to `endDate`. */
export const coversDay = (holiday: Holiday, key: string) => key >= holiday.date && key <= (holiday.endDate || holiday.date);

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * Why the agenda is closed on that day at that hour, or "" when it is not.
 * `from`/`to` are minutes into the day; a whole-day holiday ignores them.
 */
export function holidayOf(data: Data, agendaId: string, key: string, from: number, to: number) {
  const custom = data.holidays.find((h) => {
    if (h.agendaIds.length && !h.agendaIds.includes(agendaId)) return false;
    if (!coversDay(h, key)) return false;
    if (h.allDay || !h.startTime || !h.endTime) return true;
    return from < toMinutes(h.endTime) && to > toMinutes(h.startTime);
  });
  if (custom) return custom.name;

  const rules = rulesOf(data, agendaId);
  if (!rules.national || rules.skipped.includes(key)) return "";
  return NATIONAL_HOLIDAYS.find((h) => h.date === key)?.name ?? "";
}
