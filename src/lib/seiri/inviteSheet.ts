const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The invite's recipients in a sheet: the first cell of each row that looks like an e-mail. The template puts
 * them under "email" with the name beside it, but looking for the "@" also reads a sheet whose columns were
 * moved or whose header is missing, and passes over the header row, which has none. Repeats are dropped.
 * The name column is not kept: an invite here records addresses only.
 */
export function emailsFromRows(rows: string[][]): string[] {
  const seen = new Set<string>();
  const found: string[] = [];
  for (const row of rows) {
    const email = row.map((c) => c.trim()).find((c) => EMAIL.test(c));
    if (email && !seen.has(email.toLowerCase())) {
      seen.add(email.toLowerCase());
      found.push(email);
    }
  }
  return found;
}

/** The invite's list of e-mails as typed: one per line, but pasted commas and semicolons split too. */
export const splitEmails = (text: string) =>
  text
    .split(/[\n,;]/)
    .map((e) => e.trim())
    .filter(Boolean);

/** The list with the sheet's e-mails added after it, none twice; says how many were new. */
export function addEmails(text: string, found: string[]) {
  const have = new Set(splitEmails(text).map((e) => e.toLowerCase()));
  const fresh = found.filter((e) => !have.has(e.toLowerCase()));
  return { text: [...splitEmails(text), ...fresh].join("\n"), added: fresh.length, repeated: found.length - fresh.length };
}
