// node src/components/sites/eagenda-com-br-a1f95f96/shared/viewPrefs.test.mjs
// The remembered view choices. useViewPref wraps these; the rules live outside React so they can
// be driven here.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out, and must let "?fresh=" through.
register(
  'data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !/\\.(ts|tsx|mjs|js|json)(\\?|$)/.test(s) ? s + ".ts" : s, c); }',
);

const KEY = "seiri.view.v1";
const NAME = "appointments.columns";
/** What the appointments list starts on, measured on the original. */
const FALLBACK = ["check_owner"];

function fakeStorage({ failRead = false, failWrite = false } = {}) {
  const map = new Map();
  return {
    map,
    getItem: (k) => {
      if (failRead) throw new Error("storage bloqueado");
      return map.has(k) ? map.get(k) : null;
    },
    setItem: (k, v) => {
      if (failWrite) throw new Error("cota excedida");
      map.set(k, String(v));
    },
    removeItem: (k) => map.delete(k),
  };
}

/** The module keeps `cache` at module scope, so each scenario needs its own instance. */
let n = 0;
async function fresh(storage) {
  globalThis.localStorage = storage;
  return import(`./viewPrefs.ts?fresh=${++n}`);
}

const stored = (s) => JSON.parse(s.map.get(KEY));

// Nothing saved: the fallback stands, and reading alone writes nothing.
{
  const storage = fakeStorage();
  const { selectedIn } = await fresh(storage);
  assert.deepEqual(selectedIn(NAME, FALLBACK), FALLBACK);
  assert.equal(storage.map.size, 0, "só ler não grava");
}

// Toggling adds, removes, and saves each time.
{
  const storage = fakeStorage();
  const { selectedIn, toggleIn } = await fresh(storage);

  assert.deepEqual(toggleIn(NAME, "check_tags", FALLBACK), ["check_owner", "check_tags"], "liga sobre o padrão");
  assert.deepEqual(stored(storage)[NAME], ["check_owner", "check_tags"], "gravou");

  assert.deepEqual(toggleIn(NAME, "check_owner", FALLBACK), ["check_tags"], "desliga o que vinha do padrão");
  assert.deepEqual(selectedIn(NAME, FALLBACK), ["check_tags"], "e é isso que se lê depois");

  assert.deepEqual(toggleIn(NAME, "check_tags", FALLBACK), [], "desligar tudo é um estado válido");
  assert.deepEqual(selectedIn(NAME, FALLBACK), [], "e não volta para o padrão");
  assert.deepEqual(stored(storage)[NAME], []);
}

// What was saved wins over the fallback, including an empty set.
{
  const storage = fakeStorage();
  storage.map.set(KEY, JSON.stringify({ [NAME]: ["check_cpf"] }));
  const { selectedIn } = await fresh(storage);
  assert.deepEqual(selectedIn(NAME, FALLBACK), ["check_cpf"]);

  const vazio = fakeStorage();
  vazio.map.set(KEY, JSON.stringify({ [NAME]: [] }));
  assert.deepEqual((await fresh(vazio)).selectedIn(NAME, FALLBACK), [], "vazio gravado continua vazio");
}

// Two screens keep their own sets under the one key.
{
  const storage = fakeStorage();
  const { selectedIn, toggleIn } = await fresh(storage);
  toggleIn(NAME, "check_tags", FALLBACK);
  toggleIn("clients.columns", "check_cpf", []);

  assert.deepEqual(selectedIn("clients.columns", []), ["check_cpf"]);
  assert.deepEqual(selectedIn(NAME, FALLBACK), ["check_owner", "check_tags"], "uma tela não pisa na outra");
  assert.deepEqual(Object.keys(stored(storage)).sort(), ["appointments.columns", "clients.columns"]);
}

// A name nobody saved falls back on its own, whatever the others hold.
{
  const storage = fakeStorage();
  storage.map.set(KEY, JSON.stringify({ "clients.columns": ["check_cpf"] }));
  assert.deepEqual((await fresh(storage)).selectedIn(NAME, FALLBACK), FALLBACK);
}

// clearPrefs drops everything.
{
  const storage = fakeStorage();
  const { selectedIn, toggleIn, clearPrefs } = await fresh(storage);
  toggleIn(NAME, "check_tags", FALLBACK);
  clearPrefs();
  assert.equal(storage.map.size, 0);
  assert.deepEqual(selectedIn(NAME, FALLBACK), FALLBACK, "volta ao padrão");
}

// A corrupt blob, a blob of the wrong shape, and storage that throws.
{
  const broken = fakeStorage();
  broken.map.set(KEY, "{ isto não é json");
  assert.deepEqual((await fresh(broken)).selectedIn(NAME, FALLBACK), FALLBACK, "blob corrompido volta ao padrão");

  // Das formas erradas, só `null` chega a lançar: ler uma chave de um array, string ou número dá
  // undefined e cai no padrão sozinho. É contra o null que a guarda existe.
  const nulo = fakeStorage();
  nulo.map.set(KEY, "null");
  assert.deepEqual((await fresh(nulo)).selectedIn(NAME, FALLBACK), FALLBACK, "null gravado volta ao padrão");

  const array = fakeStorage();
  array.map.set(KEY, JSON.stringify(["isto", "era", "uma", "lista"]));
  assert.deepEqual((await fresh(array)).selectedIn(NAME, FALLBACK), FALLBACK, "blob com a forma errada volta ao padrão");

  const unreadable = await fresh(fakeStorage({ failRead: true }));
  assert.deepEqual(unreadable.selectedIn(NAME, FALLBACK), FALLBACK, "getItem que lança volta ao padrão");

  // A private window: setItem throws and the choice still holds for this session.
  const unwritable = fakeStorage({ failWrite: true });
  const m = await fresh(unwritable);
  assert.deepEqual(m.toggleIn(NAME, "check_tags", FALLBACK), ["check_owner", "check_tags"]);
  assert.equal(unwritable.map.size, 0, "nada foi gravado");
  assert.deepEqual(m.selectedIn(NAME, FALLBACK), ["check_owner", "check_tags"], "mas vale na memória");
}

console.log("viewPrefs ok");
