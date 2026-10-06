// node src/lib/seiri/sends.test.mjs — the notifications the rules schedule, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { sendsOf, showStamp, SITUATION_TONES } = await import("./sends.ts");

const START = "2026-09-24T09:00";
/** Well before the appointment, so a rule that sends beforehand is still waiting. */
const NOW = new Date(2026, 8, 20, 12, 0);

const appointment = (over) => ({
  id: "ap1",
  code: "1",
  clientId: "c1",
  agendaId: "a1",
  serviceId: "s1",
  start: START,
  duration: 30,
  status: "CONFIRMED",
  owner: "",
  tagIds: [],
  comment: "",
  ...over,
});

const rule = (over) => ({
  id: "r1",
  title: "Lembrete 1 dia antes",
  agendaIds: [],
  recipients: { client: true, companions: false, owner: false, team: false },
  channel: "email",
  smsText: "",
  emailTemplate: "t1",
  whatsappTemplate: "",
  survey: "",
  immediate: false,
  when: "before",
  days: 1,
  hours: 0,
  minutes: 0,
  statusFilter: "",
  ...over,
});

const base = {
  appointments: [appointment({})],
  clients: [{ id: "c1", name: "Ana Lima", email: "ana@exemplo.com.br", phone: "11999990001" }],
  agendas: [{ id: "a1", name: "Agenda Principal", active: true }],
  notificationRules: [rule({})],
};

// One rule against one appointment: the row the table prints.
{
  const [send] = sendsOf(base, NOW);
  assert.equal(send.id, "ap1-r1", "the row is keyed by both, so a rule change rebuilds it");
  assert.equal(send.clientName, "Ana Lima");
  assert.equal(send.contact, "ana@exemplo.com.br · 11999990001");
  assert.equal(send.agendaName, "Agenda Principal");
  assert.equal(send.ruleTitle, "Lembrete 1 dia antes");
  assert.equal(send.channel, "email");
  assert.equal(send.channelLabel, "Email", "the label comes from CHANNEL_LABELS, not the raw channel");
  assert.equal(send.status, "CONFIRMED");
  assert.equal(send.start, START);
  assert.equal(send.at, "2026-09-23T09:00", "a day before the appointment");
  assert.equal(send.situation, "Aguardando");
}

// The offset: days, hours and minutes add up, and `when` picks the side.
{
  const at = (over, now = NOW) => sendsOf({ ...base, notificationRules: [rule(over)] }, now)[0].at;

  assert.equal(at({ days: 0, hours: 2, minutes: 0 }), "2026-09-24T07:00");
  assert.equal(at({ days: 0, hours: 0, minutes: 30 }), "2026-09-24T08:30");
  assert.equal(at({ days: 1, hours: 2, minutes: 30 }), "2026-09-23T06:30", "the three add together");
  assert.equal(at({ when: "after", days: 0, hours: 1, minutes: 0 }), "2026-09-24T10:00", "'after' sends past the appointment");
  assert.equal(at({ when: "after", days: 2, hours: 0, minutes: 0 }), "2026-09-26T09:00");
  assert.equal(at({ days: 0, hours: 10, minutes: 0 }), "2026-09-23T23:00", "an offset over the start rolls back a day");

  // An immediate rule ignores the offset entirely and sits on the appointment's own time.
  assert.equal(at({ immediate: true, days: 5, hours: 5, minutes: 5 }), START);
}

// The situation: cancelled first, then whether the send time has already passed.
{
  const situation = (over, now = NOW) => sendsOf({ ...base, notificationRules: [rule(over)] }, now)[0].situation;

  assert.equal(situation({}), "Aguardando", "the send is still ahead of `now`");
  assert.equal(situation({}, new Date(2026, 8, 24, 12, 0)), "Enviada", "`now` is past the send time");
  assert.equal(situation({}, new Date(2026, 8, 23, 9, 0)), "Enviada", "exactly on the send time counts as sent");

  const canceled = sendsOf({ ...base, appointments: [appointment({ status: "CANCELED" })] }, new Date(2026, 8, 24, 12, 0))[0];
  assert.equal(canceled.situation, "Cancelada", "a cancelled appointment overrides a send that already went out");
}

// Which rules apply at all.
{
  const count = (rules, over = {}) => sendsOf({ ...base, notificationRules: rules, appointments: [appointment(over)] }, NOW).length;

  assert.equal(count([rule({ channel: "" })]), 0, "a rule with no channel chosen does not send");
  assert.equal(count([rule({ recipients: { client: false, companions: true, owner: true, team: true } })]), 0, "only rules aimed at the client are listed");

  // "Aplicar a todas as agendas" is the empty list; otherwise the appointment's agenda must be named.
  assert.equal(count([rule({ agendaIds: [] })]), 1);
  assert.equal(count([rule({ agendaIds: ["a1"] })]), 1);
  assert.equal(count([rule({ agendaIds: ["a2"] })]), 0, "a rule scoped to another agenda does not apply");
  assert.equal(count([rule({ agendaIds: ["a2", "a1"] })]), 1);
}

// The status filter lets through only the statuses it names.
{
  const applies = (statusFilter, status) =>
    sendsOf({ ...base, notificationRules: [rule({ statusFilter })], appointments: [appointment({ status })] }, NOW).length === 1;

  assert.ok(applies("", "PENDING"), "no filter lets every status through");
  assert.ok(applies("CONFIRMADO", "CONFIRMED"));
  assert.ok(!applies("CONFIRMADO", "PENDING"));
  assert.ok(applies("PENDENTE", "PENDING"));
  assert.ok(applies("ATENDIDO", "ATTENDED"));
  assert.ok(applies("NO_SHOW", "NO_SHOW"));
  assert.ok(applies("ATEND_OR_CONF", "ATTENDED"), "the pair filter takes both");
  assert.ok(applies("ATEND_OR_CONF", "CONFIRMED"));
  assert.ok(!applies("ATEND_OR_CONF", "PENDING"));
  assert.ok(!applies("INVENTADO", "CONFIRMED"), "a filter nobody defined lets nothing through");

  // An immediate rule fires on creation, before any status filter could be judged.
  assert.ok(
    sendsOf({ ...base, notificationRules: [rule({ immediate: true, statusFilter: "NO_SHOW" })], appointments: [appointment({ status: "PENDING" })] }, NOW)
      .length === 1,
    "an immediate rule skips the status filter",
  );
}

// Every appointment is crossed with every rule that applies.
{
  const data = {
    ...base,
    appointments: [appointment({ id: "ap1" }), appointment({ id: "ap2", start: "2026-09-25T09:00" })],
    notificationRules: [rule({ id: "r1" }), rule({ id: "r2", channel: "whatsapp", title: "Confirmação" })],
  };
  const sends = sendsOf(data, NOW);
  assert.equal(sends.length, 4);
  assert.deepEqual(
    sends.map((s) => s.id),
    ["ap1-r1", "ap1-r2", "ap2-r1", "ap2-r2"],
  );
  assert.equal(sends.find((s) => s.id === "ap1-r2").channelLabel, "WhatsApp");
  assert.deepEqual(sendsOf({ ...base, appointments: [] }, NOW), [], "no appointments, nothing scheduled");
  assert.deepEqual(sendsOf({ ...base, notificationRules: [] }, NOW), [], "no rules, nothing scheduled");
}

// A client or agenda that no longer exists still leaves a readable row.
{
  const orphan = sendsOf({ ...base, appointments: [appointment({ clientId: "gone", agendaId: "gone" })] }, NOW)[0];
  assert.equal(orphan.clientName, "—");
  assert.equal(orphan.agendaName, "—");
  assert.equal(orphan.contact, "", "no contact at all rather than a stray separator");

  // The separator only appears between the two the client actually has.
  const onlyEmail = sendsOf({ ...base, clients: [{ id: "c1", name: "Ana", email: "ana@exemplo.com.br", phone: "" }] }, NOW)[0];
  assert.equal(onlyEmail.contact, "ana@exemplo.com.br");
  const onlyPhone = sendsOf({ ...base, clients: [{ id: "c1", name: "Ana", email: "", phone: "11999990001" }] }, NOW)[0];
  assert.equal(onlyPhone.contact, "11999990001");
}

// showStamp prints the stored order backwards, the way the tables read.
{
  assert.equal(showStamp("2026-09-24T09:00"), "24/09/2026 09:00");
  assert.equal(showStamp("2026-01-05T14:35"), "05/01/2026 14:35");
  assert.equal(showStamp(""), "—", "nothing scheduled is a dash, not an empty cell");
}

// Every situation has a chip to be painted with.
{
  assert.deepEqual(Object.keys(SITUATION_TONES).sort(), ["Aguardando", "Cancelada", "Enviada"]);
  assert.ok(
    Object.values(SITUATION_TONES).every((t) => t.startsWith("hchip--")),
    "the tones are the original's chip classes",
  );
}

console.log("sends ok");
