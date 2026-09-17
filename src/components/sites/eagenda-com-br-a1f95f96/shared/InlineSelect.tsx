"use client";

import { useRef, useState, type ReactNode } from "react";
import { CaretDownIcon, CheckReadIcon } from "./icons";
import { useDismiss } from "./useDismiss";

export type SelectOption = { value: string; label: string };

type InlineSelectProps = {
  label: string;
  icon: ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Value restored by the popover's "Limpar" button. Defaults to the first option. */
  clearTo?: string;
};

/**
 * Action-bar filter that holds a single value (.hinline with radio checks).
 * Unlike {@link InlineFilter} it always shows the chosen label and has no search box.
 */
export function InlineSelect({ label, icon, options, value, onChange, clearTo }: InlineSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="hinline">
      <button
        type="button"
        className="hinline-trigger hinline-trigger--bare is-active"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span className="hinline-label">{label}</span>
        <span className="hinline-value">{current?.label}</span>
        <span className={`hinline-chevron${open ? " is-open" : ""}`} aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hinline-popover" style={{ width: 240 }}>
          <ul className="hautocomplete-options" role="listbox">
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    className={`hselect-option hautocomplete-option${selected ? " is-selected" : ""}`}
                    role="option"
                    aria-selected={selected}
                    onClick={() => onChange(o.value)}
                  >
                    <span className={`hautocomplete-option-check is-radio${selected ? " is-checked" : ""}`}>
                      {selected && <CheckReadIcon className="w-3 h-3" />}
                    </span>
                    <span className="hautocomplete-option-content">
                      <span className="hselect-option-label">{o.label}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="hinline-footer">
            <button type="button" className="hinline-footer-clear" onClick={() => onChange(clearTo ?? options[0].value)}>
              Limpar
            </button>
            <button type="button" className="hinline-footer-done" onClick={() => setOpen(false)}>
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
