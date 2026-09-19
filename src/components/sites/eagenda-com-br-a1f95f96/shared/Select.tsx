"use client";

import { useRef, useState } from "react";
import { CaretDownIcon, CheckReadIcon } from "./icons";
import { useDismiss } from "./useDismiss";
import type { Option } from "./Combobox";

type SelectProps = {
  id: string;
  name: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

/** The original's .hselect-field: a plain labelled select (no search) whose list opens under it. */
export function Select({ id, name, label, options, value, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const current = options.find((o) => o.value === value);

  return (
    <div className="hselect-field hselect-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
      </label>
      <div ref={ref} className="hselect hselect--block">
        <input type="hidden" name={name} value={value} />
        <button type="button" className={`hselect-trigger${open ? " is-open" : ""}`} id={id} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="hselect-value">{current?.label || "Selecione…"}</span>
          <span className={`hselect-indicator${open ? " is-open" : ""}`} aria-hidden="true">
            <CaretDownIcon className="w-4 h-4" />
          </span>
        </button>
        {open && (
          <div className="hselect-popover" role="listbox">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`hselect-option${o.value === value ? " is-selected" : ""}`}
                onClick={() => {
                  onChange(o.value);
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
