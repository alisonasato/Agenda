"use client";

import { useRef, useState } from "react";
import { CaretDownIcon, CheckReadIcon, CloseCircleIcon, SearchSolidIcon } from "./icons";
import type { Option } from "./Combobox";
import { useDismiss } from "./useDismiss";

type MultiSelectProps = {
  id: string;
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  required?: boolean;
};

// Multi-select with chips and a searchable panel (.hautocomplete in the original).
export function MultiSelect({ id, label, options, values, onChange, placeholder, required }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  const selected = options.filter((o) => values.includes(o.value));
  const hits = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (value: string) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <div ref={ref} className="hautocomplete">
      {values.map((v) => (
        <input key={v} type="hidden" name={id} value={v} readOnly />
      ))}
      <label htmlFor={`id_${id}`} className="hautocomplete-label">
        {label} {required && <span className="hautocomplete-req">*</span>}
      </label>
      <div className="hautocomplete-control">
        <div className={`hautocomplete-field${open ? " hautocomplete-field--open" : ""}`} onClick={() => setOpen(true)}>
          <div className="hautocomplete-rail">
            <div className="hautocomplete-rail-track">
              {selected.length === 0 ? (
                <span className="hautocomplete-placeholder">{placeholder}</span>
              ) : (
                selected.map((o) => (
                  <span key={o.value} className="hautocomplete-chip">
                    <span className="hautocomplete-chip-label">{o.label}</span>
                    <span
                      className="hautocomplete-chip-remove"
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remover ${o.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(o.value);
                      }}
                    >
                      <CloseCircleIcon className="w-3.5 h-3.5" />
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="hautocomplete-actions">
            {selected.length > 0 && (
              <span
                className="hautocomplete-clear"
                role="button"
                tabIndex={-1}
                title="Limpar tudo"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                <CloseCircleIcon className="w-4 h-4" />
              </span>
            )}
            <span className={`hautocomplete-chevron${open ? " hautocomplete-chevron--open" : ""}`} role="button" tabIndex={-1} aria-hidden="true">
              <CaretDownIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
        {open && (
          <div className="hselect-popover hautocomplete-popover">
            <div className="hautocomplete-search">
              <span className="hautocomplete-search-icon">
                <SearchSolidIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                className="hautocomplete-search-input"
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <ul className="hautocomplete-options" role="listbox">
              {hits.length === 0 ? (
                <li className="hautocomplete-state">
                  <div className="hautocomplete-state-inner">
                    <SearchSolidIcon className="w-4 h-4" />
                    <span>Nenhum resultado encontrado</span>
                  </div>
                </li>
              ) : (
                hits.map((o) => {
                  const isSelected = values.includes(o.value);
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        className={`hselect-option hautocomplete-option${isSelected ? " is-selected" : ""}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => toggle(o.value)}
                      >
                        <span className="hautocomplete-option-check">
                          {isSelected && <CheckReadIcon className="w-3 h-3" />}
                        </span>
                        <span className="hautocomplete-option-content">
                          <span className="hselect-option-label">{o.label}</span>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="hautocomplete-footer">
              <span className="hautocomplete-footer-count">{selected.length} selecionado{selected.length === 1 ? "" : "s"}</span>
              <button type="button" className="hautocomplete-footer-done" onClick={() => setOpen(false)}>
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
