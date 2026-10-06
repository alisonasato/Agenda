// node src/lib/seiri/slots.test.mjs — the half-hour grid an agenda offers, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { slotsOf, slotColor, hourRange, intervalsOf, SLOT_COLORS, tint, shade } = await import("./slots.ts");

// 2026-09-24 is a Thursday, so the working hours go on weekday 4.
const THU = new Date(2026, 8, 24);
const KEY = "2026-09-24";

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
  agendas: [],
  services: [],
  tags: [],
  clients: [],
  appointments: [],
  waiting: [],
  // 09:00–11:00 on Thursday: four half-hour slots.
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

// The grid is cut into SLOT_MINUTES pieces, and a trailing remainder is dropped.
{
  const slots = slotsOf(base, "a1", THU);
  assert.equal(slots.length, 4, "09:00–11:00 is four half-hour slots");
  assert.deepEqual(
    slots.map((s) => s.start.slice(11)),
    ["09:00", "09:30", "10:00", "10:30"],
  );
  assert.equal(slots[0].end.slice(11), "09:30");
  assert.equal(slots[0].max, 1, "no limit on the interval means one place");

  const odd = { ...base, hours: { a1: { 4: [{ start: "09:00", end: "10:20", max: null }] } } };
  assert.equal(slotsOf(odd, "a1", THU).length, 2, "a slot that would run past the end is not offered");

  assert.deepEqual(slotsOf(base, "a1", new Date(2026, 8, 26)), [], "a day with no hours offers nothing");
  assert.deepEqual(intervalsOf(base, "a2", THU), [], "an agenda with no hours at all");
}

// An appointment fills every slot its duration runs through, and only on its own agenda.
{
  const long = { ...base, appointments: [appointment({ start: `${KEY}T09:15`, duration: 60 })] };
  const taken = slotsOf(long, "a1", THU).map((s) => s.appointments.length);
  assert.deepEqual(taken, [1, 1, 1, 0], "09:15 for an hour runs to 10:15, so it reaches into the 10:00 slot");

  const other = { ...base, appointments: [appointment({ agendaId: "a2" })] };
  assert.deepEqual(
    slotsOf(other, "a1", THU).map((s) => s.appointments.length),
    [0, 0, 0, 0],
    "another agenda's appointment does not fill this one",
  );

  const cancelled = { ...base, appointments: [appointment({ status: "CANCELED" })] };
  assert.equal(slotsOf(cancelled, "a1", THU)[0].appointments.length, 0, "a cancelled appointment frees its slot");

  const otherDay = { ...base, appointments: [appointment({ start: "2026-09-25T09:00" })] };
  assert.equal(slotsOf(otherDay, "a1", THU)[0].appointments.length, 0, "another day does not bleed into this one");
}

// Blocks close slots; one with no times closes the whole day.
{
  const block = (over) => ({ id: "bl1", agendaIds: ["a1"], from: KEY, to: "", startTime: "", endTime: "", reason: "Reunião", ...over });

  const allDay = { ...base, blocks: [block({})] };
  assert.ok(
    slotsOf(allDay, "a1", THU).every((s) => s.blocked && s.blockReason === "Reunião"),
    "a block with no times covers the day",
  );

  const partial = { ...base, blocks: [block({ startTime: "09:30", endTime: "10:00" })] };
  assert.deepEqual(
    slotsOf(partial, "a1", THU).map((s) => s.blocked),
    [false, true, false, false],
    "a timed block only covers the slots it overlaps",
  );

  const elsewhere = { ...base, blocks: [block({ agendaIds: ["a2"] })] };
  assert.ok(!slotsOf(elsewhere, "a1", THU)[0].blocked, "a block on another agenda does not apply");

  const range = { ...base, blocks: [block({ from: "2026-09-23", to: "2026-09-25" })] };
  assert.ok(slotsOf(range, "a1", THU)[0].blocked, "a multi-day block covers the days between");
  const before = { ...base, blocks: [block({ from: "2026-09-25", to: "2026-09-26" })] };
  assert.ok(!slotsOf(before, "a1", THU)[0].blocked, "a block that starts later does not reach back");
}

// A holiday closes the agenda the same way a block does.
{
  const holiday = {
    ...base,
    holidays: [{ id: "hl1", agendaIds: [], name: "Festa da cidade", date: KEY, endDate: "", allDay: true, startTime: "", endTime: "" }],
  };
  const slots = slotsOf(holiday, "a1", THU);
  assert.ok(
    slots.every((s) => s.blocked && s.blockReason === "Festa da cidade"),
    "the holiday name is the reason",
  );

  // A manual block wins the reason when both land on the same slot.
  const both = { ...holiday, blocks: [{ id: "bl1", agendaIds: ["a1"], from: KEY, to: "", startTime: "", endTime: "", reason: "Reunião" }] };
  assert.equal(slotsOf(both, "a1", THU)[0].blockReason, "Reunião", "the block is read before the holiday");
}

// slotInfo overrides one slot's own times and places.
{
  const data = { ...base, slotInfo: { "a1|2026-09-24T09:30": { start: "09:40", end: "10:10", max: 3 } } };
  const slot = slotsOf(data, "a1", THU)[1];
  assert.equal(slot.start.slice(11), "09:40");
  assert.equal(slot.end.slice(11), "10:10");
  assert.equal(slot.max, 3, "the slot's own limit wins over the interval's");

  const fromInterval = { ...base, hours: { a1: { 4: [{ start: "09:00", end: "10:00", max: 4 }] } } };
  assert.equal(slotsOf(fromInterval, "a1", THU)[0].max, 4, "the interval's limit is used when the slot has none");
}

// The colour follows how full the slot is.
{
  const slot = (taken, max) => ({ appointments: Array.from({ length: taken }, () => ({})), max });
  assert.equal(slotColor(slot(0, 2)), SLOT_COLORS.free);
  assert.equal(slotColor(slot(1, 2)), SLOT_COLORS.partial);
  assert.equal(slotColor(slot(2, 2)), SLOT_COLORS.full);
  assert.equal(slotColor(slot(3, 2)), SLOT_COLORS.full, "over the limit is still full, not partial");
}

// The grid's first and last row span every agenda shown.
{
  const week = [THU, new Date(2026, 8, 25)];
  const data = {
    ...base,
    hours: { a1: { 4: [{ start: "09:00", end: "11:00", max: null }] }, a2: { 5: [{ start: "07:30", end: "19:15", max: null }] } },
  };
  assert.deepEqual(hourRange(data, week, ["a1", "a2"]), { first: 7, last: 20 }, "the start rounds down and the end rounds up");
  assert.deepEqual(hourRange(data, week, ["a1"]), { first: 9, last: 11 });
  assert.deepEqual(hourRange(base, week, ["a3"]), { first: 8, last: 17 }, "no hours at all falls back to the default range");

  const single = { ...base, hours: { a1: { 4: [{ start: "09:00", end: "09:30", max: null }] } } };
  assert.deepEqual(hourRange(single, [THU], ["a1"]), { first: 9, last: 10 }, "the range is never shorter than an hour");
}

// The two colour helpers.
{
  assert.equal(tint("#000000", 0), "rgb(0, 0, 0)");
  assert.equal(tint("#000000", 1), "rgb(255, 255, 255)");
  assert.equal(tint("#48CFAE", 0.5), "rgb(164, 231, 215)");
  assert.equal(shade("#FFFFFF", 0.5), "rgb(128, 128, 128)");
  assert.equal(shade("#D42325", 1), "rgb(212, 35, 37)");
}

console.log("slots ok");
