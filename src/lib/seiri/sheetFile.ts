import { parseCsv } from "./csv";
import { fromXlsx } from "./xlsxRead";

/** The file pickers also list .xls, the old binary format, which nothing here reads. */
export class UnsupportedSheet extends Error {}

/** The rows of an uploaded spreadsheet, by what its name says it is. */
export async function sheetRows(name: string, bytes: Uint8Array): Promise<string[][]> {
  const ext = name.toLowerCase().match(/\.(\w+)$/)?.[1];
  if (ext === "csv") return parseCsv(new TextDecoder().decode(bytes));
  if (ext === "xlsx") return fromXlsx(bytes);
  throw new UnsupportedSheet(ext === "xls" ? "xls" : (ext ?? ""));
}

/** What to tell the person when a spreadsheet could not be read. */
export const sheetProblem = (e: unknown) =>
  e instanceof UnsupportedSheet
    ? e.message === "xls"
      ? "Arquivos .xls não são lidos aqui. Salve a planilha como .xlsx ou .csv."
      : "Use uma planilha .csv ou .xlsx."
    : "Não foi possível ler a planilha.";

/**
 * A date cell in an .xlsx is a day count, not text: 36526 is 01/01/2000. Digits alone, five of them, are read as
 * one and written "dd/mm/aaaa" (1927 to 2173); anything else is left as typed, since a CSV already has the text.
 */
export function excelDate(text: string) {
  if (!/^\d{5}$/.test(text)) return text;
  const d = new Date(Date.UTC(1899, 11, 30) + Number(text) * 86400000);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}
