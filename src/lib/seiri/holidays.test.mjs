// node --experimental-strip-types src/lib/seiri/holidays.test.mjs — what closes an agenda on a day.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { holidayOf } = await import("./holidays.ts");
const { slotsOf } = await import("./slots.ts");

const base = {
  agendas: [{ id: "a1", name: "Agenda Principal", color: "#0A70D6", active: true }],
  services: [],
  tags: [],
  clients: [],
  appointments: [],
  waiting: [],
  // Monday to Friday, 09:00–11:00.
  hours: { a1: [[], ...Array.from({ length: 5 }, () => [{ start: "09:00", end: "11:00", max: null }]), []] },
  blocks: [],
  slotInfo: {},
  agendaRules: {},
  agendaOptions: {},
  recurrences: [],
  limits: [],
  holidays: [],
  holidayRules: {},
};

const allDay = (over) => ({ id: "hd1", name: "Recesso", date: "2026-12-24", endDate: "", allDay: true, startTime: "", endTime: "", agendaIds: [], ...over });

// A whole-day custom holiday closes the agenda, whatever the hour.
{
  const data = { ...base, holidays: [allDay()] };
  assert.equal(holidayOf(data, "a1", "2026-12-24", 540, 570), "Recesso");
  assert.equal(holidayOf(data, "a1", "2026-12-23", 540, 570), "", "the day before is open");
}

// A stretch of days covers everything in between.
{
  const data = { ...base, holidays: [allDay({ endDate: "2026-12-31" })] };
  assert.equal(holidayOf(data, "a1", "2026-12-28", 540, 570), "Recesso");
  assert.equal(holidayOf(data, "a1", "2027-01-02", 540, 570), "", "past the end it is open again");
}

// A part-day holiday only closes the hours it names.
{
  const data = { ...base, holidays: [allDay({ allDay: false, startTime: "13:00", endTime: "18:00" })] };
  assert.equal(holidayOf(data, "a1", "2026-12-24", 540, 570), "", "09:00 is outside 13:00–18:00");
  assert.equal(holidayOf(data, "a1", "2026-12-24", 840, 870), "Recesso", "14:00 is inside it");
}

// A holiday aimed at another agenda leaves this one open.
{
  const data = { ...base, holidays: [allDay({ agendaIds: ["a2"] })] };
  assert.equal(holidayOf(data, "a1", "2026-12-24", 540, 570), "");
}

// National holidays only count once the agenda asks for them, and can be skipped one by one.
{
  const off = { ...base, holidayRules: { a1: { national: false, state: false, skipped: [] } } };
  assert.equal(holidayOf(off, "a1", "2026-12-25", 540, 570), "", "Natal is open while the agenda ignores national holidays");

  const on = { ...base, holidayRules: { a1: { national: true, state: false, skipped: [] } } };
  assert.equal(holidayOf(on, "a1", "2026-12-25", 540, 570), "Natal");

  const skipped = { ...base, holidayRules: { a1: { national: true, state: false, skipped: ["2026-12-25"] } } };
  assert.equal(holidayOf(skipped, "a1", "2026-12-25", 540, 570), "", "unticking Natal reopens the day");
}

// The calendar's slots carry the holiday as their block reason.
{
  const data = { ...base, holidayRules: { a1: { national: true, state: false, skipped: [] } } };
  const natal = slotsOf(data, "a1", new Date(2026, 11, 25));
  assert.ok(natal.length > 0, "Christmas 2026 is a Friday, so the agenda has slots that day");
  assert.ok(
    natal.every((s) => s.blocked && s.blockReason === "Natal"),
    "every slot that day is blocked by Natal",
  );

  const open = slotsOf(data, "a1", new Date(2026, 11, 24));
  assert.ok(
    open.every((s) => !s.blocked),
    "the day before stays open",
  );
}

console.log("holidays ok");
