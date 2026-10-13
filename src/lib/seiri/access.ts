import { exceeded, samePhone } from "./limits";
import { windowOf } from "./publicBooking";
import { ACCESS_KEY_TYPES, type AccessList, type BookingLimit, type Client, type Data } from "./types";

/**
 * "Somente Agendamento Autorizado": an agenda that only the clients on an access list may book, from the public
 * page. The original's page script has no trace of this (it runs on its server, and the reference account has no
 * agenda set that way), so everything here is the clone's reading of what the lists record: the key type, who is let
 * in, the scope, "Expira em", "Agendar até", the limit per period, the help text and the denial message.
 */

type Slot = { agendaId: string; serviceId: string };

const digits = (text: string) => text.replace(/\D+/g, "");
const same = (a: string, b: string) => a.trim() !== "" && a.trim().toLowerCase() === b.trim().toLowerCase();

/** "dd/mm/aaaa" as a date at midnight, or null when empty or not a date. */
function parseBr(text: string) {
  const [d, m, y] = text.split("/").map(Number);
  return d && m && y ? new Date(y, m - 1, d) : null;
}

/** An older seed wrote "CPF" for the key type and "MONTH" for the period; both read as what the form offers now. */
const KEY_ALIASES: Record<string, string> = { CPF: "PIN" };
const INTERVAL_ALIASES: Record<string, string> = { DAY: "DIA", WEEK: "SEMANA", MONTH: "MES" };
export const keyTypeOf = (list: AccessList) => KEY_ALIASES[list.keyType] ?? list.keyType;
const intervalOf = (list: AccessList) => INTERVAL_ALIASES[list.interval] ?? list.interval;

/** What a client is known by, for each kind of key. A contract number and an invite code are the client's access key. */
function keyValue(type: string, client: Client) {
  if (type === "EMAIL") return client.email;
  if (type === "PHONE") return client.phone;
  if (type === "PIN") return client.cpf ?? "";
  if (type === "PASSPORT") return client.identificationNumber ?? "";
  return client.accessKey ?? "";
}

function matches(type: string, client: Client, typed: string) {
  const value = keyValue(type, client);
  if (type === "PHONE") return samePhone(value, typed);
  if (type === "PIN") return digits(value) !== "" && digits(value) === digits(typed);
  return same(value, typed);
}

const covers = (ids: string[], id: string) => !ids.length || ids.includes(id);

/** The lists in force for this agenda and service: on, not past "Expira em" (good through that day), and covering both. */
export function listsFor(data: Data, slot: Slot, today: Date): AccessList[] {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return data.accessLists.filter((l) => {
    const ends = parseBr(l.expiresAt);
    return l.active && covers(l.agendaIds, slot.agendaId) && covers(l.serviceIds, slot.serviceId) && !(ends && ends < day);
  });
}

/** The client a personal link names: `?cliente=<Cliente ID>`, which is the client's access key or, without one, the id. */
export const clientByLink = (data: Data, key: string): Client | null =>
  key ? (data.clients.find((c) => !c.inactive && (c.accessKey ?? c.id) === key) ?? null) : null;

/** What to ask a visitor who has no link: the first list in force names the key and the help text. */
export function prompt(data: Data, slot: Slot, today: Date) {
  const list = listsFor(data, slot, today)[0];
  return { label: ACCESS_KEY_TYPES.find((k) => k.value === (list ? keyTypeOf(list) : ""))?.label ?? "Chave de acesso", help: list?.helpText ?? "" };
}

/** What the visitor is told when the key does not open the agenda: the list's own message, or the clone's. */
export function denied(data: Data, slot: Slot, today: Date) {
  const own = listsFor(data, slot, today).find((l) => l.unauthorizedMessage.trim());
  return own?.unauthorizedMessage.trim() || "Acesso restrito: este agendamento é só para clientes autorizados.";
}

/** The client on a list in force whose key is the one typed, or null. */
export function identify(data: Data, slot: Slot, typed: string, today: Date): Client | null {
  for (const list of listsFor(data, slot, today)) {
    const hit = data.clients.find((c) => !c.inactive && list.clientIds.includes(c.id) && matches(keyTypeOf(list), c, typed));
    if (hit) return hit;
  }
  return null;
}

/** Whether some list in force lets this client in, whatever the day. */
export const isListed = (data: Data, client: Client, slot: Slot, today: Date) => listsFor(data, slot, today).some((l) => l.clientIds.includes(client.id));

/** A list's "Número máximo de agendamentos" per "Período", as a limit the limits module can count. */
function limitOf(list: AccessList): BookingLimit | null {
  const interval = intervalOf(list);
  if (!list.maxAppointments || !interval) return null;
  const rolling = interval === "15D" ? 15 : interval === "30D" ? 30 : interval === "NDAYS" ? list.days : 0;
  return {
    id: `access-${list.id}`,
    type: "AGENDAMENTOS",
    key: "user",
    agendaIds: list.agendaIds,
    serviceIds: list.serviceIds,
    // "Sem Prazo" has no window: every appointment the client has counts toward the total.
    interval: rolling ? "NDAYS" : (interval as BookingLimit["interval"]),
    days: rolling,
    max: list.maxAppointments,
  };
}

/**
 * Why a listed client may not take this slot, worded for them, or "" when they may: no list in force lets them in,
 * the day is past a list's "Agendar até", or they have reached its limit. A client on several lists may book
 * if any one of them allows it; the reason given is the first list's.
 */
export function accessRefusal(data: Data, client: Client, slot: Slot & { start: string }, today: Date) {
  const mine = listsFor(data, slot, today).filter((l) => l.clientIds.includes(client.id));
  if (!mine.length) return denied(data, slot, today);
  let why = "";
  for (const list of mine) {
    const last = parseBr(list.maxDate);
    if (last && new Date(`${slot.start.slice(0, 10)}T00:00:00`) > last) {
      why ||= `Esta lista só permite agendar até ${list.maxDate}.`;
      continue;
    }
    const limit = limitOf(list);
    if (limit && exceeded({ ...data, limits: [limit] }, { clientId: client.id, ...slot })) {
      why ||= `Você já atingiu o limite de ${list.maxAppointments} agendamento(s) ${windowOf(limit)} desta lista.`;
      continue;
    }
    return "";
  }
  return why;
}
