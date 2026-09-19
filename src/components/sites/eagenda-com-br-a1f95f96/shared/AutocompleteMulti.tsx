"use client";

import { useRef, useState } from "react";
import { CaretDownIcon, CheckReadIcon, CloseCircleIcon, SearchSolidIcon } from "./icons";
import { FloatingPanel } from "./FloatingPanel";
import { useDismiss } from "./useDismiss";
import type { ChipOption } from "./ChipMultiSelect";

type AutocompleteMultiProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  /** The original searches these on the server (alpineMultiselectAjax); the prototype filters locally. */
  options: ChipOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

/**
 * The original's .hautocomplete: chips in the field, and a teleported panel (search box, checkbox
 * options, "N selecionados · Concluir") hanging 4px under the whole field (label included), as wide as it.
 */
export function AutocompleteMulti({ id, name, label, placeholder, options, values, onChange }: AutocompleteMultiProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(rootRef, open, () => setOpen(false), panelRef);

  const q = query.trim().toLowerCase();
  const hits = options.filter((o) => o.label.toLowerCase().includes(q));
  const toggle = (v: string) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div ref={rootRef} className="hautocomplete">
      {values.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <label htmlFor={id} className="hautocomplete-label">
        {label}
      </label>
      <div className="hautocomplete-control">
        <div className="hautocomplete-field" onClick={() => setOpen((o) => !o)}>
          <div className="hautocomplete-rail">
            <div className="hautocomplete-rail-track">
              {values.length === 0 ? (
                <span className="hautocomplete-placeholder">{placeholder}</span>
              ) : (
                options
                  .filter((o) => values.includes(o.id))
                  .map((o) => (
                    <span key={o.id} className="hautocomplete-chip">
                      <span className="hautocomplete-chip-label">{o.label}</span>
                      <button
                        type="button"
                        className="hautocomplete-chip-remove"
                        tabIndex={-1}
                        title="Remover"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(o.id);
                        }}
                      >
                        <CloseCircleIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))
              )}
            </div>
          </div>
          <div className="hautocomplete-actions">
            {values.length > 0 && (
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
            <span className="hautocomplete-chevron" role="button" tabIndex={-1}>
              <CaretDownIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
      {open && (
        <FloatingPanel anchor={rootRef} panelRef={panelRef} className="hselect-popover hautocomplete-popover">
          <div className="hautocomplete-search">
            <SearchSolidIcon className="hautocomplete-search-icon w-4 h-4" />
            <input type="text" placeholder="Buscar..." className="hautocomplete-search-input" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          </div>
          <ul className="hautocomplete-options" role="listbox" aria-multiselectable="true">
            {hits.length === 0 ? (
              <li className="hautocomplete-state">
                <div className="hautocomplete-state-inner">
                  <SearchSolidIcon className="w-6 h-6" />
                  <span>Nenhum resultado encontrado</span>
                </div>
              </li>
            ) : (
              hits.map((o) => {
                const on = values.includes(o.id);
                return (
                  <li key={o.id}>
                    <div className="hautocomplete-option-row">
                      <button type="button" className="hselect-option hautocomplete-option" role="option" aria-selected={on} onClick={() => toggle(o.id)}>
                        <span className={`hautocomplete-option-check${on ? " is-checked" : ""}`}>{on && <CheckReadIcon className="w-3 h-3" />}</span>
                        <span className="hautocomplete-option-content">
                          <span className="hselect-option-label">{o.label}</span>
                        </span>
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          {hits.length > 0 && (
            <div className="hautocomplete-footer">
              <span className="hautocomplete-footer-count">
                {values.length} {values.length !== 1 ? "selecionados" : "selecionado"}
              </span>
              <button type="button" className="hautocomplete-footer-done" onClick={() => setOpen(false)}>
                Concluir
              </button>
            </div>
          )}
        </FloatingPanel>
      )}
    </div>
  );
}
