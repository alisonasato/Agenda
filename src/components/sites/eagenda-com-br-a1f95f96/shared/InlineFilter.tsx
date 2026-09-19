"use client";

import { useRef, useState, type ReactNode } from "react";
import { CaretDownIcon, CheckReadIcon, SearchSolidIcon } from "./icons";
import { FloatingPanel } from "./FloatingPanel";
import { useDismiss } from "./useDismiss";

type InlineFilterProps = {
  label: string;
  icon: ReactNode;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
};

/** Action-bar filter: trigger with a count badge + searchable multi-select popover (.hinline), teleported to <body> like the original. */
export function InlineFilter({ label, icon, options, values, onChange }: InlineFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false), panelRef);
  const hits = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));
  // The original hides the search box for short static lists: x-show="!(isStatic && staticOptions.length <= 7)".
  const searchable = options.length > 7;

  return (
    <div ref={ref} className="hinline">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${values.length > 0 ? " is-active" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span className="hinline-label">{label}</span>
        {values.length > 0 && <span className="hinline-count">{values.length}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <FloatingPanel anchor={ref} panelRef={panelRef} className="hselect-popover hinline-popover" width={240}>
          {searchable && (
            <div className="hinline-search-wrap">
              <SearchSolidIcon className="hinline-search-icon w-4 h-4" />
              <input type="text" placeholder="Buscar..." className="hinline-search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          )}
          <ul className="hautocomplete-options" role="listbox">
            {hits.length === 0 ? (
              <li className="hautocomplete-state">
                <div className="hautocomplete-state-inner">
                  <SearchSolidIcon className="w-6 h-6" />
                  <span>Nenhum resultado encontrado</span>
                </div>
              </li>
            ) : (
              hits.map((o) => {
                const selected = values.includes(o);
                return (
                  <li key={o}>
                    <button
                      type="button"
                      className="hselect-option hautocomplete-option"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onChange(selected ? values.filter((v) => v !== o) : [...values, o])}
                    >
                      <span className="hautocomplete-option-check">{selected && <CheckReadIcon className="w-3 h-3" />}</span>
                      <span className="hautocomplete-option-content">
                        <span className="hselect-option-label">{o}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="hinline-footer">
            {values.length > 0 ? (
              <button type="button" className="hinline-footer-clear" onClick={() => onChange([])}>
                Limpar
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <button type="button" className="hinline-footer-done" onClick={() => setOpen(false)}>
              Concluir
            </button>
          </div>
        </FloatingPanel>
      )}
    </div>
  );
}
