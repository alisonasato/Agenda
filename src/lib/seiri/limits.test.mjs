// node src/lib/seiri/limits.test.mjs — the limit rules, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { exceeded, blockedBy } = await import("./limits.ts");

const clients = [
  { id: "c1", name: "Ana", email: "ana@exemplo.com.br", phone: "11999990001" },
  { id: "c2", name: "Ana", email: "outra@exemplo.com.br", phone: "11999990001" },
  { id: "c3", name: "Bruno", email: "bruno@exemplo.com.br", phone: "11999990002" },
];

const appointment = (clientId, start, status = "CONFIRMED") => ({
  id: `ap-${clientId}-${start}`,
  code: "1",
  clientId,
  agendaId: "a1",
  serviceId: "s1",
  start,
  duration: 30,
  status,
  owner: "",
  tagIds: [],
  comment: "",
});

const base = {
  agendas: [],
  services: [],
  tags: [],
  clients,
  appointments: [],
  waiting: [],
  hours: {},
  blocks: [],
  slotInfo: {},
  agendaRules: {},
  agendaOptions: {},
  recurrences: [],
  limits: [],
};

const limit = (over) => ({ id: "lm1", type: "AGENDAMENTOS", key: "nome", agendaIds: [], serviceIds: [], interval: "DIA", days: 0, max: 1, ...over });
const candidate = (clientId, start) => ({ clientId, agendaId: "a1", serviceId: "s1", start });

// One a day, and the client already has one that day.
{
  const data = { ...base, limits: [limit({})], appointments: [appointment("c1", "2026-09-27T09:00")] };
  assert.ok(exceeded(data, candidate("c1", "2026-09-27T15:00")), "same day is over the limit");
  assert.equal(exceeded(data, candidate("c1", "2026-09-28T09:00")), null, "the next day is free again");
  assert.equal(exceeded(data, candidate("c3", "2026-09-27T15:00")), null, "another name is not the same person");
}

// "Mesmos Nome e Telefone" treats two records as one person.
{
  const data = { ...base, limits: [limit({ key: "phone+name" })], appointments: [appointment("c1", "2026-09-27T09:00")] };
  assert.ok(exceeded(data, candidate("c2", "2026-09-27T15:00")), "same name and phone counts together");
}

// Cancelled appointments do not count; a FALTAS limit only counts no-shows.
{
  const data = { ...base, limits: [limit({})], appointments: [appointment("c1", "2026-09-27T09:00", "CANCELED")] };
  assert.equal(exceeded(data, candidate("c1", "2026-09-27T15:00")), null, "a cancelled one frees the slot");

  const faltas = { ...base, limits: [limit({ type: "FALTAS" })], appointments: [appointment("c1", "2026-09-27T09:00")] };
  assert.equal(exceeded(faltas, candidate("c1", "2026-09-27T15:00")), null, "a kept appointment is not a no-show");
  const missed = { ...faltas, appointments: [appointment("c1", "2026-09-27T09:00", "NO_SHOW")] };
  assert.ok(exceeded(missed, candidate("c1", "2026-09-27T15:00")), "a no-show counts against a FALTAS limit");
}

// A rolling window of N days.
{
  const data = { ...base, limits: [limit({ interval: "NDAYS", days: 7 })], appointments: [appointment("c1", "2026-09-27T09:00")] };
  assert.ok(exceeded(data, candidate("c1", "2026-10-02T09:00")), "five days later is still inside the window");
  assert.equal(exceeded(data, candidate("c1", "2026-10-05T09:00")), null, "eight days later is outside it");
}

// Scoped limits ignore other agendas.
{
  const data = { ...base, limits: [limit({ agendaIds: ["a2"] })], appointments: [appointment("c1", "2026-09-27T09:00")] };
  assert.equal(exceeded(data, candidate("c1", "2026-09-27T15:00")), null, "a limit on another agenda does not apply");
}

// The block list stops a client outright, whatever the limits say.
{
  const entry = (over) => ({
    id: "sp1",
    type: "email",
    contact: "ana@exemplo.com.br",
    reason: "Faltas",
    expiresAt: "",
    createdAt: "",
    createdBy: "",
    active: true,
    ...over,
  });
  const now = new Date(2026, 8, 30, 12, 0);

  const byEmail = { ...base, suppressions: [entry({})] };
  assert.ok(blockedBy(byEmail, "c1", now), "the blocked e-mail matches Ana");
  assert.equal(blockedBy(byEmail, "c3", now), null, "Bruno is not on the list");

  const off = { ...base, suppressions: [entry({ active: false })] };
  assert.equal(blockedBy(off, "c1", now), null, "an inactive block lets the client through");

  const expired = { ...base, suppressions: [entry({ expiresAt: "2026-09-29T00:00" })] };
  assert.equal(blockedBy(expired, "c1", now), null, "a block past its date no longer holds");
  const pending = { ...base, suppressions: [entry({ expiresAt: "2026-10-31T00:00" })] };
  assert.ok(blockedBy(pending, "c1", now), "a block that has not expired still holds");

  // A phone matches however it is punctuated.
  const byPhone = { ...base, suppressions: [entry({ type: "phone", contact: "(11) 99999-0001" })] };
  assert.ok(blockedBy(byPhone, "c1", now), "11999990001 and (11) 99999-0001 are the same phone");
}

// The same phone is the same phone with or without Brazil's +55, and however it is punctuated.
{
  const { samePhone } = await import("./limits.ts");
  assert.ok(samePhone("+55 11 98888-1010", "(11) 98888-1010"));
  assert.ok(samePhone("5511988881010", "11988881010"));
  assert.ok(samePhone("+55 (11) 3333-4444", "1133334444"), "fixo, dez dígitos");
  assert.ok(!samePhone("+55 11 98888-1010", "+55 21 98888-1010"), "outro DDD é outro telefone");
  assert.ok(!samePhone("11 98888-1010", "11 98888-1011"));
  assert.ok(!samePhone("", ""), "dois vazios não são o mesmo telefone");
  assert.ok(!samePhone("()-", "  "), "nem o que só tem pontuação");
  assert.ok(!samePhone("", "11988881010"));
  assert.ok(!samePhone("55", "55"), "só o código do país não é telefone");
  assert.ok(samePhone("5511988881010", "5511988881010"));
  assert.ok(samePhone("(55) 98888-1010", "55988881010"), "55 também é um DDD (Rio Grande do Sul), não só o código do país");
  assert.ok(!samePhone("(55) 98888-1010", "98888-1010"), "e um número de onze dígitos que começa com 55 não perde o 55");

  // A block-list phone matches a client who wrote theirs the other way.
  const entry = { id: "sp2", type: "phone", contact: "+55 11 98888-1010", reason: "", expiresAt: "", createdAt: "", createdBy: "", active: true };
  const withoutCode = { ...base, clients: [{ id: "c9", name: "Zé", email: "z@exemplo.com.br", phone: "(11) 98888-1010" }], suppressions: [entry] };
  assert.ok(blockedBy(withoutCode, "c9", new Date(2026, 8, 30, 12, 0)), "o bloqueio com +55 pega quem digitou sem");

  // A limit by phone counts one person across both writings.
  const same = [
    { id: "p1", name: "Zé", email: "z1@exemplo.com.br", phone: "+55 11 98888-1010" },
    { id: "p2", name: "Zé", email: "z2@exemplo.com.br", phone: "(11) 98888-1010" },
  ];
  const data = { ...base, clients: same, limits: [limit({ key: "phone" })], appointments: [appointment("p1", "2026-09-27T09:00")] };
  assert.ok(exceeded(data, candidate("p2", "2026-09-27T15:00")), "o mesmo telefone, escrito de outro jeito, é a mesma pessoa");
}

console.log("limits ok");
