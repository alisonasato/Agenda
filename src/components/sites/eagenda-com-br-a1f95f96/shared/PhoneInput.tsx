"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import allCountries from "intl-tel-input/build/js/data.js";
import "intl-tel-input/build/css/intlTelInput.css";
import { CaretDownIcon, SearchSolidIcon } from "./icons";
import { useDismiss } from "./useDismiss";

// Port of the original's hPhoneInput (intl-tel-input 18.1.6 data + libphonenumber utils).
const MSG = { invalid: "Número de telefone inválido", tooShort: "Número incompleto", tooLong: "Número muito comprido", invalidCountry: "Código de país inválido" };

let utilsPromise: Promise<void> | null = null;
/** libphonenumber (~260 KB) loads after the field, like the original's utilsUrl. */
function loadUtils() {
  utilsPromise ??= import("intl-tel-input/build/js/utils.js").then((m) => {
    // The bundle may run it as CommonJS, in which case the global lands on the module instead.
    const mod = m as { intlTelInputUtils?: IntlTelInputUtils; default?: { intlTelInputUtils?: IntlTelInputUtils } };
    window.intlTelInputUtils ??= mod.intlTelInputUtils ?? mod.default?.intlTelInputUtils;
  });
  return utilsPromise;
}

const digitsOf = (v: string) => v.replace(/\D/g, "");
type Mask = { len: number; mask: string };

/** Masks, digit ceiling and placeholder for a country, from libphonenumber's example numbers. */
function countryRules(iso2: string, dial: string) {
  // Server render and first paint have no utils yet: no mask, only the E.164 ceiling.
  const u = typeof window === "undefined" ? undefined : window.intlTelInputUtils;
  const ceiling = Math.max(4, 15 - dial.length);
  const none = { masks: [] as Mask[], maxDigits: ceiling, example: "" };
  if (!u) return none;
  // "+55 11 96123-4567" → "11 96123-4567" (the field keeps only the local part).
  const strip = (ex: string) => {
    let s = ex.trim();
    if (!s) return "";
    if (s[0] === "+") {
      if (!s.startsWith(`+${dial}`)) return "";
      s = s.slice(dial.length + 1);
    }
    return s.replace(/^[\s\-().]+/, "");
  };
  const example = (type: number) => {
    try {
      return strip(u.getExampleNumber(iso2, false, type) || "");
    } catch {
      return "";
    }
  };
  const seen = new Set<number>();
  const masks: Mask[] = [];
  // FIXED_LINE, MOBILE, FIXED_LINE_OR_MOBILE, TOLL_FREE
  for (const type of [0, 1, 2, 3]) {
    const local = example(type);
    const len = digitsOf(local).length;
    if (!local || !len || seen.has(len)) continue;
    seen.add(len);
    masks.push({ len, mask: local.replace(/\d/g, "0") });
  }
  masks.sort((a, b) => a.len - b.len);
  if (!masks.length) return none;
  const mobile = example(1);
  // The real ceiling is the first length libphonenumber calls TOO_LONG (some countries go past their examples).
  const probe = () => {
    const base = digitsOf(mobile) + "000000000000000";
    let max: number | null = null;
    for (let len = Math.min(Math.max(1, digitsOf(mobile).length), ceiling); len <= ceiling; len++) {
      let err = -99;
      try {
        err = u.getValidationError(`+${dial}${base.slice(0, len)}`, iso2);
      } catch {
        err = -99;
      }
      if (err === 3) break;
      if (err === 1) return null;
      max = len;
    }
    return max;
  };
  const exampleMax = masks[masks.length - 1].len;
  return { masks, maxDigits: Math.max(exampleMax, probe() ?? 0), example: mobile || applyMask("0".repeat(exampleMax), masks) };
}

/** Lossless: digits past the mask are appended as-is (validation flags them on blur). */
function applyMask(value: string, masks: Mask[]) {
  const d = digitsOf(value);
  if (!masks.length || !d) return d;
  const m = masks.find((x) => d.length <= x.len) ?? masks[masks.length - 1];
  let out = "";
  let i = 0;
  for (const ch of m.mask) {
    if (i >= d.length) break;
    out += ch === "0" ? d[i++] : ch;
  }
  return i < d.length ? out + d.slice(i) : out;
}

const caretAfter = (value: string, n: number) => {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) if (/\d/.test(value[i]) && ++seen >= n) return i + 1;
  return value.length;
};

type PhoneInputProps = { name: string; id: string; label: string };

/** .hphone: country button (flag + DDI) + masked local number, validated on blur. Starts empty on Brazil. */
export function PhoneInput({ name, id, label }: PhoneInputProps) {
  const [country, setCountry] = useState({ iso2: "br", dial: "55" });
  const [local, setLocal] = useState("");
  const [rules, setRules] = useState(() => countryRules("br", "55"));
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });
  useDismiss(rootRef, open, () => setOpen(false), panelRef);

  useEffect(() => {
    loadUtils().then(() => {
      setRules(countryRules(country.iso2, country.dial));
    });
    // Runs once: later country changes recompute the rules themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Reformat what is typed whenever the country's mask changes (utils arriving, another country).
  useEffect(() => setLocal((l) => applyMask(l, rules.masks)), [rules]);

  const validate = (value: string, c = country) => {
    const u = window.intlTelInputUtils;
    const d = digitsOf(value);
    if (!d || !u) return setError("");
    const full = `+${c.dial}${d}`;
    if (u.isValidNumber(full, c.iso2)) return setError("");
    let code = -99;
    try {
      code = u.getValidationError(full, c.iso2);
    } catch {
      code = -99;
    }
    setError(code === 1 ? MSG.invalidCountry : code === 2 ? MSG.tooShort : code === 3 ? MSG.tooLong : MSG.invalid);
  };

  const pick = (iso2: string, dial: string) => {
    const c = { iso2, dial };
    const next = countryRules(iso2, dial);
    setCountry(c);
    setRules(next);
    const masked = applyMask(local, next.masks);
    setLocal(masked);
    setError("");
    setOpen(false);
    inputRef.current?.focus();
    if (digitsOf(masked)) validate(masked, c);
  };

  const onInput = (el: HTMLInputElement) => {
    const raw = el.value;
    // A pasted international number switches the country instead of joining the local part.
    if (raw.trim()[0] === "+" && digitsOf(raw).length > country.dial.length) {
      const d = digitsOf(raw);
      const best = allCountries.filter((c) => d.startsWith(c.dialCode)).sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
      if (best) {
        const next = countryRules(best.iso2, best.dialCode);
        setCountry({ iso2: best.iso2, dial: best.dialCode });
        setRules(next);
        setLocal(applyMask(d.slice(best.dialCode.length), next.masks));
        setError("");
        return;
      }
    }
    const caret = el.selectionStart ?? raw.length;
    const ceiling = Math.max(rules.maxDigits, digitsOf(local).length);
    let d = digitsOf(raw).slice(0, ceiling);
    let atDigit = digitsOf(raw.slice(0, caret)).length;
    // Deleting a mask separator removes the digit before it, as the user meant.
    if (raw.length < local.length && d.length === digitsOf(local).length && atDigit > 0) {
      d = d.slice(0, atDigit - 1) + d.slice(atDigit);
      atDigit -= 1;
    }
    const formatted = applyMask(d, rules.masks);
    setLocal(formatted);
    setError("");
    if (el.value !== formatted) {
      el.value = formatted;
      const pos = caretAfter(formatted, atDigit);
      el.setSelectionRange(pos, pos);
    }
  };

  // The original's placement: 6px under the field (above when it doesn't fit), clamped to the viewport.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!r || !panel) return;
      const margin = 8;
      const below = window.innerHeight - r.bottom;
      const up = below < panel.offsetHeight + margin && r.top > below;
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - panel.offsetWidth - margin));
      setPanelStyle(
        up
          ? { position: "fixed", left, bottom: window.innerHeight - r.top + 6, top: "auto", zIndex: 100050 }
          : { position: "fixed", left, top: r.bottom + 6, bottom: "auto", zIndex: 100050 },
      );
    };
    place();
    panelRef.current?.querySelector(".hphone-option.is-selected")?.scrollIntoView({ block: "center" });
    panelRef.current?.querySelector<HTMLInputElement>(".hphone-search-input")?.focus();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? allCountries.filter((c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q.replace("+", "")) || c.iso2.includes(q))
    : allCountries;
  const digits = digitsOf(local);

  return (
    <div ref={rootRef} className="hphone">
      <input type="hidden" name={name} id={id} value={digits ? `+${country.dial}${digits}` : ""} />
      <div ref={anchorRef} className={`hphone-field${open ? " is-open" : ""}${error ? " is-invalid" : ""}`}>
        <button
          type="button"
          className="hphone-country"
          tabIndex={-1}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Selecionar país"
          onClick={() => {
            setSearch("");
            setPanelStyle({ position: "fixed", visibility: "hidden" });
            setOpen((o) => !o);
          }}
        >
          <span className={`iti__flag iti__${country.iso2}`} aria-hidden="true" />
          <span className="hphone-dial">+{country.dial}</span>
          <span className={`hphone-caret${open ? " is-open" : ""}`}>
            <CaretDownIcon className="w-3.5 h-3.5" />
          </span>
        </button>
        <input
          ref={inputRef}
          type="tel"
          className="hphone-input"
          value={local}
          onChange={(e) => onInput(e.target)}
          onBlur={() => {
            const masked = applyMask(local, rules.masks);
            setLocal(masked);
            validate(masked);
          }}
          placeholder={rules.example}
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={error ? "true" : "false"}
          aria-label={label}
        />
      </div>
      {open &&
        createPortal(
          <div ref={panelRef} className="hselect-popover hphone-popover" style={panelStyle} role="listbox" aria-label="Países">
            <div className="hphone-search">
              <SearchSolidIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" className="hphone-search-input" placeholder="Buscar país..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="hphone-list">
              {filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  className={`hselect-option hphone-option${c.iso2 === country.iso2 ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={c.iso2 === country.iso2}
                  onClick={() => pick(c.iso2, c.dialCode)}
                >
                  <span className={`iti__flag shrink-0 iti__${c.iso2}`} aria-hidden="true" />
                  <span className="hphone-name">{c.name}</span>
                  <span className="hphone-code">+{c.dialCode}</span>
                </button>
              ))}
              {!filtered.length && <div className="hphone-empty">Nenhum país encontrado</div>}
            </div>
          </div>,
          document.body,
        )}
      <p className="hinput-error" style={error ? undefined : { display: "none" }}>
        {error}
      </p>
    </div>
  );
}
