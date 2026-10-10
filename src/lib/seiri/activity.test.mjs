// node src/lib/seiri/activity.test.mjs — what the "Atividade recente" drawer lists, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { recentAppointments, ACTIVITY_DAYS } = await import("./activity.ts");

const TODAY = new Date(2026, 9, 9, 15, 0); // 09/10/2026
const at = (key, time = "09:00") => `${key}T${time}`;
const appt = (id, start, over = {}) => ({
  id,
  code: id,
  clientId: "c1",
  agendaId: "a1",
  serviceId: "s1",
  start,
  duration: 30,
  status: "CONFIRMED",
  owner: "",
  tagIds: [],
  comment: "",
  ...over,
});
const data = (...appointments) => ({ appointments });

assert.equal(ACTIVITY_DAYS, 7, "o original diz 'últimos 7 dias'");

// Seven days is today and the six before it.
{
  const rows = recentAppointments(
    data(
      appt("antes", at("2026-10-02", "23:59")), // seven days back: out
      appt("seis", at("2026-10-03", "00:00")), // six days back: the first day in
      appt("hoje", at("2026-10-09", "23:59")), // the last moment of today
      appt("amanha", at("2026-10-10", "00:00")), // tomorrow: out
    ),
    TODAY,
  );
  assert.deepEqual(
    rows.map((a) => a.id),
    ["hoje", "seis"],
    "os dois extremos entram, o dia seguinte e o oitavo não",
  );
}

// Newest first, whatever order they were stored in.
{
  const rows = recentAppointments(data(appt("a", at("2026-10-05")), appt("c", at("2026-10-08")), appt("b", at("2026-10-05", "14:30"))), TODAY);
  assert.deepEqual(
    rows.map((a) => a.id),
    ["c", "b", "a"],
    "mais recente primeiro, e no mesmo dia pela hora",
  );
}

// Cancelled ones are appointments too; the drawer shows them with their status.
{
  const rows = recentAppointments(data(appt("x", at("2026-10-08"), { status: "CANCELED" })), TODAY);
  assert.equal(rows.length, 1);
}

// An empty window is the empty state, and the input is left as it was.
{
  assert.deepEqual(recentAppointments(data(), TODAY), []);
  assert.deepEqual(recentAppointments(data(appt("longe", at("2026-09-01"))), TODAY), [], "nada nos últimos 7 dias");

  const input = data(appt("a", at("2026-10-05")), appt("b", at("2026-10-08")));
  recentAppointments(input, TODAY);
  assert.deepEqual(
    input.appointments.map((a) => a.id),
    ["a", "b"],
    "ordenar não mexe na lista de quem chamou",
  );
}

// The window crosses a month and a year.
{
  const jan = new Date(2027, 0, 3);
  const rows = recentAppointments(data(appt("virada", at("2026-12-28")), appt("fora", at("2026-12-27"))), jan);
  assert.deepEqual(
    rows.map((a) => a.id),
    ["virada"],
    "28/12 é seis dias antes de 03/01",
  );
}

// A custom window.
{
  const rows = recentAppointments(data(appt("a", at("2026-10-08")), appt("b", at("2026-10-06"))), TODAY, 2);
  assert.deepEqual(
    rows.map((a) => a.id),
    ["a"],
    "dois dias é hoje e ontem",
  );
}

console.log("activity ok");
