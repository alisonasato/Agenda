import type { Client } from "./types";
import type { XlsxCell, XlsxSheet } from "./xlsx";

/**
 * The client spreadsheet of Clientes → Listar: the "Baixar modelo (.xlsx)" of Importar Clientes and, here, the
 * "Exportar" button. Measured on the original's `/clientes/criar_xlsx`, which the modal links as its template (read
 * on an account with no clients): sheet "Clientes" and one header row of ten columns, no example row, no widths
 * and no styling. The tenth, `login`, is not among the nine chips the modal lists; its rules say to fill the
 * `username` field with the access e-mail to create the client's login, which clients here do not have.
 *
 * The template's file is named like a list ("lista_clientes_...") and the page's own "Exportar" goes to
 * `?export=xlsx` on the list, so the clone reads both as the same sheet: the template is the export with no rows.
 * That was not checked, since the reference account has no clients to export.
 */
export const CLIENT_SHEET_HEADER = ["cliente_id", "nome", "email", "login", "telefone", "cpf", "dt_nascimento", "genero", "nacionalidade", "profissao"];

export const CLIENT_TEMPLATE_SHEET: XlsxSheet = { name: "Clientes", rows: [CLIENT_SHEET_HEADER] };

/** The original dates the file's name: lista_clientes_2026-10-12.xlsx. */
export const clientSheetFile = (today = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `lista_clientes_${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}.xlsx`;
};

/**
 * The header and a row per client, in the same ten columns, so that what is exported can be imported back. Text
 * throughout (an Excel would turn a CPF into a number and eat its zeros), the birth date as "dd/mm/aaaa", and
 * `login` empty: a client here has none.
 */
export function clientSheetRows(clients: Client[]): XlsxCell[][] {
  return [
    CLIENT_SHEET_HEADER,
    ...clients.map((c) => [
      c.accessKey ?? c.id,
      c.name,
      c.email,
      "",
      c.phone,
      c.cpf ?? "",
      c.birthday ?? "",
      c.gender ?? "",
      c.nationality ?? "",
      c.profession ?? "",
    ]),
  ];
}
