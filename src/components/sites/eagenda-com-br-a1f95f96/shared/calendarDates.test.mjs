// Run: node src/components/sites/eagenda-com-br-a1f95f96/shared/calendarDates.test.mjs
// Titles and grids captured from the live page on 17/09/2026.
import assert from "node:assert/strict";
import { monthDays, periodTitle, shiftDate, weekDays, eventsOn } from "./calendarDates.ts";

const sep17 = new Date(2026, 8, 17);

assert.equal(periodTitle(sep17, "week"), "13 – 19 de Setembro 2026");
assert.equal(periodTitle(sep17, "week", true), "13 – 19 set 2026");
assert.equal(periodTitle(sep17, "day"), "Quinta-feira, 17 de Setembro 2026");
assert.equal(periodTitle(sep17, "day", true), "Qui, 17 set 2026");
assert.equal(periodTitle(sep17, "month"), "Setembro 2026");

// Week crossing a month, and a year.
assert.equal(periodTitle(new Date(2026, 8, 29), "week"), "27 Setembro – 3 Outubro 2026");
assert.equal(periodTitle(new Date(2026, 8, 29), "week", true), "27 set – 3 out 2026");
assert.equal(periodTitle(new Date(2026, 11, 30), "week", true), "27 dez – 2 jan 2027");

// Week grid starts on Sunday; month grid is whole weeks (35 cells for September 2026).
const week = weekDays(sep17);
assert.equal(week.length, 7);
assert.equal(week[0].getDate(), 13);
assert.equal(week[0].getDay(), 0);
assert.equal(monthDays(sep17).length, 35);
assert.equal(monthDays(sep17)[0].getDate(), 30); // 30 August

assert.equal(shiftDate(sep17, "week", 1).getDate(), 24);
assert.equal(shiftDate(sep17, "month", 1).getMonth(), 9);

assert.equal(eventsOn(new Date(2026, 8, 7))[0].title, "Independência do Brasil");
assert.deepEqual(eventsOn(sep17), []);
console.log("calendarDates ok");

// Month steps keep the day, so Mês → next → prev → Semana returns to the same week.
import { addMonths } from "./calendarDates.ts";
assert.equal(addMonths(addMonths(sep17, 1), -1).getDate(), 17);
assert.equal(addMonths(new Date(2026, 0, 31), 1).getDate(), 28); // clamped to end of February
console.log("month stepping ok");

// Date picker and indicators helpers — values captured from /relatorios/indicadores on 18/09/2026.
import { comparisonWindow, daysBetween, formatBR, parseBR, pickerCells } from "./calendarDates.ts";
const sep18 = new Date(2026, 8, 18);
const w = comparisonWindow(sep18, 90);
assert.equal(`${formatBR(w.from)} - ${formatBR(w.to)}`, "20/06/2026 - 18/09/2026");
assert.equal(`${formatBR(w.prevFrom)} - ${formatBR(w.prevTo)}`, "21/03/2026 - 19/06/2026");
assert.equal(formatBR(parseBR("10/09/2026")), "10/09/2026");
assert.equal(parseBR("31/02/2026"), null);
assert.equal(parseBR("1/9/2026"), null);
const cells = pickerCells(sep18);
assert.equal(cells.length, 42);
assert.deepEqual(cells.slice(0, 3).map((c) => c && c.getDate()), [null, null, 1]); // 1 Sep 2026 is a Tuesday
assert.equal(cells.filter(Boolean).length, 30);
assert.equal(daysBetween(w.from, w.to), 90);
assert.equal(daysBetween(new Date(2026, 9, 1), new Date(2026, 10, 1)), 31); // across the October DST change
console.log("picker + indicators ok");
