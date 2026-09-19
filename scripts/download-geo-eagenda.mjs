// Downloads the address lookup data behind the original's country/state/city comboboxes
// (public endpoints, 10 results per page) into public/sites/eagenda-com-br-a1f95f96/shared/geo/.
// Countries: all. States and cities: Brazil only (the account's default country).
// Usage: node scripts/download-geo-eagenda.mjs
import fs from "node:fs";

const BASE = "https://eagenda.com.br/autocomplete";
const OUT = "public/sites/eagenda-com-br-a1f95f96/shared/geo";
const BRAZIL = "31";

async function all(kind, forward) {
  const out = [];
  for (let page = 1; ; page++) {
    const fw = forward ? `&forward=${encodeURIComponent(JSON.stringify(forward))}` : "";
    const res = await fetch(`${BASE}/${kind}?q=&page=${page}${fw}`, { headers: { "X-Requested-With": "XMLHttpRequest" } });
    const json = await res.json();
    out.push(...json.results.map((r) => [r.id, r.text]));
    if (!json.pagination?.more) return out;
  }
}

fs.mkdirSync(OUT, { recursive: true });
const countries = await all("countries");
const states = await all("states", { country: BRAZIL });
const cities = {};
// A few states at a time, to stay polite with the origin.
for (let i = 0; i < states.length; i += 3) {
  await Promise.all(states.slice(i, i + 3).map(async ([id]) => (cities[id] = await all("cities", { state: id }))));
}
fs.writeFileSync(`${OUT}/countries.json`, JSON.stringify(countries));
fs.writeFileSync(`${OUT}/states-br.json`, JSON.stringify(states));
fs.writeFileSync(`${OUT}/cities-br.json`, JSON.stringify(cities));
console.log(countries.length, "countries,", states.length, "states,", Object.values(cities).flat().length, "cities");
