/**
 * What the public booking page keeps in its address, so that each step has a link of its own and the browser's
 * Back and Forward walk the steps. Read from the original's script (`_commitUrl` and `_restoreFromUrl`):
 *
 *   unidade  the chosen unit
 *   modo     "servico" or "data" while browsing by service or by date ("Por Agenda" is the default and not written)
 *   agenda   the agenda's identifier (its slug)
 *   servico  the chosen service
 *   data     the chosen day, AAAA-MM-DD
 *   hora     the chosen time, HH:MM, which is also the step with the form
 *
 * Any one of them skips the welcome screen. Other parameters of the address (an access key, say) are not the flow's
 * and stay as they are.
 */
export const FLOW_KEYS = ["unidade", "modo", "agenda", "servico", "data", "hora"] as const;
export type FlowKey = (typeof FLOW_KEYS)[number];
export type Flow = Record<FlowKey, string>;

/** A real calendar day written AAAA-MM-DD: 2026-02-30 is not one. */
function isDay(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

const isHour = (text: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(text);

/** The flow in an address's query string ("?agenda=x&data=2026-10-13"); what is not valid reads as not there. */
export function readFlow(search: string): Flow {
  const p = new URLSearchParams(search);
  const get = (key: FlowKey) => p.get(key) ?? "";
  const modo = get("modo");
  return {
    unidade: get("unidade"),
    modo: modo === "servico" || modo === "data" ? modo : "",
    agenda: get("agenda"),
    servico: get("servico"),
    data: isDay(get("data")) ? get("data") : "",
    hora: isHour(get("hora")) ? get("hora") : "",
  };
}

/** True when the address already names a step, which skips the welcome screen. */
export const startsFlow = (flow: Flow) => FLOW_KEYS.some((key) => flow[key]);

/**
 * The query string for `flow` on top of an address's `search`: its foreign parameters first, then the flow's own in
 * the original's order, those left empty dropped. "" when nothing is left (no "?" to write).
 */
export function flowQuery(search: string, flow: Partial<Flow>) {
  const query = new URLSearchParams(search);
  for (const key of FLOW_KEYS) query.delete(key);
  for (const key of FLOW_KEYS) if (flow[key]) query.set(key, flow[key]);
  return query.toString();
}
