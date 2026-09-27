import { LIMIT_INTERVALS, LIMIT_KEYS, type BookingLimit, type Client, type Data } from "./types";

export const intervalLabel = (limit: BookingLimit) =>
  limit.interval === "NDAYS" ? `${limit.days} DIAS CORRIDOS` : (LIMIT_INTERVALS.find((i) => i.value === limit.interval)?.label ?? "—");

export const keyLabel = (limit: BookingLimit) => LIMIT_KEYS.find((k) => k.value === limit.key)?.label ?? "—";

/** What the limit groups clients by: the same value means "the same person" for the count. */
function identity(limit: BookingLimit, client: Client | undefined) {
  if (limit.key === "count" || !client) return "";
  const field = (name: string) => {
    if (name === "name" || name === "nome") return client.name;
    if (name === "phone") return client.phone;
    if (name === "email") return client.email;
    if (name === "personal_identification_number") return client.cpf ?? client.identificationNumber ?? "";
    // "user", "source_ip" and "custom" have nothing else to go on here: the client itself is the key.
    return client.id;
  };
  return limit.key
    .split("+")
    .map((name) => field(name).trim().toLowerCase())
    .join("|");
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The window `start` falls in, as a string two appointments share when they belong together. */
function bucket(limit: BookingLimit, start: string) {
  switch (limit.interval) {
    case "HORARIO":
      return start;
    case "DIA":
      return start.slice(0, 10);
    case "SEMANA": {
      const sunday = new Date(`${start}:00`);
      sunday.setDate(sunday.getDate() - sunday.getDay());
      return `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
    }
    case "MES":
      return start.slice(0, 7);
    default:
      return "";
  }
}

/** Inside a NDAYS limit, an appointment counts when it is within `days` of the new one. */
const near = (limit: BookingLimit, a: string, b: string) =>
  Math.abs(new Date(`${a.slice(0, 10)}T00:00:00`).getTime() - new Date(`${b.slice(0, 10)}T00:00:00`).getTime()) < limit.days * 86400000;

type Candidate = { clientId: string; agendaId: string; serviceId: string; start: string };

/** The first limit the appointment would break, or null when it fits. */
export function exceeded(data: Data, candidate: Candidate): BookingLimit | null {
  const client = data.clients.find((c) => c.id === candidate.clientId);
  for (const limit of data.limits) {
    if (!limit.interval || !limit.max) continue;
    if (limit.agendaIds.length && !limit.agendaIds.includes(candidate.agendaId)) continue;
    if (limit.serviceIds.length && !limit.serviceIds.includes(candidate.serviceId)) continue;
    const mine = identity(limit, client);
    const slot = bucket(limit, candidate.start);
    const count = data.appointments.filter((a) => {
      if (limit.type === "FALTAS" ? a.status !== "NO_SHOW" : a.status === "CANCELED") return false;
      if (limit.agendaIds.length && !limit.agendaIds.includes(a.agendaId)) return false;
      if (limit.serviceIds.length && !limit.serviceIds.includes(a.serviceId)) return false;
      if (
        identity(
          limit,
          data.clients.find((c) => c.id === a.clientId),
        ) !== mine
      )
        return false;
      return limit.interval === "NDAYS" ? near(limit, a.start, candidate.start) : bucket(limit, a.start) === slot;
    }).length;
    if (count >= limit.max) return limit;
  }
  return null;
}
