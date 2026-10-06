// node src/lib/seiri/csv.test.mjs — the CSV the export writes and the import reads, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

// `download` is left out: it is DOM glue (a Blob, an <a>, a click) with no logic of its own to break.
const { toCsv, parseCsv, stamp } = await import("./csv.ts");

const BOM = "﻿";

// The file Excel in pt-BR opens: a BOM, semicolons, CRLF.
{
  const csv = toCsv(["Nome", "E-mail"], [["Ana", "ana@exemplo.com.br"]]);
  assert.equal(csv, `${BOM}Nome;E-mail\r\nAna;ana@exemplo.com.br`);
  assert.ok(csv.startsWith(BOM), "the BOM is what makes Excel read the accents");
  assert.ok(csv.includes("\r\n"), "lines end CRLF");

  assert.equal(toCsv(["Nome"], []), `${BOM}Nome`, "headers alone, no trailing newline");
  assert.equal(toCsv(["A", "B"], [[1, 2]]), `${BOM}A;B\r\n1;2`, "numbers are written as they print");
}

// Quoting: only cells that would break the format are wrapped.
{
  const cell = (value) => toCsv(["h"], [[value]]).split("\r\n")[1];

  assert.equal(cell("Ana"), "Ana", "a plain cell is not quoted");
  assert.equal(cell("Ana; Lima"), '"Ana; Lima"', "a semicolon would split the cell");
  assert.equal(cell("Ana, Lima"), '"Ana, Lima"', "a comma, for readers that split on it");
  assert.equal(cell("linha 1\nlinha 2"), '"linha 1\nlinha 2"', "a newline would split the row");
  assert.equal(cell('Ana "A" Lima'), '"Ana ""A"" Lima"', "quotes are doubled and the cell wrapped");
  assert.equal(cell(""), "", "an empty cell stays empty");
  assert.equal(cell("Configurações"), "Configurações", "accents need no quoting");
}

// Reading a file back.
{
  assert.deepEqual(parseCsv("Nome;E-mail\r\nAna;ana@exemplo.com.br"), [
    ["Nome", "E-mail"],
    ["Ana", "ana@exemplo.com.br"],
  ]);

  // The leading BOM never reaches a cell. parseCsv strips it outright, and `trim()` would have
  // anyway — JS counts ﻿ as whitespace — so this passes with the strip removed.
  assert.deepEqual(
    parseCsv(`${BOM}Nome;E-mail\r\nAna;ana@exemplo.com.br`),
    [
      ["Nome", "E-mail"],
      ["Ana", "ana@exemplo.com.br"],
    ],
    "a BOM from Excel does not land in the first header",
  );

  assert.deepEqual(
    parseCsv("Nome;E-mail\nAna;ana@exemplo.com.br"),
    [
      ["Nome", "E-mail"],
      ["Ana", "ana@exemplo.com.br"],
    ],
    "bare LF works too",
  );

  assert.deepEqual(parseCsv("a;b"), [["a", "b"]], "a file with no newline at all");
  assert.deepEqual(parseCsv("a;b\r\n"), [["a", "b"]], "a trailing newline does not add an empty row");
  assert.deepEqual(parseCsv(""), [], "an empty file");
  assert.deepEqual(parseCsv("\n\n"), [], "blank lines are dropped");
  assert.deepEqual(
    parseCsv("a;b\n\nc;d"),
    [
      ["a", "b"],
      ["c", "d"],
    ],
    "a blank line between rows is skipped, not kept as an empty row",
  );
}

// The separator is whichever the first line uses more of.
{
  assert.deepEqual(
    parseCsv("a,b,c\n1,2,3"),
    [
      ["a", "b", "c"],
      ["1", "2", "3"],
    ],
    "a comma file",
  );

  assert.deepEqual(
    parseCsv("a;b;c\n1;2;3"),
    [
      ["a", "b", "c"],
      ["1", "2", "3"],
    ],
    "a semicolon file",
  );

  // A tie goes to the semicolon, which is what the export itself writes.
  assert.deepEqual(parseCsv("a;b,c"), [["a", "b,c"]]);

  // The whole file is read with the first line's separator, so a comma inside a later cell stays put.
  assert.deepEqual(parseCsv("nome;obs\nAna;mora em Lima, Peru"), [
    ["nome", "obs"],
    ["Ana", "mora em Lima, Peru"],
  ]);
}

// Quoted cells survive the round trip.
{
  assert.deepEqual(parseCsv('nome;obs\n"Lima, Ana";"disse ""oi"""'), [
    ["nome", "obs"],
    ["Lima, Ana", 'disse "oi"'],
  ]);

  assert.deepEqual(parseCsv('a;"linha 1\nlinha 2";c'), [["a", "linha 1\nlinha 2", "c"]], "a newline inside quotes does not end the row");

  // What toCsv writes, parseCsv reads back unchanged — the property that matters for export then import.
  const rows = [
    ["Ana; Lima", 'disse "oi"', "Configurações"],
    ["linha 1\nlinha 2", "", "simples"],
  ];
  assert.deepEqual(parseCsv(toCsv(["a", "b", "c"], rows)), [["a", "b", "c"], ...rows]);
}

// Cells are trimmed, the way a hand-edited file arrives.
{
  assert.deepEqual(parseCsv("nome ; e-mail \n Ana ; ana@exemplo.com.br "), [
    ["nome", "e-mail"],
    ["Ana", "ana@exemplo.com.br"],
  ]);
}

// The file-name stamp.
{
  assert.match(stamp(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(stamp().length, 10);
}

console.log("csv ok");
