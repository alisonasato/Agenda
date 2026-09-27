/** Turns an agenda's week into the "Seg–Sab 07:00–18:00" rows the card lists. */

const SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
/** The original reads the week from Monday and leaves Sunday last. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function scheduleRows(week?: { start: string; end: string }[][]) {
  if (!week) return [];
  const rows: { days: string; hours: string }[] = [];
  let run: number[] = [];
  let hours = "";

  const flush = () => {
    if (!run.length) return;
    const label = run.length === 1 ? SHORT[run[0]] : `${SHORT[run[0]]}–${SHORT[run[run.length - 1]]}`;
    rows.push({ days: label, hours });
    run = [];
  };

  ORDER.forEach((weekday) => {
    const day = week[weekday] ?? [];
    const text = day.map((i) => `${i.start}–${i.end}`).join(", ");
    if (!text) return flush();
    // Days that share the same hours collapse into one row, as the original shows them.
    if (text !== hours) {
      flush();
      hours = text;
    }
    run.push(weekday);
  });
  flush();
  return rows;
}
