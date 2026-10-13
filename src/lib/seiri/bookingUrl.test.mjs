// node src/lib/seiri/bookingUrl.test.mjs — the steps of the public booking flow as an address, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { FLOW_KEYS, readFlow, flowQuery, startsFlow } = await import("./bookingUrl.ts");

const EMPTY = { unidade: "", modo: "", agenda: "", servico: "", data: "", hora: "" };

// The six parameters the original writes, in its order.
assert.deepEqual([...FLOW_KEYS], ["unidade", "modo", "agenda", "servico", "data", "hora"]);

// Reading an address.
{
  assert.deepEqual(readFlow(""), EMPTY);
  assert.deepEqual(readFlow("?"), EMPTY);
  assert.deepEqual(readFlow("?unidade=u2&agenda=agenda-principal&servico=s1&data=2026-10-13&hora=09:30"), {
    unidade: "u2",
    modo: "",
    agenda: "agenda-principal",
    servico: "s1",
    data: "2026-10-13",
    hora: "09:30",
  });
  assert.equal(readFlow("modo=servico").modo, "servico", "sem o ponto de interrogação também");
  assert.equal(readFlow("?modo=data").modo, "data");
  assert.equal(readFlow("?modo=agenda").modo, "", "agenda é o padrão e não se escreve");
  assert.equal(readFlow("?modo=qualquer").modo, "");
  assert.equal(readFlow("?agenda=a%20b").agenda, "a b", "decodifica");
}

// A day or an hour that cannot exist reads as absent, so a mistyped link falls back to the step before it.
{
  for (const bad of ["2026-02-30", "2026-13-01", "2026-00-10", "2026-10-32", "26-10-13", "2026-10-1", "13/10/2026", "amanhã", ""]) {
    assert.equal(readFlow(`?data=${bad}`).data, "", `data ${bad}`);
  }
  assert.equal(readFlow("?data=2028-02-29").data, "2028-02-29", "29 de fevereiro de ano bissexto");
  assert.equal(readFlow("?data=2027-02-29").data, "", "e de ano comum não");
  for (const bad of ["24:00", "09:60", "9:30", "0930", "09:30:00", "ab:cd", ""]) {
    assert.equal(readFlow(`?hora=${bad}`).hora, "", `hora ${bad}`);
  }
  assert.equal(readFlow("?hora=00:00").hora, "00:00");
  assert.equal(readFlow("?hora=23:59").hora, "23:59");
}

// Any one parameter of the flow skips the welcome screen; the others do not.
{
  assert.equal(startsFlow(readFlow("")), false);
  assert.equal(startsFlow(readFlow("?cliente=K-9")), false, "a chave de acesso não é uma etapa");
  for (const key of FLOW_KEYS) {
    const value = { unidade: "u1", modo: "servico", agenda: "a", servico: "s1", data: "2026-10-13", hora: "09:00" }[key];
    assert.equal(startsFlow(readFlow(`?${key}=${value}`)), true, key);
  }
  assert.equal(startsFlow(readFlow("?data=2026-02-30")), false, "um valor inválido não conta");
}

// Writing: the flow's parameters in the original's order, the empty ones dropped.
{
  assert.equal(flowQuery("", {}), "");
  assert.equal(
    flowQuery("", { hora: "09:00", agenda: "agenda-principal", data: "2026-10-13" }),
    "agenda=agenda-principal&data=2026-10-13&hora=09%3A00",
    "na ordem do original, e o ':' escapado",
  );
  assert.equal(
    flowQuery("", { unidade: "u1", modo: "servico", agenda: "a", servico: "s1", data: "2026-10-13", hora: "09:00" }),
    "unidade=u1&modo=servico&agenda=a&servico=s1&data=2026-10-13&hora=09%3A00",
  );
  assert.equal(flowQuery("?agenda=velha&data=2026-10-01", { agenda: "nova" }), "agenda=nova", "o fluxo novo substitui o do endereço");
  assert.equal(flowQuery("?agenda=velha", {}), "", "e um fluxo vazio limpa");
  assert.equal(flowQuery("", { agenda: "" }), "", "vazio não é escrito");
}

// What is not the flow's stays, and comes first.
{
  assert.equal(flowQuery("?cliente=K-9&agenda=x", { agenda: "y" }), "cliente=K-9&agenda=y");
  assert.equal(flowQuery("?cl=grupo&data=2026-10-13", { data: "2026-10-14" }), "cl=grupo&data=2026-10-14");
  assert.equal(flowQuery("?cliente=K-9", {}), "cliente=K-9", "sem etapa, só o que não é do fluxo");
}

// Round trip: what is written is read back.
{
  const flow = { unidade: "u1", modo: "data", agenda: "agenda-principal", servico: "s2", data: "2026-12-31", hora: "17:30" };
  assert.deepEqual(readFlow(flowQuery("?cliente=K-9", flow)), flow);
  assert.deepEqual(readFlow(flowQuery("", EMPTY)), EMPTY);
}

console.log("bookingUrl ok");
