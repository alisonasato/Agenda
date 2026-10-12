import type { Data } from "./types";

/**
 * "Excluir agenda": the agenda and what belongs to it go, and nothing left may still point at it.
 *
 * - Its own records go: appointments, waiting list, recurrences, hours, rules, options, holiday rules,
 *   slot overrides, history and e-mail templates. The team's activity log stays, since it shows "—" for an
 *   agenda that no longer exists.
 * - Lists that name agendas lose it. Where an empty list means "todas as agendas" (limits, holidays,
 *   notification and status rules, access lists), a rule that was only about this agenda goes too: taking it
 *   out of the list would have turned it into a rule about every agenda. Blocks and manual hours go the same way.
 * - A service, member, survey or group keeps existing with a shorter list. A member left with none reaches
 *   every agenda, as an empty list always meant.
 */
export function removeAgenda(data: Data, id: string): Data {
  const named = (list: string[]) => list.includes(id);
  const without = (list: string[]) => list.filter((x) => x !== id);
  const keep = <T extends { agendaId: string }>(rows: T[]) => rows.filter((r) => r.agendaId !== id);
  /** The agenda leaves each list; a row it emptied is about nothing now, so it leaves too. */
  const dropEmptied = <T extends { agendaIds: string[] }>(rows: T[]) =>
    rows.flatMap((r) => (!named(r.agendaIds) ? [r] : without(r.agendaIds).length ? [{ ...r, agendaIds: without(r.agendaIds) }] : []));
  const shorten = <T extends { agendaIds: string[] }>(rows: T[]) => rows.map((r) => (named(r.agendaIds) ? { ...r, agendaIds: without(r.agendaIds) } : r));
  const dropKey = <T>(rec: Record<string, T>) => Object.fromEntries(Object.entries(rec).filter(([k]) => k !== id));

  return {
    ...data,
    agendas: data.agendas.filter((a) => a.id !== id),
    appointments: keep(data.appointments),
    waiting: keep(data.waiting),
    recurrences: keep(data.recurrences),
    agendaLogs: keep(data.agendaLogs),
    agendaEmails: keep(data.agendaEmails),
    hours: dropKey(data.hours),
    agendaRules: dropKey(data.agendaRules),
    agendaOptions: dropKey(data.agendaOptions),
    holidayRules: dropKey(data.holidayRules),
    slotInfo: Object.fromEntries(Object.entries(data.slotInfo).filter(([key]) => !key.startsWith(`${id}|`))),
    limits: dropEmptied(data.limits),
    holidays: dropEmptied(data.holidays),
    notificationRules: dropEmptied(data.notificationRules),
    statusRules: dropEmptied(data.statusRules),
    accessLists: dropEmptied(data.accessLists),
    blocks: dropEmptied(data.blocks),
    manualHours: dropEmptied(data.manualHours),
    services: shorten(data.services),
    members: shorten(data.members),
    surveys: shorten(data.surveys),
    agendaGroups: shorten(data.agendaGroups),
  };
}
