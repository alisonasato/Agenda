// node src/lib/seiri/select.test.mjs — the formatting and filtering the lists share, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { parse, formatDate, formatTime, formatWhen, formatMoney, formatDuration, inPreset, expand, fold, dayKey, keyFromToday, withinDays } =
  await import("./select.ts");

// 2026-09-24 is a Thursday.
const THU = "2026-09-24T09:00";
/** Standing on that Thursday, so the presets are counted from a known day. */
const TODAY = new Date(2026, 8, 24, 10, 0);

// parse reads the local time the store writes, never UTC the way `new Date(iso)` would.
{
  const d = parse(THU);
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 8);
  assert.equal(d.getDate(), 24);
  assert.equal(d.getHours(), 9);
  assert.equal(d.getMinutes(), 0);
}

// The three plain formatters.
{
  assert.equal(formatDate(THU), "24/09/2026");
  assert.equal(formatDate("2026-01-05T00:00"), "05/01/2026", "day and month are padded");
  assert.equal(formatTime(THU), "09:00");
  assert.equal(formatTime("2026-09-24T14:35"), "14:35");
}

// "Qui, 24/09 · 09:00 – 10:00" — the weekday, the day, and the end worked out from the duration.
{
  assert.equal(formatWhen(THU, 60), "Qui, 24/09 · 09:00 – 10:00");
  assert.equal(formatWhen(THU, 30), "Qui, 24/09 · 09:00 – 09:30");
  assert.equal(formatWhen(THU, 45), "Qui, 24/09 · 09:00 – 09:45");
  assert.equal(formatWhen("2026-09-24T23:30", 60), "Qui, 24/09 · 23:30 – 00:30", "an end past midnight keeps the start's day");
  // Every weekday name, so a wrong offset in the table shows up.
  assert.deepEqual(
    ["2026-09-20", "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26"].map((d) => formatWhen(`${d}T08:00`, 30).slice(0, 3)),
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  );
}

// Money uses the Brazilian comma, and an absent price is a dash.
{
  assert.equal(formatMoney(120), "R$ 120,00");
  assert.equal(formatMoney(0), "R$ 0,00", "free is not the same as unpriced");
  assert.equal(formatMoney(99.5), "R$ 99,50");
  assert.equal(formatMoney(null), "—");
}

// Durations read the way the wizard words them.
{
  assert.equal(formatDuration(30), "30 min");
  assert.equal(formatDuration(45), "45 min");
  assert.equal(formatDuration(60), "1 hora", "singular at exactly an hour");
  assert.equal(formatDuration(120), "2 horas");
  assert.equal(formatDuration(90), "1h30", "past an hour but not a whole one");
  assert.equal(formatDuration(150), "2h30");
}

// The period presets, counted from `today`.
{
  const is = (iso, preset) => inPreset(iso, preset, TODAY);

  assert.ok(is("2020-01-01T00:00", "Todos os períodos"), "the catch-all takes anything");

  assert.ok(is("2026-09-24T23:59", "Hoje"), "any time of today counts");
  assert.ok(!is("2026-09-25T00:00", "Hoje"));
  assert.ok(is("2026-09-25T08:00", "Amanhã"));
  assert.ok(!is("2026-09-24T08:00", "Amanhã"));

  // "Próximos 7 dias" is today plus six, so the seventh day is already out.
  assert.ok(is("2026-09-24T08:00", "Próximos 7 dias"), "today is inside");
  assert.ok(is("2026-09-30T08:00", "Próximos 7 dias"));
  assert.ok(!is("2026-10-01T08:00", "Próximos 7 dias"));
  assert.ok(!is("2026-09-23T08:00", "Próximos 7 dias"), "yesterday is behind the window");

  assert.ok(is("2026-10-23T08:00", "Próximos 30 dias"));
  assert.ok(!is("2026-10-24T08:00", "Próximos 30 dias"));

  // "Este mês" is the calendar month, so it reaches back before today.
  assert.ok(is("2026-09-01T08:00", "Este mês"), "a day already past, but the same month");
  assert.ok(is("2026-09-30T08:00", "Este mês"));
  assert.ok(!is("2026-10-01T08:00", "Este mês"));
  assert.ok(!is("2025-09-24T08:00", "Este mês"), "the same month of another year is out");
}

// expand turns the ids on an appointment into the names a row prints.
{
  const data = {
    clients: [{ id: "c1", name: "Ana Lima", email: "ana@exemplo.com.br", phone: "11999990001" }],
    agendas: [{ id: "a1", name: "Agenda Principal", active: true }],
    services: [{ id: "s1", name: "Consulta", price: 120, duration: 30, agendaIds: ["a1"], tagIds: [], order: 1, members: [] }],
    tags: [
      { id: "t1", name: "Retorno", color: "#48CFAE" },
      { id: "t2", name: "Convênio", color: "#D42325" },
    ],
  };
  const appointment = { id: "ap1", clientId: "c1", agendaId: "a1", serviceId: "s1", tagIds: ["t1", "t2"] };

  const row = expand(data, appointment);
  assert.equal(row.clientName, "Ana Lima");
  assert.equal(row.agendaName, "Agenda Principal");
  assert.equal(row.serviceName, "Consulta");
  assert.deepEqual(row.tags, ["Retorno", "Convênio"]);
  assert.equal(row.client.id, "c1", "the record itself comes back too");
  assert.equal(row.service.price, 120);

  // A deleted client, agenda or service leaves the row readable instead of blank.
  const orphan = expand(data, { id: "ap2", clientId: "gone", agendaId: "gone", serviceId: "gone", tagIds: ["gone"] });
  assert.equal(orphan.clientName, "—");
  assert.equal(orphan.agendaName, "—");
  assert.equal(orphan.serviceName, "—");
  assert.equal(orphan.client, undefined);
  assert.deepEqual(orphan.tags, [], "a tag that no longer exists is dropped, not left undefined");
}

// fold: the sidebar search ignores accents and case.
{
  assert.equal(fold("Configurações"), "configuracoes");
  assert.equal(fold("AGENDA"), "agenda");
  assert.equal(fold("João Ôñçë"), "joao once");
  assert.ok(fold("Relatórios").includes(fold("relatorios")), "the accented title matches an unaccented search");
  assert.equal(fold(""), "");
}

// Day keys.
{
  assert.equal(dayKey("2026-09-24T09:00"), "2026-09-24");
  assert.equal(keyFromToday(0, TODAY), "2026-09-24");
  assert.equal(keyFromToday(1, TODAY), "2026-09-25");
  assert.equal(keyFromToday(-1, TODAY), "2026-09-23");
  assert.equal(keyFromToday(7, TODAY), "2026-10-01", "the offset rolls the month over");
  assert.equal(keyFromToday(99, new Date(2026, 11, 25)), "2027-04-03", "and the year");
}

// withinDays: today included, the last day excluded.
{
  assert.ok(withinDays("2026-09-24T08:00", 7, TODAY), "today is inside");
  assert.ok(withinDays("2026-09-30T23:59", 7, TODAY));
  assert.ok(!withinDays("2026-10-01T00:00", 7, TODAY), "the seventh day out is already past the window");
  assert.ok(!withinDays("2026-09-23T23:59", 7, TODAY), "yesterday is behind it");
  assert.ok(withinDays("2026-09-24T08:00", 1, TODAY), "one day is today alone");
  assert.ok(!withinDays("2026-09-25T08:00", 1, TODAY));
}

console.log("select ok");
