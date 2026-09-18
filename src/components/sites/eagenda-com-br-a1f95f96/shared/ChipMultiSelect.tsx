"use client";

import { useRef, useState } from "react";
import { CaretDownIcon, CheckReadIcon, CloseCircleIcon, SearchSolidIcon } from "./icons";
import { FloatingPanel } from "./FloatingPanel";
import { useDismiss } from "./useDismiss";

export type ChipOption = { id: string; label: string };

type ChipMultiSelectProps = {
  id: string;
  label: string;
  placeholder: string;
  options: ChipOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

/** Multi-select that shows the picks as chips in the field (.hms in the original). */
export function ChipMultiSelect({ id, label, placeholder, options, values, onChange }: ChipMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false), panelRef);

  const hits = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (optionId: string) => onChange(values.includes(optionId) ? values.filter((v) => v !== optionId) : [...values, optionId]);

  return (
    <div ref={rootRef} className="hms">
      <label htmlFor={id} className="hms-label">
        {label}
      </label>
      <div ref={ref} className="hms-field" onClick={() => setOpen(true)}>
        <div className="hms-rail">
          <div className="hms-rail-track">
            {values.length === 0 ? (
              <span className="hms-placeholder">{placeholder}</span>
            ) : (
              options
                .filter((o) => values.includes(o.id))
                .map((o) => (
                  <span key={o.id} className="hms-chip">
                    <span className="hms-chip-label">{o.label}</span>
                    <span
                      className="hms-chip-remove"
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remover ${o.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(o.id);
                      }}
                    >
                      <CloseCircleIcon className="w-3 h-3" />
                    </span>
                  </span>
                ))
            )}
          </div>
        </div>
        <div className="hms-actions">
          {values.length > 0 && (
            <span
              className="hms-clear"
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
          <span className="hms-chevron" role="button" tabIndex={-1} aria-hidden="true">
            <CaretDownIcon className="w-4 h-4" />
          </span>
        </div>
        {open && (
          <FloatingPanel anchor={ref} flipAnchor={rootRef} panelRef={panelRef} className="hselect-popover hms-popover" onClick={(e) => e.stopPropagation()}>
            <div className="hms-search">
              <SearchSolidIcon className="hms-search-icon w-4 h-4" />
              <input type="text" placeholder="Buscar..." className="hms-search-input" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
            </div>
            <ul className="hms-options" role="listbox" aria-multiselectable="true">
              {hits.length === 0 ? (
                <li className="hms-empty">
                  <span>Nenhuma opção disponível</span>
                </li>
              ) : (
                hits.map((o) => (
                  <li key={o.id}>
                    <button type="button" className="hselect-option" role="option" aria-selected={values.includes(o.id)} onClick={() => toggle(o.id)}>
                      <span className="hselect-option-label">{o.label}</span>
                      {values.includes(o.id) && (
                        <span className="hselect-check">
                          <CheckReadIcon className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="hms-footer">
              <span className="hms-footer-count">{values.length} selecionados</span>
              <button type="button" className="hms-footer-done" onClick={() => setOpen(false)}>
                Concluir
              </button>
            </div>
          </FloatingPanel>
        )}
      </div>
    </div>
  );
}
