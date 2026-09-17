"use client";

import { useRef, useState } from "react";
import { CaretDownIcon, CheckReadIcon, CloseCircleIcon, SearchSolidIcon } from "./icons";
import { useDismiss } from "./useDismiss";

export type Option = { value: string; label: string };

type ComboboxProps = {
  id: string;
  label: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  required?: boolean;
  /** No options yet (e.g. "Selecione a agenda primeiro"): shows the placeholder and stays closed. */
  disabled?: boolean;
};

// Single-select field with an inline search box (.hcombobox in the original).
export function Combobox({ id, label, options, value, onChange, placeholder, required, disabled }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  const selected = options.find((o) => o.value === value);
  const hits = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} className="hcombobox">
      <input type="hidden" name={id} id={`id_${id}`} value={value ?? ""} required={required} readOnly />
      <label htmlFor={`id_${id}`} className="hcombobox-label">
        {label} {required && <span className="hcombobox-req">*</span>}
      </label>
      <div className="hcombobox-control">
        {selected && !open ? (
          <div className="hcombobox-trigger is-filled" onClick={() => !disabled && setOpen(true)}>
            <span className="hcombobox-value">{selected.label}</span>
          </div>
        ) : disabled ? (
          <div className="hcombobox-trigger is-disabled" aria-disabled="true">
            <span className="hcombobox-value is-placeholder">{placeholder}</span>
          </div>
        ) : (
          <input
            type="text"
            className={`hcombobox-input${open ? " is-open" : ""}`}
            placeholder={placeholder}
            aria-label={placeholder}
            value={open ? query : ""}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
          />
        )}
        <div className="hcombobox-actions">
          {selected && (
            <span
              className="hcombobox-clear"
              role="button"
              tabIndex={-1}
              title="Limpar seleção"
              onClick={() => onChange?.("")}
            >
              <CloseCircleIcon className="w-4 h-4" />
            </span>
          )}
          <span className={`hselect-indicator${open ? " is-open" : ""}`} aria-hidden="true">
            <CaretDownIcon className="w-4 h-4" />
          </span>
        </div>
      </div>
      {open && (
        <div className="hselect-popover hcombobox-popover">
          <ul className="hcombobox-options" role="listbox">
            {hits.length === 0 ? (
              <li className="hcombobox-empty">
                <div className="flex flex-col items-center gap-2">
                  <SearchSolidIcon className="w-6 h-6 text-gray-400" />
                  <span>Nenhum resultado encontrado</span>
                </div>
              </li>
            ) : (
              hits.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    className="hselect-option"
                    role="option"
                    aria-selected={o.value === value}
                    onClick={() => {
                      onChange?.(o.value);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    <span className="hselect-option-label">{o.label}</span>
                    {o.value === value && (
                      <span className="hselect-check">
                        <CheckReadIcon className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
