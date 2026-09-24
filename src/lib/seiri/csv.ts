/** CSV helpers for the export and import buttons; the original does this on its server. */

const escape = (value: string) => (/[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Semicolon-separated, with a BOM so Excel in pt-BR opens the accents right. */
export function toCsv(headers: string[], rows: (string | number)[][]) {
  const lines = [headers, ...rows].map((line) => line.map((cell) => escape(String(cell ?? ""))).join(";"));
  return `﻿${lines.join("\r\n")}`;
}

/** Hands the browser a file to save, named after the page and today's date. */
export function download(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Today as "2026-09-24", for file names. */
export const stamp = () => new Date().toISOString().slice(0, 10);

/** Reads a semicolon- or comma-separated file into rows of trimmed cells (quotes honoured). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const separator = (clean.split("\n")[0].match(/;/g)?.length ?? 0) >= (clean.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (quoted) {
      if (char === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') quoted = false;
      else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === separator) {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some(Boolean));
}
