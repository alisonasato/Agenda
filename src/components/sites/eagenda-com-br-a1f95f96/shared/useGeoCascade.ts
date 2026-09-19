import { useState } from "react";
import countries from "../../../../../public/sites/eagenda-com-br-a1f95f96/shared/geo/countries.json";
import statesBr from "../../../../../public/sites/eagenda-com-br-a1f95f96/shared/geo/states-br.json";

// The original's country/state/city comboboxes query the server; the prototype ships the same data
// (scripts/download-geo-eagenda.mjs): all countries, and Brazil's states and cities.
const CITIES_URL = "/sites/eagenda-com-br-a1f95f96/shared/geo/cities-br.json";
export const BRAZIL = "31";
const toOptions = (rows: string[][]) => rows.map(([value, label]) => ({ value, label }));
export const COUNTRY_OPTIONS = toOptions(countries);
const STATE_OPTIONS = toOptions(statesBr);

type Cities = Record<string, string[][]>;
let citiesPromise: Promise<Cities> | null = null;
/** Cities are ~140 KB, fetched once on demand. */
export const loadCities = () => (citiesPromise ??= fetch(CITIES_URL).then((r) => r.json()));

/**
 * País → Estado → Município: changing a level clears the ones below it (as the original's
 * change listeners do). Cities load the first time a state is picked.
 */
export function useGeoCascade(initialCountry = BRAZIL) {
  const [country, setCountryRaw] = useState(initialCountry);
  const [state, setStateRaw] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<Cities | null>(null);

  const setCountry = (v: string) => {
    setCountryRaw(v);
    setStateRaw("");
    setCity("");
  };
  const setState = (v: string) => {
    setStateRaw(v);
    setCity("");
    if (v && !cities) loadCities().then(setCities).catch(() => {});
  };

  /** Fills state and city by name (the CEP lookup gives names, not ids). */
  const setByNames = async (stateName?: string, cityName?: string) => {
    const stateRow = statesBr.find(([, n]) => n === stateName);
    const all = cities ?? (await loadCities());
    if (!cities) setCities(all);
    setCountryRaw(BRAZIL);
    setStateRaw(stateRow?.[0] ?? "");
    setCity(stateRow ? (all[stateRow[0]]?.find(([, n]: string[]) => n === cityName)?.[0] ?? "") : "");
  };

  return {
    country,
    state,
    city,
    setCountry,
    setState,
    setCity,
    setByNames,
    stateOptions: country === BRAZIL ? STATE_OPTIONS : [],
    cityOptions: state && cities?.[state] ? toOptions(cities[state]) : [],
  };
}

/** ViaCEP lookup (public API), used where the original asks its own backend to resolve a CEP. */
export async function lookupCep(cep: string) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new Error("CEP deve ter 8 dígitos");
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  const data = await res.json();
  if (!res.ok || data.erro) throw new Error("CEP não encontrado");
  return data as { logradouro?: string; bairro?: string; complemento?: string; localidade?: string; estado?: string };
}
