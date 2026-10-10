// node src/lib/seiri/xlsx.test.mjs — the .xlsx writer, without a browser. The files it writes were also opened
// with Python's zipfile and openpyxl (the library the original's server uses), which this cannot run.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { toXlsx, zip, crc32, columnLetters, sheetName, XLSX_TYPE } = await import("./xlsx.ts");

const decoder = new TextDecoder();
const encoder = new TextEncoder();

/** A reader for the stored-only zips this writes, strict enough to catch a wrong offset or checksum. */
function unzip(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i--)
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  assert.ok(eocd >= 0, "falta o fim do diretório central");
  const count = dv.getUint16(eocd + 10, true);
  const parts = {};
  let p = dv.getUint32(eocd + 16, true);
  for (let i = 0; i < count; i++) {
    assert.equal(dv.getUint32(p, true), 0x02014b50, "assinatura do diretório central");
    const crc = dv.getUint32(p + 16, true);
    const size = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true);
    const local = dv.getUint32(p + 42, true);
    const name = decoder.decode(bytes.slice(p + 46, p + 46 + nameLen));
    assert.equal(dv.getUint32(local, true), 0x04034b50, `assinatura local de ${name}`);
    assert.equal(dv.getUint16(local + 8, true), 0, "sem compressão");
    const data = bytes.slice(local + 30 + dv.getUint16(local + 26, true), local + 30 + dv.getUint16(local + 26, true) + size);
    assert.equal(crc32(data), crc, `CRC de ${name}`);
    // The local header repeats the directory's checksum, sizes and date, and readers that stream the file trust it.
    assert.equal(dv.getUint32(local + 14, true), crc, `CRC local de ${name}`);
    assert.equal(dv.getUint32(local + 18, true), size, `tamanho local de ${name}`);
    assert.equal(dv.getUint32(local + 22, true), size);
    assert.equal(dv.getUint16(local + 12, true), 0x21, `data fixa (01/01/1980) em ${name}`);
    assert.equal(dv.getUint16(p + 14, true), 0x21);
    parts[name] = decoder.decode(data);
    p += 46 + nameLen;
  }
  return parts;
}

// The checksum is the zip format's: its standard test vector.
{
  assert.equal(crc32(encoder.encode("123456789")), 0xcbf43926);
  assert.equal(crc32(new Uint8Array()), 0, "nada tem CRC zero");
}

// "A".."Z", then "AA".
{
  assert.equal(columnLetters(0), "A");
  assert.equal(columnLetters(25), "Z");
  assert.equal(columnLetters(26), "AA");
  assert.equal(columnLetters(27), "AB");
  assert.equal(columnLetters(51), "AZ");
  assert.equal(columnLetters(52), "BA");
  assert.equal(columnLetters(701), "ZZ");
  assert.equal(columnLetters(702), "AAA");
}

// Excel refuses a sheet name over 31 characters or with []:*?/\ in it.
{
  assert.equal(sheetName("Clientes"), "Clientes");
  assert.equal(sheetName("A".repeat(40)).length, 31);
  assert.equal(sheetName("a/b:c*d?e[f]g\\h"), "a b c d e f g h");
  assert.equal(sheetName("   "), "Sheet1", "um nome vazio cai no padrão");
}

// A zip round-trips: names, bytes, and the directory pointing at the right offsets.
{
  const files = [
    { name: "a.txt", data: encoder.encode("olá") },
    { name: "dir/b.xml", data: encoder.encode("<x/>") },
    { name: "vazio", data: new Uint8Array() },
  ];
  const parts = unzip(zip(files));
  assert.deepEqual(Object.keys(parts), ["a.txt", "dir/b.xml", "vazio"]);
  assert.equal(parts["a.txt"], "olá", "UTF-8 volta inteiro");
  assert.equal(parts["vazio"], "");
}

// The template the original serves: sheet "Clientes", email/nome, one example row, widths 34 and 28.
{
  const bytes = toXlsx({
    name: "Clientes",
    widths: [34, 28],
    rows: [
      ["email", "nome"],
      ["cliente@exemplo.com", "Nome do Cliente"],
    ],
  });
  const parts = unzip(bytes);

  assert.deepEqual(Object.keys(parts).sort(), [
    "[Content_Types].xml",
    "_rels/.rels",
    "xl/_rels/workbook.xml.rels",
    "xl/styles.xml",
    "xl/workbook.xml",
    "xl/worksheets/sheet1.xml",
  ]);
  assert.match(parts["xl/workbook.xml"], /<sheet name="Clientes" sheetId="1" r:id="rId1"\/>/);

  const sheet = parts["xl/worksheets/sheet1.xml"];
  assert.match(sheet, /<dimension ref="A1:B2"\/>/);
  assert.match(sheet, /<col min="1" max="1" width="34" customWidth="1"\/><col min="2" max="2" width="28" customWidth="1"\/>/, "as larguras do modelo");
  assert.match(sheet, /<c r="A1" t="inlineStr"><is><t xml:space="preserve">email<\/t><\/is><\/c>/);
  assert.match(sheet, /<c r="B2" t="inlineStr"><is><t xml:space="preserve">Nome do Cliente<\/t><\/is><\/c>/);
  assert.ok(!sheet.includes(' s="1"'), "o modelo não tem estilo no cabeçalho");
}

// The export's header is drawn with the style, and only the first row.
{
  const parts = unzip(
    toXlsx({
      name: "Sheet1",
      styledHeader: true,
      rows: [
        ["A", "B"],
        ["x", "y"],
      ],
    }),
  );
  const sheet = parts["xl/worksheets/sheet1.xml"];
  assert.match(sheet, /<c r="A1" s="1" t="inlineStr">/);
  assert.match(sheet, /<c r="B1" s="1" t="inlineStr">/);
  assert.match(sheet, /<c r="A2" t="inlineStr">/, "a segunda linha fica sem estilo");
  assert.ok(!/<cols>/.test(sheet), "sem larguras, sem <cols>: o export do original também não define");
  assert.match(parts["xl/styles.xml"], /<b\/>/, "o negrito existe nos estilos");
  assert.match(parts["xl/styles.xml"], /horizontal="center" vertical="top"/);
}

// Numbers stay numbers, nulls leave a gap, an empty string stays a (blank) string.
{
  const sheet = unzip(toXlsx({ name: "S", rows: [["t", 4, null, "", 0, 1.5, Number.NaN, Number.POSITIVE_INFINITY]] }))["xl/worksheets/sheet1.xml"];
  assert.match(sheet, /<c r="B1"><v>4<\/v><\/c>/, "número é <v>, não texto");
  assert.ok(!/r="C1"/.test(sheet), "null não escreve a célula");
  assert.match(sheet, /<c r="D1" t="inlineStr"><is><t xml:space="preserve"><\/t><\/is><\/c>/, "vazio é texto vazio");
  assert.match(sheet, /<c r="E1"><v>0<\/v><\/c>/, "zero é número, não ausência");
  assert.match(sheet, /<c r="F1"><v>1.5<\/v><\/c>/);
  assert.ok(!/r="G1"/.test(sheet) && !/r="H1"/.test(sheet), "NaN e infinito não viram células quebradas");
}

// What XML cannot hold is escaped or dropped, so one odd client cannot corrupt the file.
{
  const sheet = unzip(toXlsx({ name: "S", rows: [['Maria <&> "Souza"', "a\u0000b\u0008c\u000bd\u000ee\u001ff", "ação — ç"]] }))["xl/worksheets/sheet1.xml"];
  assert.match(sheet, /Maria &lt;&amp;&gt; &quot;Souza&quot;/, "os cinco caracteres do XML");
  assert.match(sheet, /<t xml:space="preserve">abcdef<\/t>/, "controle que o XML proíbe é descartado");
  assert.match(sheet, /ação — ç/, "acento e travessão passam");
}

// A name with markup characters cannot break out of the attribute.
{
  const wb = unzip(toXlsx({ name: 'a"b<c>&d', rows: [["x"]] }))["xl/workbook.xml"];
  assert.ok(!/name="a"b/.test(wb));
  assert.match(wb, /name="a&quot;b&lt;c&gt;&amp;d"/);
}

// Wide sheets: columns past Z get two letters, and the dimension follows.
{
  const row = Array.from({ length: 28 }, (_, i) => `c${i}`);
  const sheet = unzip(toXlsx({ name: "S", rows: [row, row] }))["xl/worksheets/sheet1.xml"];
  assert.match(sheet, /<dimension ref="A1:AB2"\/>/);
  assert.match(sheet, /r="AA1"/);
  assert.match(sheet, /r="AB2"/);
}

// An empty sheet is still a valid sheet, and the same input gives the same bytes every time.
{
  assert.match(unzip(toXlsx({ name: "S", rows: [] }))["xl/worksheets/sheet1.xml"], /<dimension ref="A1:A1"\/>/);

  const input = { name: "Clientes", widths: [10], rows: [["email"], ["a@b.c"]] };
  assert.deepEqual(toXlsx(input), toXlsx(input), "sem data de relógio nos bytes");
}

assert.equal(XLSX_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "o tipo que o original serve");

console.log("xlsx ok");
