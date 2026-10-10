// node src/lib/seiri/range.test.mjs — the period picker's rules, without a browser.
// Every expected value below was measured on the original on 2026-10-09 unless it says otherwise.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const {
  PRESETS,
  ALL_PERIODS,
  presetRange,
  pickPreset,
  rangeLabel,
  periodLabel,
  lastDays,
  rangeLongLabel,
  periodLongLabel,
  periodKey,
  normalizeRange,
  inPeriod,
  pickDay,
  shownRange,
  cellFlags,
  monthToShow,
  isRange,
} = await import("./range.ts");

const TODAY = new Date(2026, 9, 9, 15, 0); // 09/10/2026, a Friday

// The menu offers the five presets, in order.
assert.deepEqual([...PRESETS], ["Hoje", "Próximos 7 dias", "Próximos 30 dias", "Este mês", "Todos os períodos"]);

// What each preset turns into. Seven and thirty days both count today as the first.
{
  assert.deepEqual(presetRange("Hoje", TODAY), { from: "2026-10-09", to: "2026-10-09" });
  assert.deepEqual(presetRange("Próximos 7 dias", TODAY), { from: "2026-10-09", to: "2026-10-15" }, "medido: 09/10 – 15/10");
  assert.deepEqual(presetRange("Próximos 30 dias", TODAY), { from: "2026-10-09", to: "2026-11-07" }, "medido: 09/10 – 07/11");
  assert.deepEqual(presetRange("Este mês", TODAY), { from: "2026-10-01", to: "2026-10-31" }, "medido: 01/10 – 31/10");
  assert.deepEqual(presetRange("Amanhã", TODAY), { from: "2026-10-10", to: "2026-10-10" });
  assert.equal(presetRange("Todos os períodos", TODAY), null, "não há intervalo para converter");

  // The month's own length, not 30.
  assert.equal(presetRange("Este mês", new Date(2028, 1, 10)).to, "2028-02-29", "fevereiro bissexto");
  assert.equal(presetRange("Este mês", new Date(2027, 1, 10)).to, "2027-02-28");
  assert.equal(presetRange("Próximos 7 dias", new Date(2026, 11, 28)).to, "2027-01-03", "cruza o ano");
}

// Choosing a preset leaves a range behind, except "Todos os períodos".
{
  assert.deepEqual(pickPreset("Próximos 7 dias", TODAY), { from: "2026-10-09", to: "2026-10-15" });
  assert.equal(isRange(pickPreset("Hoje", TODAY)), true);
  assert.equal(pickPreset("Todos os períodos", TODAY), ALL_PERIODS, "este continua um nome");
  assert.equal(isRange(pickPreset("Todos os períodos", TODAY)), false);
}

// The trigger's text: dd/mm – dd/mm, one day alone, and never the year.
{
  assert.equal(rangeLabel({ from: "2026-10-15", to: "2026-10-22" }), "15/10 – 22/10");
  assert.equal(rangeLabel({ from: "2026-10-15", to: "2026-10-15" }), "15/10", "medido: o mesmo dia duas vezes");
  assert.equal(rangeLabel({ from: "2026-12-20", to: "2027-01-05" }), "20/12 – 05/01", "medido: sem ano, mesmo cruzando");
  assert.equal(rangeLabel({ from: "2026-10-09", to: "2026-10-09" }), "09/10", "zero à esquerda");
  assert.equal(periodLabel("Próximos 7 dias"), "Próximos 7 dias", "um nome continua o nome");
  assert.equal(periodLabel({ from: "2026-10-09", to: "2026-10-15" }), "09/10 – 15/10");
}

// Either order of picking gives the same range.
{
  assert.deepEqual(normalizeRange("2026-10-24", "2026-10-28"), { from: "2026-10-24", to: "2026-10-28" });
  assert.deepEqual(normalizeRange("2026-10-28", "2026-10-24"), { from: "2026-10-24", to: "2026-10-28" }, "medido: 28 e depois 24 dá 24/10 – 28/10");
  assert.deepEqual(normalizeRange("2026-10-15", "2026-10-15"), { from: "2026-10-15", to: "2026-10-15" });
}

// Which period holds an appointment: both ends count, and a preset still works as it did.
{
  const r = { from: "2026-10-15", to: "2026-10-22" };
  assert.equal(inPeriod("2026-10-15T00:00", r), true, "o primeiro dia entra");
  assert.equal(inPeriod("2026-10-22T23:59", r), true, "o último dia entra, a qualquer hora");
  assert.equal(inPeriod("2026-10-18T09:00", r), true);
  assert.equal(inPeriod("2026-10-14T23:59", r), false);
  assert.equal(inPeriod("2026-10-23T00:00", r), false);
  assert.equal(inPeriod("2026-10-09T09:00", "Hoje", TODAY), true, "preset segue pelo caminho antigo");
  assert.equal(inPeriod("2020-01-01T09:00", "Todos os períodos", TODAY), true);
  assert.equal(inPeriod("2026-10-10T09:00", "Hoje", TODAY), false);
}

// Picking: the first click starts, the second ends, a third starts again.
{
  const first = pickDay(null, "2026-10-15");
  assert.deepEqual(first, { pending: { start: "2026-10-15", hover: null }, commit: null }, "o primeiro clique não muda o filtro");

  const second = pickDay(first.pending, "2026-10-22");
  assert.deepEqual(second, { pending: null, commit: { from: "2026-10-15", to: "2026-10-22" } });

  const back = pickDay({ start: "2026-10-28", hover: null }, "2026-10-24");
  assert.deepEqual(back.commit, { from: "2026-10-24", to: "2026-10-28" }, "fechar para trás normaliza");

  const same = pickDay({ start: "2026-10-15", hover: null }, "2026-10-15");
  assert.deepEqual(same.commit, { from: "2026-10-15", to: "2026-10-15" }, "o mesmo dia é um intervalo de um dia");

  const third = pickDay(second.pending, "2026-10-28");
  assert.deepEqual(third.pending, { start: "2026-10-28", hover: null }, "depois de fechar, o clique seguinte recomeça");
  assert.equal(third.commit, null, "e não mexe no filtro até o segundo");
}

// What is drawn, against the cells measured on the original.
{
  const flags = (days, shown) => days.map((d) => ({ d, ...cellFlags(d, shown) }));
  const day = (n, m = 10) => `2026-${String(m).padStart(2, "0")}-${String(n).padStart(2, "0")}`;

  // Committed 15–22: a band across, the ends marked, the days outside left alone.
  const committed = shownRange({ from: day(15), to: day(22) }, null);
  const [d14, d15, d18, d22, d23] = flags([day(14), day(15), day(18), day(22), day(23)], committed);
  assert.deepEqual([d14.inRange, d14.start, d14.end, d14.selected], [false, false, false, false]);
  assert.deepEqual([d15.inRange, d15.start, d15.end, d15.selected], [true, true, false, true], "medido: 15 is-inrange + is-rstart");
  assert.deepEqual([d18.inRange, d18.start, d18.end, d18.selected], [true, false, false, false], "dia de dentro: só a faixa");
  assert.deepEqual([d22.inRange, d22.start, d22.end, d22.selected], [true, false, true, true], "medido: 22 is-inrange + is-rend");
  assert.deepEqual([d23.inRange, d23.start, d23.end, d23.selected], [false, false, false, false]);

  // A lone start: only the start, no band, no end (measured: "28:is-rstart").
  const lone = shownRange({ from: day(15), to: day(22) }, { start: day(28), hover: null });
  assert.equal(lone.lone, true);
  const [l28, l29, l15] = flags([day(28), day(29), day(15)], lone);
  assert.deepEqual([l28.inRange, l28.start, l28.end, l28.selected], [false, true, false, true]);
  assert.deepEqual([l29.inRange, l15.inRange], [false, false], "o intervalo antigo some enquanto se escolhe o novo");

  // Hovering forward previews the band from the start to the pointer.
  const ahead = shownRange(null, { start: day(28), hover: day(3, 11) });
  assert.deepEqual([ahead.from, ahead.to], [day(28), day(3, 11)]);
  const fwd = flags([day(28), day(31), day(3, 11)], ahead);
  assert.deepEqual([fwd[0].start, fwd[0].end], [true, false], "medido: Out28 is-rstart");
  assert.deepEqual([fwd[1].inRange, fwd[1].selected], [true, false]);
  assert.deepEqual([fwd[2].end, fwd[2].selected], [true, true], "medido: Nov3 is-rend, botão marcado");

  // Hovering BEFORE the start swaps the ends: the pointer's day becomes the start.
  const behind = shownRange(null, { start: day(28), hover: day(24) });
  const bwd = flags([day(24), day(26), day(28)], behind);
  assert.deepEqual([bwd[0].start, bwd[0].end], [true, false], "medido: Out24 vira is-rstart");
  assert.deepEqual([bwd[2].start, bwd[2].end], [false, true], "medido: Out28 vira is-rend");
  assert.equal(bwd[1].inRange, true);

  // Hovering the start itself is still only the start.
  assert.equal(shownRange(null, { start: day(28), hover: day(28) }).lone, true);

  assert.equal(shownRange(null, null), null, "nada escolhido, nada desenhado");
  assert.deepEqual(cellFlags(day(15), null), { inRange: false, start: false, end: false, selected: false });
}

// The picker opens on the range's own month; with none, on the current one.
{
  assert.deepEqual(monthToShow({ from: "2026-12-20", to: "2027-01-05" }, TODAY), new Date(2026, 11, 1), "medido: abre no mês do início");
  assert.deepEqual(monthToShow(null, TODAY), new Date(2026, 9, 1));
}

// The reports open on the last 30 days, ending today and counting it.
{
  assert.deepEqual(lastDays(30, TODAY), { from: "2026-09-10", to: "2026-10-09" }, "medido: o Consolidado abre em 10/09 – 09/10");
  assert.equal(rangeLabel(lastDays(30, TODAY)), "10/09 – 09/10");
  assert.deepEqual(lastDays(1, TODAY), { from: "2026-10-09", to: "2026-10-09" }, "um dia é só hoje");
  assert.equal(lastDays(30, new Date(2026, 2, 5)).from, "2026-02-04", "volta por cima do fim do mês");

  // 30 days inclusive is exactly the 30 cells the original paints as in-range.
  const days = [];
  for (let d = new Date(2026, 8, 10); d <= new Date(2026, 9, 9); d.setDate(d.getDate() + 1)) days.push(1);
  assert.equal(days.length, 30);
}

// The long form carries the year; a name stays a name; two periods compare by what they cover.
{
  assert.equal(rangeLongLabel({ from: "2026-09-10", to: "2026-10-09" }), "10/09/2026 – 09/10/2026");
  assert.equal(rangeLongLabel({ from: "2026-10-09", to: "2026-10-09" }), "09/10/2026");
  assert.equal(periodLongLabel("Todos os períodos"), "Todos os períodos");
  assert.equal(periodKey({ from: "2026-10-15", to: "2026-10-22" }), periodKey({ from: "2026-10-15", to: "2026-10-22" }), "dois objetos iguais, a mesma chave");
  assert.notEqual(periodKey({ from: "2026-10-15", to: "2026-10-22" }), periodKey({ from: "2026-10-15", to: "2026-10-23" }));
  assert.notEqual(periodKey("Hoje"), periodKey({ from: "2026-10-09", to: "2026-10-09" }), "o nome e o intervalo equivalente não são o mesmo estado");
}

console.log("range ok");
