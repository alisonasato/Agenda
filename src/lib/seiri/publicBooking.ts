import { blockedBy, exceeded, samePhone } from "./limits";
import type { BookingLimit, Client, Data } from "./types";

/**
 * The client the list already has under the e-mail or phone a visitor typed, if any. The original's person lookup
 * (`create_person_htmx`) matches the same two and then uses the person it found instead of making another, so the
 * visitor's earlier appointments count toward the limits and a repeat booking does not pile up copies. A field the
 * visitor left empty matches nobody.
 */
export function knownClient(data: Data, details: Pick<Client, "email" | "phone">): Client | null {
  const email = details.email.trim().toLowerCase();
  return data.clients.find((c) => !c.inactive && ((email && c.email.trim().toLowerCase() === email) || samePhone(c.phone, details.phone))) ?? null;
}

/** "por dia", "por semana", "em 7 dias corridos": the limit's window as a sentence ends with it. */
function windowOf(limit: BookingLimit) {
  if (limit.interval === "NDAYS") return `em ${limit.days} dias corridos`;
  if (limit.interval === "HORARIO") return "por horário";
  if (limit.interval === "SEMANA") return "por semana";
  if (limit.interval === "MES") return "por mês";
  return "por dia";
}

/**
 * Why the public form must turn this visitor away from a slot, worded for them, or "" when they may book. The block
 * list comes first and does not say why: the reason is the team's. A limit says what it is, since the visitor can act
 * on it. `client` need not be on the list yet (a new visitor is not): a block list entry still matches their e-mail,
 * phone or document, and they have no earlier appointments to count.
 *
 * The original has these checks on its server, and nothing in the page's script tells what its messages say, so the
 * wording is the clone's.
 */
export function refusalFor(data: Data, client: Client, slot: { agendaId: string; serviceId: string; start: string }, orgName: string, now = new Date()) {
  const seen = data.clients.some((c) => c.id === client.id) ? data : { ...data, clients: [...data.clients, client] };
  if (blockedBy(seen, client.id, now)) return `Não foi possível concluir o agendamento com os dados informados. Entre em contato com ${orgName}.`;
  const limit = exceeded(seen, { clientId: client.id, ...slot });
  if (limit) return `Você já atingiu o limite de ${limit.max} ${limit.type === "FALTAS" ? "falta(s)" : "agendamento(s)"} ${windowOf(limit)}.`;
  return "";
}
