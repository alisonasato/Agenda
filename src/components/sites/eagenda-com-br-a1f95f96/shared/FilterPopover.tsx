"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAnchoredPopover } from "./useAnchoredPopover";
import { useDismiss } from "./useDismiss";
import { CaretDownIcon, FunnelIcon } from "./icons";

/** A text field of the popover: [input id, label, placeholder]. */
export type FilterField = readonly [id: string, label: string, placeholder: string];
export type FilterValues = Record<string, string>;

/** All fields empty. */
export const emptyFilters = (fields: readonly FilterField[]): FilterValues => Object.fromEntries(fields.map(([id]) => [id, ""]));

/**
 * The original's hFilterPopover ("Filtros" in an action bar): a 2-column grid of text filters.
 * The fields edit a draft; "Aplicar" (or Enter) commits it, closing any other way reverts to the
 * last applied values, so the count always reflects the applied filter. `value` is the applied filter.
 */
export function FilterPopover({
  title,
  fields,
  value: applied,
  onChange,
}: {
  title: string;
  fields: readonly FilterField[];
  value: FilterValues;
  onChange: (v: FilterValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(applied);
  // Applied from outside (a removed chip, "Limpar filtros"): the closed popover drafts from it.
  const [seen, setSeen] = useState(applied);
  if (seen !== applied) {
    setSeen(applied);
    setDraft(applied);
  }
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const style = useAnchoredPopover(open, ref, panelRef);
  const close = () => {
    setOpen(false);
    setDraft(applied);
  };
  useDismiss(ref, open, close, panelRef);

  const count = Object.values(applied).filter((v) => v.trim()).length;
  const commit = (v: FilterValues) => {
    onChange(v);
    setDraft(v);
  };
  const apply = () => {
    commit(draft);
    setOpen(false);
  };

  return (
    <div ref={ref} className="hinline hfilterpop">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${count > 0 ? " is-active" : ""}${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <FunnelIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Filtros</span>
        <span className="hinline-count" style={count > 0 ? undefined : { display: "none" }}>
          {count}
        </span>
        <span className={`hinline-chevron${open ? " is-open" : ""}`} aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open &&
        createPortal(
          <div ref={panelRef} className="hselect-popover hfilterpop-popover" role="dialog" style={style}>
            <p className="hfilterpop-title">{title}</p>
            <div className="hfilterpop-grid">
              {fields.map(([id, label, placeholder]) => (
                <div key={id} className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor={id}>
                    {label}
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id={id}
                      autoComplete="off"
                      className="hinput hinput--sm"
                      type="text"
                      placeholder={placeholder}
                      value={draft[id]}
                      onChange={(e) => setDraft({ ...draft, [id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        apply();
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="hfilterpop-footer">
              {/* "Limpar" applies the cleared filter but keeps the popover open, as the original. */}
              <button type="button" className="hinline-footer-clear" onClick={() => commit(emptyFilters(fields))}>
                Limpar
              </button>
              <button type="button" className="hinline-footer-done" onClick={apply}>
                Aplicar
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
