import type { XlsxSheet } from "./xlsx";

/**
 * "Modelo da planilha" on Convites de Cadastro: the sheet someone fills with the clients to invite and
 * uploads back. Measured on the original's download — sheet "Clientes", email and nome in the first two
 * columns, one example row, widths 34 and 28, no styling on the header.
 */
export const INVITE_TEMPLATE_SHEET: XlsxSheet = {
  name: "Clientes",
  widths: [34, 28],
  rows: [
    ["email", "nome"],
    ["cliente@exemplo.com", "Nome do Cliente"],
  ],
};

/** The original dates the file's name: modelo_convite_clientes_2026-10-10.xlsx. */
export const inviteTemplateFile = (today = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `modelo_convite_clientes_${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}.xlsx`;
};
