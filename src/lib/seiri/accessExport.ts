import { ACCESS_INTERVALS } from "./types";
import type { AccessList, Client, Data } from "./types";
import { dayKey, keyFromToday } from "./select";
import type { XlsxCell } from "./xlsx";

/** What the original's individual-access "Exportar" (`?export=xlsx`) names its file, and its one sheet. */
export const ACCESS_EXPORT_FILE = "individual_client_access.xlsx";
export const ACCESS_EXPORT_SHEET = "Sheet1";

/** The thirteen columns the original writes, in its order, accents and all. */
export const ACCESS_EXPORT_HEADER = [
  "Cliente ID",
  "Nome",
  "Email",
  "Telefone",
  "CNPJ",
  "Comentários",
  "Total de Agendamentos no Período Atual",
  "Limite de Agendamentos",
  "Período",
  "Data limite de Agendamento",
  "Link expira em",
  "Status",
  "Link de Agendamento",
] as const;

/** "Dias Corridos" counts the list's own days; "Sem Prazo" has no period to name. */
export function intervalText(list: AccessList) {
  if (list.interval === "UNDEF" || !list.interval) return "";
  if (list.interval === "NDAYS") return `${list.days} Dias Corridos`;
  return ACCESS_INTERVALS.find((i) => i.value === list.interval)?.label ?? "";
}

/**
 * How many appointments the client has that count against the list right now, by the list's own
 * period: today, this week (Sunday to Saturday, as the booking limits count it), this month, or
 * the last 15, 30 or N days ending today. Cancelled ones do not count, and a list with no period
 * counts them all.
 *
 * The original's rule for this column was not seen — its one row had zero — so this is the clone's
 * reading of the column's own name.
 */
export function periodCount(data: Data, clientId: string, list: AccessList, today = new Date()) {
  const own = data.appointments.filter((a) => a.clientId === clientId && a.status !== "CANCELED");
  const days = list.interval === "15D" ? 15 : list.interval === "30D" ? 30 : list.interval === "NDAYS" ? Math.max(1, list.days) : 0;
  const todayKey = keyFromToday(0, today);

  return own.filter((a) => {
    const key = dayKey(a.start);
    switch (list.interval) {
      case "DIA":
        return key === todayKey;
      case "SEMANA": {
        const from = keyFromToday(-today.getDay(), today);
        const to = keyFromToday(6 - today.getDay(), today);
        return key >= from && key <= to;
      }
      case "MES":
        return key.slice(0, 7) === todayKey.slice(0, 7);
      case "15D":
      case "30D":
      case "NDAYS":
        return key >= keyFromToday(-(days - 1), today) && key <= todayKey;
      default:
        return true;
    }
  }).length;
}

/**
 * One row per client some access list lets in, as the table lists them. A client on several lists is
 * described by the first one, the way a single row has to be. `link` is the client's booking link,
 * which the caller makes absolute: a spreadsheet is opened far from this page.
 *
 * Two quirks are the original's, kept because they show: the total is written as text (its one row
 * had the string "0") and the limit as a number.
 */
export function accessExportRows(data: Data, link: (client: Client) => string, today = new Date()): XlsxCell[][] {
  const rows: XlsxCell[][] = [[...ACCESS_EXPORT_HEADER]];
  for (const client of data.clients) {
    const lists = data.accessLists.filter((l) => l.clientIds.includes(client.id));
    if (!lists.length) continue;
    const list = lists[0];
    rows.push([
      client.accessKey ?? client.id,
      client.name,
      client.email,
      client.phone,
      client.companyCnpj ?? "",
      // The clone's client record has no free-text comments, so the column goes out empty.
      "",
      String(periodCount(data, client.id, list, today)),
      list.maxAppointments,
      intervalText(list),
      list.maxDate,
      list.expiresAt,
      client.inactive ? "Inativo" : "Ativo",
      link(client),
    ]);
  }
  return rows;
}
