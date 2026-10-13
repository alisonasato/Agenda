// node src/lib/seiri/booking.test.mjs — what the public booking screen offers, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { dateStr, optionsOf, rulesOf, publicAgendas, servicesOf, timesOf, monthCells, dateFirstCells, formFields } = await import("./booking.ts");
const { DEFAULT_OPTIONS, DEFAULT_RULES } = await import("./types.ts");

// 2026-09-24 is a Thursday; the working hours go on weekday 4.
const KEY = "2026-09-24";
const THU = new Date(2026, 8, 24);
/** Early enough on the day that a one-hour notice still leaves every slot bookable. */
const EARLY = new Date(2026, 8, 24, 6, 0);

const appointment = (over) => ({
  id: "ap1",
  code: "1",
  clientId: "c1",
  agendaId: "a1",
  serviceId: "s1",
  start: `${KEY}T09:00`,
  duration: 30,
  status: "CONFIRMED",
  owner: "",
  tagIds: [],
  comment: "",
  ...over,
});

const base = {
  agendas: [{ id: "a1", name: "Agenda Principal", active: true }],
  services: [],
  tags: [],
  clients: [],
  appointments: [],
  waiting: [],
  hours: { a1: { 4: [{ start: "09:00", end: "11:00", max: null }] } },
  blocks: [],
  slotInfo: {},
  agendaRules: {},
  agendaOptions: {},
  holidays: [],
  holidayRules: {},
  recurrences: [],
  limits: [],
};

// dateStr pads, and never drifts with the timezone the way toISOString does.
{
  assert.equal(dateStr(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(dateStr(new Date(2026, 11, 31)), "2026-12-31");
}

// An agenda with nothing of its own falls back to the defaults.
{
  assert.equal(optionsOf(base, "a1"), DEFAULT_OPTIONS);
  assert.equal(rulesOf(base, "a1"), DEFAULT_RULES);
  const own = { ...base, agendaRules: { a1: { ...DEFAULT_RULES, minNotice: 5 } } };
  assert.equal(rulesOf(own, "a1").minNotice, 5);
}

// Only active agendas open to the outside are offered.
{
  const data = {
    ...base,
    agendas: [
      { id: "a1", name: "Aberta", active: true },
      { id: "a2", name: "Inativa", active: false },
      { id: "a3", name: "Fechada para fora", active: true },
    ],
    agendaOptions: { a3: { ...DEFAULT_OPTIONS, blockExternalBooking: true } },
  };
  assert.deepEqual(
    publicAgendas(data).map((a) => a.id),
    ["a1"],
  );
}

// Services come back in the order the agenda sets, and only its own.
{
  const service = (over) => ({ id: "s1", name: "Consulta", price: 0, duration: 30, agendaIds: ["a1"], tagIds: [], order: 1, members: [], ...over });
  const data = {
    ...base,
    services: [service({ id: "s3", order: 3 }), service({ id: "s1", order: 1 }), service({ id: "s2", order: 2 }), service({ id: "sx", agendaIds: ["a2"] })],
  };
  assert.deepEqual(
    servicesOf(data, "a1").map((s) => s.id),
    ["s1", "s2", "s3"],
  );
  assert.deepEqual(servicesOf(data, "a9"), [], "an agenda with no services");
}

// The times on offer: free, unblocked and past the agenda's minimum notice.
{
  assert.deepEqual(
    timesOf(base, "a1", THU, EARLY).map((t) => t.label),
    ["09:00", "09:30", "10:00", "10:30"],
  );

  // DEFAULT_RULES.minNotice is one hour, so standing at 09:20 hides everything before 10:20.
  assert.deepEqual(
    timesOf(base, "a1", THU, new Date(2026, 8, 24, 9, 20)).map((t) => t.label),
    ["10:30"],
    "a slot inside the notice window is not offered",
  );
  assert.deepEqual(
    timesOf(base, "a1", THU, new Date(2026, 8, 24, 9, 40)).map((t) => t.label),
    [],
    "an hour's notice at 09:40 leaves nothing that day",
  );

  const full = { ...base, appointments: [appointment({ start: `${KEY}T09:00` })] };
  assert.deepEqual(
    timesOf(full, "a1", THU, EARLY).map((t) => t.label),
    ["09:30", "10:00", "10:30"],
    "a taken slot with one place drops out",
  );

  // With two places, one booking leaves the slot on offer and reports how many are taken.
  const shared = { ...base, hours: { a1: { 4: [{ start: "09:00", end: "10:00", max: 2 }] } }, appointments: [appointment({})] };
  const first = timesOf(shared, "a1", THU, EARLY)[0];
  assert.equal(first.label, "09:00");
  assert.equal(first.max, 2);
  assert.equal(first.taken, 1);

  const blocked = { ...base, blocks: [{ id: "bl1", agendaIds: ["a1"], from: KEY, to: "", startTime: "", endTime: "", reason: "Feriado interno" }] };
  assert.deepEqual(timesOf(blocked, "a1", THU, EARLY), [], "a blocked day offers nothing");
  assert.deepEqual(timesOf(base, "a1", new Date(2026, 8, 26), EARLY), [], "a day the agenda does not work");
}

// The month grid: leading blanks, one cell per day, and the status each day carries.
{
  // September 2026 starts on a Tuesday, so two blanks come first, and it has 30 days.
  const cells = monthCells(base, "a1", new Date(2026, 8, 1), EARLY);
  assert.equal(cells.length, 2 + 30);
  assert.deepEqual(cells.slice(0, 2), [null, null], "the grid starts on the right weekday");
  assert.equal(cells[2].day, 1);
  assert.equal(cells[2].dateStr, "2026-09-01");

  const byDate = (key) => cells.find((c) => c && c.dateStr === key);
  const thursday = byDate(KEY);
  assert.ok(thursday.isToday, "EARLY is that Thursday");
  assert.ok(thursday.hasAvailability);
  assert.equal(thursday.status, "", "an open day carries no status");

  const yesterday = byDate("2026-09-23");
  assert.ok(yesterday.isPast, "a day before today is past");
  assert.ok(!yesterday.hasAvailability, "a past day never offers a dot");

  const saturday = byDate("2026-09-26");
  assert.equal(saturday.status, "", "a day the agenda does not work is not 'full'");
  assert.ok(!saturday.hasAvailability);

  // DEFAULT_RULES.maxAhead is 30 days, so 2026-10-25 is the last day on offer.
  const october = monthCells(base, "a1", new Date(2026, 9, 1), EARLY);
  const ahead = (key) => october.find((c) => c && c.dateStr === key);
  assert.ok(!ahead("2026-10-29").hasAvailability, "beyond the agenda's horizon");
  assert.ok(ahead("2026-10-22").hasAvailability, "inside it");
}

// Every slot taken makes the day "full"; every slot blocked makes it "holiday".
{
  const booked = {
    ...base,
    hours: { a1: { 4: [{ start: "09:00", end: "10:00", max: null }] } },
    appointments: [appointment({ id: "ap1", start: `${KEY}T09:00` }), appointment({ id: "ap2", start: `${KEY}T09:30` })],
  };
  const cell = monthCells(booked, "a1", new Date(2026, 8, 1), EARLY).find((c) => c && c.dateStr === KEY);
  assert.equal(cell.status, "full");
  assert.ok(!cell.hasAvailability);

  const closed = {
    ...base,
    holidays: [{ id: "hl1", agendaIds: [], name: "Festa da cidade", date: KEY, endDate: "", allDay: true, startTime: "", endTime: "" }],
  };
  const holiday = monthCells(closed, "a1", new Date(2026, 8, 1), EARLY).find((c) => c && c.dateStr === KEY);
  assert.equal(holiday.status, "holiday");
}

// "Por Data": the month's days, each with the agendas that can take someone then.
{
  // a1 works Thursdays (24/09, 01/10...) 09:00-11:00; a2 works Thursdays and Fridays 09:00-10:00, with a longer horizon.
  const two = {
    ...base,
    agendas: [
      { id: "a1", name: "Agenda Principal", active: true },
      { id: "a2", name: "Unidade Centro", active: true },
    ],
    hours: {
      a1: { 4: [{ start: "09:00", end: "11:00", max: null }] },
      a2: { 4: [{ start: "09:00", end: "10:00", max: null }], 5: [{ start: "09:00", end: "10:00", max: null }] },
    },
    agendaRules: { a2: { ...DEFAULT_RULES, maxAhead: 90 } },
  };
  const agendas = two.agendas;
  const sep = dateFirstCells(two, agendas, new Date(2026, 8, 1), EARLY);
  const at = (cells, key) => cells.find((c) => c && c.dateStr === key);

  // The grid is the month's own: two blanks, then 30 days.
  assert.equal(sep.length, 2 + 30);
  assert.deepEqual(sep.slice(0, 2), [null, null]);
  assert.equal(sep[2].day, 1);
  assert.equal(sep[2].dateStr, "2026-09-01");

  // Thursday both take, Friday only a2, a day neither works nobody.
  assert.deepEqual(at(sep, "2026-09-24").agendaIds, ["a1", "a2"]);
  assert.ok(at(sep, "2026-09-24").hasAvailability);
  assert.deepEqual(at(sep, "2026-09-25").agendaIds, ["a2"], "só a segunda agenda trabalha na sexta");
  assert.deepEqual(at(sep, "2026-09-26").agendaIds, []);
  assert.ok(!at(sep, "2026-09-26").hasAvailability);
  assert.equal(at(sep, "2026-09-26").status, "", "um dia que ninguém trabalha não é 'sem vaga'");

  // Today, and the past.
  assert.ok(at(sep, KEY).isToday);
  assert.ok(!at(sep, "2026-09-25").isToday);
  assert.ok(at(sep, "2026-09-17").isPast, "uma quinta anterior");
  assert.deepEqual(at(sep, "2026-09-17").agendaIds, [], "o passado não oferece nada");

  // A day past one agenda's horizon is still open on the agenda that looks further ahead.
  const oct = dateFirstCells(two, agendas, new Date(2026, 9, 1), EARLY);
  assert.deepEqual(at(oct, "2026-10-22").agendaIds, ["a1", "a2"], "dentro do horizonte das duas");
  assert.deepEqual(at(oct, "2026-10-29").agendaIds, ["a2"], "além do horizonte da primeira (30 dias)");
  assert.ok(!at(oct, "2026-10-29").isPast, "e por isso não é passado");
  const dec = dateFirstCells(two, agendas, new Date(2026, 11, 1), EARLY);
  assert.ok(at(dec, "2026-12-24").isPast, "além do horizonte de todas");
  assert.deepEqual(at(dec, "2026-12-24").agendaIds, []);

  // Vacancies: a day full on one agenda is listed by the other; full on both reads "full".
  const fullOn = (id, time) => appointment({ id: `ap-${id}-${time}`, agendaId: id, start: `${KEY}T${time}` });
  const a1Full = { ...two, appointments: [fullOn("a1", "09:00"), fullOn("a1", "09:30"), fullOn("a1", "10:00"), fullOn("a1", "10:30")] };
  assert.deepEqual(at(dateFirstCells(a1Full, agendas, new Date(2026, 8, 1), EARLY), KEY).agendaIds, ["a2"], "a primeira lotou, a segunda ainda tem");
  assert.equal(at(dateFirstCells(a1Full, agendas, new Date(2026, 8, 1), EARLY), KEY).status, "", "com vaga em alguma agenda o dia não é 'sem vaga'");

  const bothFull = { ...a1Full, appointments: [...a1Full.appointments, fullOn("a2", "09:00"), fullOn("a2", "09:30")] };
  const full = at(dateFirstCells(bothFull, agendas, new Date(2026, 8, 1), EARLY), KEY);
  assert.equal(full.status, "full");
  assert.ok(!full.hasAvailability && full.agendaIds.length === 0);

  // Holiday on every agenda reads "holiday"; "full" on one and "holiday" on the other reads "full".
  const holiday = {
    ...two,
    holidays: [{ id: "hl1", agendaIds: [], name: "Festa da cidade", date: KEY, endDate: "", allDay: true, startTime: "", endTime: "" }],
  };
  assert.equal(at(dateFirstCells(holiday, agendas, new Date(2026, 8, 1), EARLY), KEY).status, "holiday");
  const mixed = { ...holiday, holidays: [{ ...holiday.holidays[0], agendaIds: ["a2"] }], appointments: a1Full.appointments };
  assert.equal(at(dateFirstCells(mixed, agendas, new Date(2026, 8, 1), EARLY), KEY).status, "full", "'sem vaga' vence 'feriado' quando as duas aparecem");

  // A day that is a holiday on the one agenda that works it reads "holiday", though the other agenda does not work it at all.
  const split = { ...two, hours: { a1: two.hours.a1, a2: { 5: two.hours.a2[5] } }, holidays: [{ ...holiday.holidays[0], agendaIds: ["a1"] }] };
  const thursday = at(dateFirstCells(split, agendas, new Date(2026, 8, 1), EARLY), KEY);
  assert.equal(thursday.status, "holiday");
  assert.deepEqual(thursday.agendaIds, []);

  // One agenda gives the same availability its own calendar does; none gives a grid with nothing in it.
  const alone = dateFirstCells(two, [agendas[0]], new Date(2026, 8, 1), EARLY);
  assert.deepEqual(
    alone.map((c) => c && c.hasAvailability),
    monthCells(two, "a1", new Date(2026, 8, 1), EARLY).map((c) => c && c.hasAvailability),
  );
  const none = dateFirstCells(two, [], new Date(2026, 8, 1), EARLY);
  assert.equal(none.length, 32);
  assert.ok(none.every((c) => c === null || (!c.hasAvailability && c.agendaIds.length === 0)));
  assert.ok(
    none.filter(Boolean).every((c) => c.isPast),
    "sem agenda nenhuma, nenhum dia está aberto: todos valem como passado",
  );
}

// The person form asks for what the agenda turned on, in the original's order.
{
  assert.deepEqual(
    formFields(DEFAULT_OPTIONS).map((f) => f.name),
    ["name", "email", "phone"],
    "name is always asked; e-mail and phone are on by default",
  );
  assert.ok(
    formFields(DEFAULT_OPTIONS).every((f) => f.required),
    "and all three are required by default",
  );

  const off = formFields({ ...DEFAULT_OPTIONS, requestEmail: false, requestPhone: false });
  assert.deepEqual(
    off.map((f) => f.name),
    ["name"],
    "nothing but the name when both are off",
  );

  const loose = formFields({ ...DEFAULT_OPTIONS, emailRequired: false });
  assert.equal(loose.find((f) => f.name === "email").required, false, "asked for but optional");

  const everything = formFields({
    ...DEFAULT_OPTIONS,
    requestCpf: true,
    requestDocument: true,
    requestBirthday: true,
    requestGender: true,
    requestNationality: true,
    requestPlaceOfBirth: true,
    requestProfession: true,
    requestAddress: true,
    extraTextField: true,
  });
  assert.deepEqual(
    everything.map((f) => f.name),
    ["name", "email", "phone", "cpf", "identificationNumber", "birthday", "gender", "nationality", "placeOfBirth", "profession", "address", "comment"],
  );
  assert.equal(everything.at(-1).type, "textarea", "the comment is the only textarea");
}

console.log("booking ok");
