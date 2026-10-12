// node src/lib/seiri/sheets.test.mjs — reading uploaded spreadsheets (.csv, .xlsx), without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { fromXlsx, openZip } = await import("./xlsxRead.ts");
const { toXlsx } = await import("./xlsx.ts");
const { emailsFromRows, addEmails, splitEmails } = await import("./inviteSheet.ts");
const { sheetRows, sheetProblem, excelDate, UnsupportedSheet } = await import("./sheetFile.ts");

const bytes = (b64) => new Uint8Array(Buffer.from(b64, "base64"));
const encode = (text) => new TextEncoder().encode(text);

// Made by openpyxl, the library the original's server writes with: every part deflated, inline strings, an
// absolute relationship target, attributes in its own order, a second sheet that must not be read, a cell
// in column D with nothing before it, and a number.
const OPENPYXL = bytes(
  "UEsDBBQAAAAIAEGKTF1Gx01IlQAAAM0AAAAQAAAAZG9jUHJvcHMvYXBwLnhtbE3PTQvCMAwG4L9SdreZih6kDkQ9ip68zy51hbYpbYT67+0EP255ecgboi6JIia2mEXxLuRtMzLHDUDWI/o+y8qhiqHke64x3YGMsRoPpB8eA8OibdeAhTEMOMzit7Dp1C5GZ3XPlkJ3sjpRJsPiWDQ6sScfq9wcChDneiU+ixNLOZcrBf+LU8sVU57mym/8ZAW/B7oXUEsDBBQAAAAIAEGKTF3GKG8C6gAAAMsBAAARAAAAZG9jUHJvcHMvY29yZS54bWylkU1rwzAMhv9K8T2RnUAZxs1lY6cWBits7GZstQ2LP7A1kv77JVmbbmy3Ha330SMJKxOlCQmfUoiYqMW8GlznszRxw05EUQJkc0KnczkSfgwPITlN4zMdIWrzro8IFedrcEjaatIwCYu4GNlFac2ijB+pmwXWAHbo0FMGUQq4sYTJ5T8b5mQhh9wuVN/3ZV/P3LiRgNfd9nlevmh9Ju0NskZZI01CTSE100XxPHQKvhXVZfZXAe1qnCDpHHHDrslLff+wf2RNxat1IXghqn3FpbiTvH6bXD/6b0IXbHto/2G8ChoFv/6t+QRQSwMEFAAAAAgAQYpMXZlcnCMQBgAAnCcAABMAAAB4bC90aGVtZS90aGVtZTEueG1s7Vpbc9o4FH7vr9B4Z/ZtC8Y2gba0E3Npdtu0mYTtTh+FEViNbHlkkYR/v0c2EMuWDe2STbqbPAQs6fvORUfn6Dh58+4uYuiGiJTyeGDZL9vWu7cv3uBXMiQRQTAZp6/wwAqlTF61WmkAwzh9yRMSw9yCiwhLeBTL1lzgWxovI9bqtNvdVoRpbKEYR2RgfV4saEDQVFFab18gtOUfM/gVy1SNZaMBE1dBJrmItPL5bMX82t4+Zc/pOh0ygW4wG1ggf85vp+ROWojhVMLEwGpnP1Zrx9HSSICCyX2UBbpJ9qPTFQgyDTs6nVjOdnz2xO2fjMradDRtGuDj8Xg4tsvSi3AcBOBRu57CnfRsv6RBCbSjadBk2PbarpGmqo1TT9P3fd/rm2icCo1bT9Nrd93TjonGrdB4Db7xT4fDronGq9B062kmJ/2ua6TpFmhCRuPrehIVteVA0yAAWHB21szSA5ZeKfp1lBrZHbvdQVzwWO45iRH+xsUE1mnSGZY0RnKdkAUOADfE0UxQfK9BtorgwpLSXJDWzym1UBoImsiB9UeCIcXcr/31l7vJpDN6nX06zmuUf2mrAaftu5vPk/xz6OSfp5PXTULOcLwsCfH7I1thhyduOxNyOhxnQnzP9vaRpSUyz+/5CutOPGcfVpawXc/P5J6MciO73fZYffZPR24j16nAsyLXlEYkRZ/ILbrkETi1SQ0yEz8InYaYalAcAqQJMZahhvi0xqwR4BN9t74IyN+NiPerb5o9V6FYSdqE+BBGGuKcc+Zz0Wz7B6VG0fZVvNyjl1gVAZcY3zSqNSzF1niVwPGtnDwdExLNlAsGQYaXJCYSqTl+TUgT/iul2v6c00DwlC8k+kqRj2mzI6d0Js3oMxrBRq8bdYdo0jx6/gX5nDUKHJEbHQJnG7NGIYRpu/AerySOmq3CEStCPmIZNhpytRaBtnGphGBaEsbReE7StBH8Waw1kz5gyOzNkXXO1pEOEZJeN0I+Ys6LkBG/HoY4SprtonFYBP2eXsNJweiCy2b9uH6G1TNsLI73R9QXSuQPJqc/6TI0B6OaWQm9hFZqn6qHND6oHjIKBfG5Hj7lengKN5bGvFCugnsB/9HaN8Kr+ILAOX8ufc+l77n0PaHStzcjfWfB04tb3kZuW8T7rjHa1zQuKGNXcs3Ix1SvkynYOZ/A7P1oPp7x7frZJISvmlktIxaQS4GzQSS4/IvK8CrECehkWyUJy1TTZTeKEp5CG27pU/VKldflr7kouDxb5OmvoXQ+LM/5PF/ntM0LM0O3ckvqtpS+tSY4SvSxzHBOHssMO2c8kh22d6AdNfv2XXbkI6UwU5dDuBpCvgNtup3cOjiemJG5CtNSkG/D+enFeBriOdkEuX2YV23n2NHR++fBUbCj7zyWHceI8qIh7qGGmM/DQ4d5e1+YZ5XGUDQUbWysJCxGt2C41/EsFOBkYC2gB4OvUQLyUlVgMVvGAyuQonxMjEXocOeXXF/j0ZLj26ZltW6vKXcZbSJSOcJpmBNnq8reZbHBVR3PVVvysL5qPbQVTs/+Wa3InwwRThYLEkhjlBemSqLzGVO+5ytJxFU4v0UzthKXGLzj5sdxTlO4Ena2DwIyubs5qXplMWem8t8tDAksW4hZEuJNXe3V55ucrnoidvqXd8Fg8v1wyUcP5TvnX/RdQ65+9t3j+m6TO0hMnHnFEQF0RQIjlRwGFhcy5FDukpAGEwHNlMlE8AKCZKYcgJj6C73yDLkpFc6tPjl/RSyDhk5e0iUSFIqwDAUhF3Lj7++TaneM1/osgW2EVDJk1RfKQ4nBPTNyQ9hUJfOu2iYLhdviVM27Gr4mYEvDem6dLSf/217UPbQXPUbzo5ngHrOHc5t6uMJFrP9Y1h75Mt85cNs63gNe5hMsQ6R+wX2KioARq2K+uq9P+SWcO7R78YEgm/zW26T23eAMfNSrWqVkKxE/Swd8H5IGY4xb9DRfjxRiraaxrcbaMQx5gFjzDKFmON+HRZoaM9WLrDmNCm9B1UDlP9vUDWj2DTQckQVeMZm2NqPkTgo83P7vDbDCxI7h7Yu/AVBLAwQUAAAACABBikxdwAmDMtQBAACnBAAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbKVUUW/aMBD+K1YeeBumFBgqSdRSWm3SKlVF3Z5Nckms2r7MPqD797NTCKA1edlT7s73ffd9Vs7xHu2bqwCIvWtlXBJVRPUN5y6rQAs3xBqMPynQakE+tSV3tQWRNyCt+Hg0mnEtpInSuKk92zTGLSlp4Nkyt9Va2D9LULhPoqvoWHiRZUVNgadxLUpYA73WHuBT3vLkUoNxEg2zUCTR3dXNat4gmo6fEvbuLGbBzAbxLSTf8yQaBU2gIKNAIfxnB/egVGDySn4fSKPT0IA8j4/0j41/L28jHNyj+iVzqpLIi8mhEFtFL7j/BgdP05PElSCRxhb3zAazaZyFIIz0jdKES1qT9XXpJ1Hqr1yqmJOXEAo8OwCWXQCDGi77uR/WThy3E8cdBMKIW3gHXSscZqiHG/vZ+C70nRHsh9SiR8L1UcLyuoNkDZrBl3+dX9BMWieTDpql3Rq8fTh5+cxIL5gNhK4X7FGqCh0bKFo8PQxKWvTImraypv91wV3ocME5MIM77FExO6pYzTp4MmHVhY4etnnrad6whc3epZNxzHfn3fzsBw8L/CRsKY1jCgoPGg2/ek/2YyM+EsK6WfgNEqFuwso/JGBDgz8vEKlNwka2b1P6F1BLAwQUAAAACABBikxdF96HvEcBAAAnAgAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQyLnhtbE1S226DMAz9FZQPIHTSLqoAres0bQ+TqlbbnlMwEDWJWeKW7u/nQG8PUXx8OT52kg/od6EDoORojQuF6Ij6uZSh6sCqkGIPjiMNequIoW9l6D2oeiyyRt5l2YO0SjtR5qNv5csc92S0g5VPwt5a5f9ewOBQiJk4O9a67Wh0yDLvVQsboK+eCxjKC0+tLbig0SUemkIsZvPFVDFmfGsYwo2dxGG2iLsIPupCZFETGKgoUii+DrAEYyITK/k9kYpr01h5a5/p38b5Wd5WBVii+dE1dYV4EkkNjdobWuPwDqeZ7q8SXxWpMvc4JD4OW+ZVNGJLTtQuLmlDnv2aO1HpFKY1HCA14J/hCLY3mFZoc0msKubIig/znUVODeICP5VvtQuJgYa5s/SRZfhJ0QQI+3HhWyRCO5odPyT4mMDxBpEuIG7k8jfKf1BLAwQUAAAACABBikxd0gXxRlICAABHCgAADQAAAHhsL3N0eWxlcy54bWzdVtuK2zAQ/RXjD6iTmJq4JHmoIVBoy8LuQ1/lWE4EuriyvCT9+mok57ab41L6VpvgmTk6M2ekMc6qdyfJnw+cu+SopO7X6cG57lOW9bsDV6z/YDquPdIaq5jzrt1nfWc5a3oiKZktZrMiU0zodLPSg9oq1yc7M2i3Tmdpkm1WrdHX0DyNAb+WKZ68MrlOKyZFbUVczJSQpxhfhMjOSGMT59VwolOo/xUXzEeXpI65lNDGhmgWy4RH7xMLKS8qFmkMbFYdc45bvfVOJIXoe2y0X06dV7G37DRffExvGOHhy9TGNtzetRtDm5XkrSOGFftDMJzp6FEb54wiqxFsbzSLSs600fC5d1zKZzqvH+1dgWObxI3/0oQ9p47Pplc1mjHN6FCB23Qx+b/n7cSrcZ8H35AO/s/BOP5keSuOwT+2bwRcagcld+Uv0YRGZZ1+pxGUNznqQUgn9OgdRNNw/b47n9+x2g/5XQG/quEtG6R7uYDr9Gp/440YVHlZ9USNjauu9lc6ynlxnVNfTOiGH3lTja7d18FMvOHLjldgvIW24QIQZEUQQATCWlAGZEUerPU/9rXEfUUQKlw+hpaYtcSsyHsIVeGGtQCr9BdouSzzvCjg9lbVYxkV3MOioB9ICBUSB9aian+78xMDMDE2f5gNeMqTYwNbnhhR2PLEzhME9pA4ZQkGANYiDjwUOFEkAtSiUQOsPKdzhgrhaz4BlSWEaEjB9BYF2qiCbnBe8CXK87IEEIFARp5DiF7YCQjKICEQyvP4IX3zPcvO37ns+tdx8xtQSwMEFAAAAAgAQYpMXbdH64rAAAAAFgIAAAsAAABfcmVscy8ucmVsc52SS24CMQxArxJlX0ypxAIxrNiwQ4gLuInno5nEkWPE9PaN2MAgaBFL/56eLa8PNKB2HHPbpWzGMMRc2VY1rQCyaylgnnGiWCo1S0AtoTSQ0PXYECzm8yXILcNu1rdMc/xJ9AqR67pztGV3ChT1Afiuw5ojSkNa2XGAM0v/zdzPCtSana+s7PynNfCmzPP1IJCiR0VwLPSRpEyLdpSvPp7dvqTzpWNitHjf6P/z0KgUPfm/nTClidLXRQkmb7D5BVBLAwQUAAAACABBikxdqVBmpEQBAABpAgAADwAAAHhsL3dvcmtib29rLnhtbI2R3U7DMAyFX6XKA9CugklMKzcbP5MQIIZ2n7Xuai2JK8f7YU9P0qpQCQlxlfrY+XqOMz8R77dE++RsjfMzLlQj0s7S1JcNWO2vqAUXejWx1RJK3qVU11jCksqDBSdpnmXTlMFoQXK+wdarnvYflm8ZdOUbALGmR1mNTt3NB2dvnKTjigTK+KeoRmWDcPI/A7FMjuhxiwbls1DdtwGVWHRo8QJVoTKV+IZOT8R4ISfarEsmYwo16RsbYMHyl7yONj/01neK6O17zFyoaRaANbKXbqLj62DyCGG4rw5CD2gEeKkFHpkOLbpdhwkx0lGObhXDmThtoVALg2HR4KOLoK6q3pEE1CgfzzA0eFX10DHg/iysR7fzP27nvaXBRwU1OqheAsfHRthKGZ4kHp2P/PpmchvSH4xZBO3VPZOuvoMNr3L3BVBLAwQUAAAACABBikxdq15yLrQAAACNAgAAGgAAAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzxZJNCoMwEEavEnIAR23poqirbtwWLxB0/MHEhMyU6u0rulChi26kq/BNyPseTJInasWdHajtHInR6IFS2TK7OwCVLRpFgXU4zDe19UbxHH0DTpW9ahDiMLyB3zNkluyZopgc/kK0dd2V+LDly+DAX8Dwtr6nFpGlKJRvkFMJo97GBMsRBTNZirxKpc+rSAr4t1F8MIrPNCKeNNKms+ZD/+XMfp7f4la/xHV4XMt1kYDD78s+UEsDBBQAAAAIAEGKTF2l4RtYHwEAAGAEAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbMVUy07DMBD8lcjXKnbpgQNqeqFcoQd+wCSbxopf8m5L+vdsEloJVFqqIHGJFe/szHjH8vL1EAGzzlmPhWiI4oNSWDbgNMoQwXOlDslp4t+0VVGXrd6CWszn96oMnsBTTj2HWC3XUOudpeyp4200wRcigUWRPY7AXqsQOkZrSk1cV3tffVPJPxUkdw4YbEzEGQNEps5KDKUfFY6NL3tIyVSQbXSiZ+0YpjqrkA4WUF7mOOMy1LUpoQrlznGLxJhAV9gAkLNyJJ1dkSYeMozfu8kGBpqLigzdpBCRU0twu94xlr47j0wEicyVQ54kmXvyCaFPvILqt+I84feQ2iETVMMyfcxfcz7x32pk8Z9G3kJo//rC96t02viTATU8LKsPUEsBAhQAFAAAAAgAQYpMXUbHTUiVAAAAzQAAABAAAAAAAAAAAAAAAIABAAAAAGRvY1Byb3BzL2FwcC54bWxQSwECFAAUAAAACABBikxdxihvAuoAAADLAQAAEQAAAAAAAAAAAAAAgAHDAAAAZG9jUHJvcHMvY29yZS54bWxQSwECFAAUAAAACABBikxdmVycIxAGAACcJwAAEwAAAAAAAAAAAAAAgAHcAQAAeGwvdGhlbWUvdGhlbWUxLnhtbFBLAQIUABQAAAAIAEGKTF3ACYMy1AEAAKcEAAAYAAAAAAAAAAAAAAC2gR0IAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWxQSwECFAAUAAAACABBikxdF96HvEcBAAAnAgAAGAAAAAAAAAAAAAAAtoEnCgAAeGwvd29ya3NoZWV0cy9zaGVldDIueG1sUEsBAhQAFAAAAAgAQYpMXdIF8UZSAgAARwoAAA0AAAAAAAAAAAAAAIABpAsAAHhsL3N0eWxlcy54bWxQSwECFAAUAAAACABBikxdt0frisAAAAAWAgAACwAAAAAAAAAAAAAAgAEhDgAAX3JlbHMvLnJlbHNQSwECFAAUAAAACABBikxdqVBmpEQBAABpAgAADwAAAAAAAAAAAAAAgAEKDwAAeGwvd29ya2Jvb2sueG1sUEsBAhQAFAAAAAgAQYpMXateci60AAAAjQIAABoAAAAAAAAAAAAAAIABexAAAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzUEsBAhQAFAAAAAgAQYpMXaXhG1gfAQAAYAQAABMAAAAAAAAAAAAAAIABZxEAAFtDb250ZW50X1R5cGVzXS54bWxQSwUGAAAAAAoACgCEAgAAtxIAAAAA",
);

// Made by hand the way Excel lays a workbook out: shared strings (one in two rich-text runs, one with a
// phonetic run), booleans, a self-closing cell, a missing row, and the workbook listing sheet2.xml first.
const BY_HAND = bytes(
  "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",
);

/**
 * A stored zip with what real writers add and ours does not: an extra field after each local name, a comment on each
 * directory entry, and an optional lie about the unzipped size.
 */
function zipBy(entries, { claim } = {}) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const [name, text, extra = 5, comment = 3] of entries) {
    const n = encode(name);
    const data = encode(text);
    const l = new Uint8Array(30 + n.length + extra + data.length);
    const lv = new DataView(l.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, n.length, true);
    lv.setUint16(28, extra, true);
    l.set(n, 30);
    l.fill(0x58, 30 + n.length, 30 + n.length + extra);
    l.set(data, 30 + n.length + extra);
    const c = new Uint8Array(46 + n.length + comment);
    const cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, claim ?? data.length, true);
    cv.setUint16(28, n.length, true);
    cv.setUint16(32, comment, true);
    cv.setUint32(42, offset, true);
    c.set(n, 46);
    c.fill(0x59, 46 + n.length);
    local.push(l);
    central.push(c);
    offset += l.length;
  }
  const size = central.reduce((t, c) => t + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, size, true);
  ev.setUint32(16, offset, true);
  return Uint8Array.from([...local, ...central, end].flatMap((a) => [...a]));
}

const SHEET = (rows) => `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`;

// The zip's own bookkeeping: an extra field after a local name and a comment on a directory entry shift where the
// next thing starts, and a part that claims to unzip to a huge size is refused before it is read.
{
  const sheet = SHEET('<row r="1"><c r="A1" t="inlineStr"><is><t>a@x.co</t></is></c></row>');
  const rows = await fromXlsx(
    zipBy([
      ["xl/other.xml", "<x/>"],
      // An extra field longer than the XML's closing tags, so reading from the wrong byte cuts the cell off.
      ["xl/worksheets/sheet1.xml", sheet, 40],
    ]),
  );
  assert.deepEqual(rows, [["a@x.co"]], "lê a segunda parte depois de extra e comentário da primeira");
  await assert.rejects(() => fromXlsx(zipBy([["xl/worksheets/sheet1.xml", sheet]], { claim: 40 * 1024 * 1024 })), /grande/);
}

// A workbook-less file falls back to sheet1; character references (decimal and hex) and entities become text.
{
  const rows = await fromXlsx(
    zipBy([["xl/worksheets/sheet1.xml", SHEET('<row r="1"><c r="A1" t="inlineStr"><is><t>&#65;&#x42;&amp;&lt;&gt;&quot;&apos;</t></is></c></row>')]]),
  );
  assert.deepEqual(rows, [["AB&<>\"'"]]);
}

// An .xlsx from openpyxl: first sheet only, accents and markup intact, gaps filled with "".
{
  assert.deepEqual(await fromXlsx(OPENPYXL), [
    ["email", "nome"],
    ["ana@exemplo.com.br", "Ana Lima"],
    ["", "Sem e-mail"],
    ["Bruno@Exemplo.com", "Bruno & Filhos <ME>"],
    ["ana@exemplo.com.br", "Ana de novo"],
    ["", "", "", "carla@exemplo.com"],
    [],
    ["42"],
  ]);
}

// The workbook says which sheet is first, not the file's name; shared strings, runs and cell types read.
{
  assert.deepEqual(await fromXlsx(BY_HAND), [
    ["E-mail", "Nome"],
    ["dora@exemplo.com", "Dora", "7"],
    ["edu@exemplo.com.br"],
    [],
    ["", "fabi@exemplo.com", "TRUE", "x&y", ""],
  ]);
}

// What this app writes reads back, so a filled template survives the round trip.
{
  const sheet = {
    name: "Clientes",
    rows: [
      ["email", "nome"],
      ["ana@exemplo.com.br", "Ana"],
      [null, "Só nome"],
      ["n", 4],
    ],
  };
  assert.deepEqual(await fromXlsx(toXlsx(sheet)), [
    ["email", "nome"],
    ["ana@exemplo.com.br", "Ana"],
    ["", "Só nome"],
    ["n", "4"],
  ]);
}

// Anything that is not a zip, or a zip without a sheet, says so instead of returning nothing.
{
  await assert.rejects(() => fromXlsx(encode("isto é um csv, não um zip")), /zip/);
  await assert.rejects(() => fromXlsx(new Uint8Array()), /zip/);
  const text = toXlsx({ name: "S", rows: [["x"]] });
  assert.ok(openZip(text).has("xl/worksheets/sheet1.xml"), "o zip abre pelo nome das partes");
}

// By extension: csv (BOM, ";" or ","), xlsx; .xls and the rest are named as unsupported.
{
  assert.deepEqual(await sheetRows("convite.CSV", encode("﻿email;nome\r\nana@exemplo.com.br;Ana\r\n")), [
    ["email", "nome"],
    ["ana@exemplo.com.br", "Ana"],
  ]);
  assert.deepEqual(await sheetRows("a.csv", encode('email,nome\n"b@exemplo.com","Silva, B"\n')), [
    ["email", "nome"],
    ["b@exemplo.com", "Silva, B"],
  ]);
  assert.equal((await sheetRows("modelo.xlsx", OPENPYXL)).length, 8);
  await assert.rejects(
    () => sheetRows("velho.xls", encode("x")),
    (e) => e instanceof UnsupportedSheet && e.message === "xls",
  );
  await assert.rejects(
    () => sheetRows("sem-extensao", encode("x")),
    (e) => e instanceof UnsupportedSheet && e.message === "",
  );
  await assert.rejects(
    () => sheetRows("notas.TXT", encode("x")),
    (e) => e instanceof UnsupportedSheet && e.message === "txt",
    "a extensão que veio, em minúsculas",
  );
}

// The recipients: the first e-mail-looking cell of each row, once each, whatever the column or the header.
{
  assert.deepEqual(
    emailsFromRows(await fromXlsx(OPENPYXL)),
    ["ana@exemplo.com.br", "Bruno@Exemplo.com", "carla@exemplo.com"],
    "sem o cabeçalho, o repetido e a aba de fora",
  );
  assert.deepEqual(emailsFromRows(await fromXlsx(BY_HAND)), ["dora@exemplo.com", "edu@exemplo.com.br", "fabi@exemplo.com"]);
  assert.deepEqual(
    emailsFromRows([
      ["Nome", "E-mail"],
      ["Ana", " Ana@Exemplo.com "],
      ["Ana", "ANA@exemplo.com"],
    ]),
    ["Ana@Exemplo.com"],
    "espaços saem, a caixa não cria repetido e vale a primeira grafia",
  );
  assert.deepEqual(emailsFromRows([["não é e-mail", "a@b"], ["a@b.c d@e.fg"], ["x@y.zw;z@y.zw"]]), [], "sem ponto, com espaço ou lista numa célula: não");
  assert.deepEqual(emailsFromRows([]), []);
  assert.deepEqual(emailsFromRows([["a@exemplo.com", "b@exemplo.com"]]), ["a@exemplo.com"], "uma linha, um destinatário");
}

// Adding to what is already typed: kept as is, none twice, and the count says what was new.
{
  assert.deepEqual(splitEmails("a@x.co, b@x.co;\n\n c@x.co "), ["a@x.co", "b@x.co", "c@x.co"]);
  assert.deepEqual(addEmails("", ["a@x.co", "b@x.co"]), { text: "a@x.co\nb@x.co", added: 2, repeated: 0 });
  assert.deepEqual(
    addEmails("A@x.co\nz@x.co", ["a@x.co", "b@x.co"]),
    { text: "A@x.co\nz@x.co\nb@x.co", added: 1, repeated: 1 },
    "o que já estava, em outra caixa, não entra de novo",
  );
  assert.deepEqual(addEmails("a@x.co", []), { text: "a@x.co", added: 0, repeated: 0 });
  assert.deepEqual(addEmails("a@x.co, b@x.co", ["c@x.co"]).text, "a@x.co\nb@x.co\nc@x.co", "a lista vira uma por linha");
}

// What the person is told when a file cannot be read, and the day counts an .xlsx keeps dates as.
{
  assert.match(sheetProblem(new UnsupportedSheet("xls")), /\.xls .*\.xlsx ou \.csv/);
  assert.equal(sheetProblem(new UnsupportedSheet("txt")), "Use uma planilha .csv ou .xlsx.");
  assert.equal(sheetProblem(new UnsupportedSheet("")), "Use uma planilha .csv ou .xlsx.");
  assert.equal(sheetProblem(new Error("zip")), "Não foi possível ler a planilha.");
  assert.equal(sheetProblem("x"), "Não foi possível ler a planilha.");

  assert.equal(excelDate("36526"), "01/01/2000", "o dia 1 do ano 2000");
  assert.equal(excelDate("32874"), "01/01/1990");
  assert.equal(excelDate("45000"), "15/03/2023");
  assert.equal(excelDate("10000"), "18/05/1927", "o primeiro valor de cinco dígitos");
  assert.equal(excelDate("99999"), "13/10/2173", "e o último");
  for (const text of ["1990", "01/01/1990", "1990-01-01", "01011990", "123456", "", "12 345", "36526.5", " 36526"]) {
    assert.equal(excelDate(text), text, `"${text}" já é texto, fica como está`);
  }
}

console.log("sheets ok");
