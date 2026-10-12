/**
 * Reads the first sheet of an .xlsx in the browser, the counterpart of xlsx.ts. The original reads an uploaded
 * spreadsheet on its server; here a zip, a little XML and `DecompressionStream` (Chrome 80, Firefox 113,
 * Safari 16.4) are enough. Cells come back as text, the way a person sees them.
 */

const decoder = new TextDecoder();

/** More than this unzipped from one part is not a spreadsheet someone typed, whatever its size on disk. */
const MAX_PART = 32 * 1024 * 1024;

type Parts = Map<string, () => Promise<Uint8Array>>;

async function inflate(data: Uint8Array) {
  const stream = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** The zip's parts by name, each read (and inflated) only when asked for. Stored and deflated parts only. */
export function openZip(bytes: Uint8Array): Parts {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("não é um arquivo zip");

  const parts: Parts = new Map();
  let p = dv.getUint32(end + 16, true);
  for (let n = dv.getUint16(end + 10, true); n > 0; n--) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error("diretório do zip quebrado");
    const method = dv.getUint16(p + 10, true);
    const size = dv.getUint32(p + 20, true);
    const full = dv.getUint32(p + 24, true);
    const nameLength = dv.getUint16(p + 28, true);
    const local = dv.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));
    parts.set(name, async () => {
      if (full > MAX_PART) throw new Error("parte grande demais");
      const at = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
      const raw = bytes.subarray(at, at + size);
      if (method === 0) return raw;
      if (method === 8) return inflate(raw);
      throw new Error("compressão do zip não suportada");
    });
    p += 46 + nameLength + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true);
  }
  return parts;
}

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
const unescapeXml = (text: string) =>
  text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(lt|gt|amp|quot|apos));/gi, (_, hex, dec, name) =>
    name ? ENTITIES[name.toLowerCase()] : String.fromCodePoint(hex ? parseInt(hex, 16) : Number(dec)),
  );

/** `name="value"` pairs of one tag's attribute text, in any order. */
const attributes = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w:]+)="([^"]*)"/g)].map((m) => [m[1], unescapeXml(m[2])]));

/** The text of every <t> inside a fragment, the pieces of a rich-text string joined. */
const textOf = (xml: string) => [...xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "").matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((m) => unescapeXml(m[1])).join("");

/** "A" is 0, "Z" 25, "AA" 26. */
const columnIndex = (letters: string) => [...letters.toUpperCase()].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

/** Where the first sheet (as the workbook orders them) lives in the zip. */
async function firstSheetPath(parts: Parts) {
  const text = async (name: string) => {
    const read = parts.get(name);
    return read ? decoder.decode(await read()) : "";
  };
  const sheet = (await text("xl/workbook.xml")).match(/<sheet\b[^>]*>/);
  const id = sheet && attributes(sheet[0])["r:id"];
  const rels = [...(await text("xl/_rels/workbook.xml.rels")).matchAll(/<Relationship\b[^>]*>/g)].map((m) => attributes(m[0]));
  const target = rels.find((r) => r.Id === id)?.Target;
  if (target) return target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  return "xl/worksheets/sheet1.xml";
}

/** The first sheet's rows as text; a gap in a row reads as "". */
export async function fromXlsx(bytes: Uint8Array): Promise<string[][]> {
  const parts = openZip(bytes);
  const sheet = parts.get(await firstSheetPath(parts));
  if (!sheet) throw new Error("planilha sem abas");

  const shared = parts.get("xl/sharedStrings.xml");
  const strings = shared ? [...decoder.decode(await shared()).matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((m) => textOf(m[1])) : [];

  const rows: string[][] = [];
  for (const [, rowTag, rowBody = ""] of decoder.decode(await sheet()).matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const row: string[] = [];
    let next = 0;
    for (const [, cellTag, body = ""] of rowBody.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attr = attributes(cellTag);
      const at = attr.r ? columnIndex(attr.r.replace(/\d+$/, "")) : next;
      const value = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "";
      row[at] =
        attr.t === "s"
          ? (strings[Number(value)] ?? "")
          : attr.t === "inlineStr"
            ? textOf(body)
            : attr.t === "b"
              ? value === "1"
                ? "TRUE"
                : "FALSE"
              : unescapeXml(value);
      next = at + 1;
    }
    const line = Number(attributes(rowTag).r) - 1;
    rows[Number.isInteger(line) && line >= 0 ? line : rows.length] = Array.from(row, (c) => c ?? "");
  }
  return Array.from(rows, (r) => r ?? []);
}
