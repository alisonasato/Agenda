import type { XlsxSheet } from "./xlsx";

/**
 * "Baixar modelo (.xlsx)" on Importar Clientes. Measured on the original's download (`/clientes/criar_xlsx`, read
 * on an account with no clients): sheet "Clientes" and one header row of ten columns, no example row, no widths and
 * no styling. The tenth, `login`, is not among the nine chips the modal lists; the modal's rules say to fill the
 * `username` field with the access e-mail to create the client's login, which clients here do not have.
 */
export const CLIENT_TEMPLATE_SHEET: XlsxSheet = {
  name: "Clientes",
  rows: [["cliente_id", "nome", "email", "login", "telefone", "cpf", "dt_nascimento", "genero", "nacionalidade", "profissao"]],
};

/** The original dates the file's name: lista_clientes_2026-10-12.xlsx. */
export const clientTemplateFile = (today = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `lista_clientes_${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}.xlsx`;
};
