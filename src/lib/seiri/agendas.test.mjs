// node src/lib/seiri/agendas.test.mjs — what deleting an agenda takes with it, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { removeAgenda } = await import("./agendas.ts");
const { seed } = await import("./seed.ts");

/** Every place the agenda's id shows up as a value, a key, or the front of a "<id>|<start>" key. */
function mentions(value, id, path = "data", out = []) {
  if (value === id || (typeof value === "string" && value.startsWith(`${id}|`))) out.push(path);
  else if (Array.isArray(value)) value.forEach((v, i) => mentions(v, id, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === id || k.startsWith(`${id}|`)) out.push(`${path}.${k}`);
      mentions(v, id, `${path}.${k}`, out);
    }
  }
  return out;
}

const row = (over) => ({ id: "x", ...over });

/** The seed, plus a row in every collection that can point at an agenda, for a1 alone, for a1 and a2, and for no agenda at all. */
function loaded() {
  const d = seed();
  d.limits.push(row({ id: "L-only", agendaIds: ["a1"] }), row({ id: "L-both", agendaIds: ["a1", "a2"] }), row({ id: "L-all", agendaIds: [] }));
  d.holidays.push(row({ id: "H-only", agendaIds: ["a1"] }), row({ id: "H-all", agendaIds: [] }));
  d.notificationRules.push(row({ id: "N-only", agendaIds: ["a1"] }), row({ id: "N-both", agendaIds: ["a1", "a2"] }), row({ id: "N-all", agendaIds: [] }));
  d.statusRules.push(row({ id: "S-only", agendaIds: ["a1"] }), row({ id: "S-all", agendaIds: [] }));
  d.accessLists.push(row({ id: "A-only", agendaIds: ["a1"] }), row({ id: "A-all", agendaIds: [] }));
  d.blocks.push(row({ id: "B-only", agendaIds: ["a1"] }), row({ id: "B-both", agendaIds: ["a1", "a2"] }));
  d.manualHours.push(row({ id: "M-only", agendaIds: ["a1"] }));
  d.services.push(row({ id: "sv-only", agendaIds: ["a1"] }), row({ id: "sv-both", agendaIds: ["a1", "a2"] }));
  d.members.push(row({ id: "mb-only", agendaIds: ["a1"] }), row({ id: "mb-both", agendaIds: ["a1", "a2"] }));
  d.surveys.push(row({ id: "sy-only", agendaIds: ["a1"] }));
  d.agendaGroups.push(row({ id: "g-only", agendaIds: ["a1"] }), row({ id: "g-both", agendaIds: ["a1", "a2"] }));
  d.waiting.push(row({ id: "tw1", agendaId: "a1" }), row({ id: "tw2", agendaId: "a2" }));
  d.recurrences.push(row({ id: "tr1", agendaId: "a1" }), row({ id: "tr2", agendaId: "a2" }));
  d.agendaLogs.push(row({ id: "tl1", agendaId: "a1" }), row({ id: "tl2", agendaId: "a2" }));
  d.agendaEmails.push(row({ id: "te1", agendaId: "a1" }), row({ id: "te2", agendaId: "a2" }));
  d.teamLogs.push(row({ id: "tt1", agendaId: "a1" }));
  d.slotInfo["a1|2026-10-12T09:00"] = { max: 3 };
  d.slotInfo["a2|2026-10-12T09:00"] = { max: 4 };
  d.holidayRules.a1 = { skipped: [] };
  d.holidayRules.a2 = { skipped: [] };
  return d;
}
const ids = (rows) => rows.map((r) => r.id);

// The scenario really points at a1 from every kind of place, or the checks below would prove nothing.
{
  const places = new Set(
    mentions(loaded(), "a1").map((p) =>
      p
        .replace(/\[\d+\]/g, "[]")
        .split(".")
        .slice(1, 3)
        .join(".")
        .replace(/\[\]$/, ""),
    ),
  );
  for (const need of ["agendas", "appointments", "waiting", "recurrences", "hours", "agendaRules", "agendaOptions", "holidayRules", "slotInfo"]) {
    assert.ok(
      [...places].some((p) => p.startsWith(need)),
      `a cena aponta para a1 em ${need}`,
    );
  }
}

// Nothing left points at the deleted agenda, whichever it is. The team's log keeps its row on purpose.
for (const id of ["a1", "a2"]) {
  const after = removeAgenda(loaded(), id);
  const left = mentions(after, id).filter((p) => !p.startsWith("data.teamLogs"));
  assert.deepEqual(left, [], `nada aponta para ${id}`);
  assert.ok(!after.agendas.some((a) => a.id === id));
}
assert.equal(removeAgenda(loaded(), "a1").teamLogs.find((l) => l.id === "tt1")?.agendaId, "a1", "o log da equipe é histórico: fica");

// Its own records go, the other agenda's stay.
{
  const before = loaded();
  const after = removeAgenda(before, "a1");
  assert.ok(after.appointments.length < before.appointments.length, "os agendamentos da agenda saem");
  assert.ok(after.appointments.length > 0, "e os da outra ficam");
  assert.ok(after.appointments.every((a) => a.agendaId === "a2"));
  for (const [rows, mine] of [
    [after.waiting, "tw"],
    [after.recurrences, "tr"],
    [after.agendaLogs, "tl"],
    [after.agendaEmails, "te"],
  ]) {
    assert.ok(ids(rows).includes(`${mine}2`) && !ids(rows).includes(`${mine}1`), `${mine}1 sai e ${mine}2 fica`);
    assert.ok(
      rows.every((r) => r.agendaId === "a2"),
      `só sobra o que é da outra agenda (${mine})`,
    );
  }
  assert.deepEqual(Object.keys(after.slotInfo), ["a2|2026-10-12T09:00"], "só o horário avulso da outra agenda");
  assert.deepEqual(Object.keys(after.holidayRules), ["a2"]);
  assert.ok(!("a1" in after.hours) && "a2" in after.hours);
  assert.ok(!("a1" in after.agendaRules) && !("a1" in after.agendaOptions));
}

// A rule that said "todas as agendas" when empty must not turn global because its one agenda went.
{
  const after = removeAgenda(loaded(), "a1");
  const has = (rows, id) => rows.some((r) => r.id === id);

  for (const [rows, only, both, all] of [
    [after.limits, "L-only", "L-both", "L-all"],
    [after.notificationRules, "N-only", "N-both", "N-all"],
  ]) {
    assert.ok(!has(rows, only), `${only} era só da agenda: some`);
    assert.deepEqual(rows.find((r) => r.id === both).agendaIds, ["a2"], `${both} fica só com a outra`);
    assert.deepEqual(rows.find((r) => r.id === all).agendaIds, [], `${all} já era global: continua`);
  }
  assert.ok(!has(after.holidays, "H-only") && has(after.holidays, "H-all"));
  assert.ok(!has(after.statusRules, "S-only") && has(after.statusRules, "S-all"));
  assert.ok(!has(after.accessLists, "A-only") && has(after.accessLists, "A-all"));
  assert.ok(!has(after.blocks, "B-only"));
  assert.deepEqual(after.blocks.find((r) => r.id === "B-both").agendaIds, ["a2"]);
  assert.ok(!has(after.manualHours, "M-only"));
}

// A service, member, survey or group stays, with a shorter list.
{
  const after = removeAgenda(loaded(), "a1");
  const get = (rows, id) => rows.find((r) => r.id === id);
  assert.deepEqual(get(after.services, "sv-only").agendaIds, [], "o serviço fica, sem agenda");
  assert.deepEqual(get(after.services, "sv-both").agendaIds, ["a2"]);
  assert.deepEqual(get(after.members, "mb-only").agendaIds, [], "o membro continua na equipe");
  assert.deepEqual(get(after.members, "mb-both").agendaIds, ["a2"]);
  assert.deepEqual(get(after.surveys, "sy-only").agendaIds, []);
  assert.deepEqual(get(after.agendaGroups, "g-only").agendaIds, []);
  assert.deepEqual(get(after.agendaGroups, "g-both").agendaIds, ["a2"]);
}

// It does not touch the data it was given, and an unknown id changes nothing.
{
  const before = loaded();
  const snapshot = JSON.stringify(before);
  removeAgenda(before, "a1");
  assert.equal(JSON.stringify(before), snapshot, "devolve cópia; o original fica como estava");
  assert.deepEqual(removeAgenda(before, "nenhuma"), before);
}

console.log("agendas ok");
