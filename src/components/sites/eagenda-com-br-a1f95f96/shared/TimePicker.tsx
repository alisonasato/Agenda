"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClockSolidIcon } from "./icons";
import { useAnchoredPopover } from "./useAnchoredPopover";
import { useDismiss } from "./useDismiss";

const pad = (n: number) => String(n).padStart(2, "0");

type TimePickerProps = { id: string; name: string; step?: number };

/**
 * Port of the original's hTimePicker (.htime): a native time input plus a clock button that
 * opens Hora / Min columns (minutes every `step`, 5 by default). The popover is teleported
 * and placed like the other field pickers.
 */
export function TimePicker({ id, name, step = 5 }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDismiss(rootRef, open, () => setOpen(false), panelRef);
  const style = useAnchoredPopover(open, anchorRef, panelRef);

  const hours = Array.from({ length: 24 }, (_, h) => pad(h));
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) => pad(i * step));
  const [hh, mm] = value.includes(":") ? [value.split(":")[0].padStart(2, "0"), (value.split(":")[1] ?? "").slice(0, 2).padStart(2, "0")] : ["", ""];

  // Tell the form (dirty tracking) like a native edit would.
  const set = (v: string) => {
    setValue(v);
    queueMicrotask(() => inputRef.current?.dispatchEvent(new Event("change", { bubbles: true })));
  };

  // On open, scroll both columns to the current hour and minute.
  useLayoutEffect(() => {
    if (open) panelRef.current?.querySelectorAll(".htime-opt.is-selected").forEach((el) => el.scrollIntoView({ block: "center" }));
  }, [open]);

  return (
    <div ref={rootRef} id={id} className="htime" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <div ref={anchorRef} className="htime-field">
        <input ref={inputRef} type="time" className="htime-input" name={name} value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button" className="htime-clock" tabIndex={-1} aria-haspopup="dialog" aria-label="Abrir seletor de hora" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <ClockSolidIcon className="w-4 h-4" />
        </button>
      </div>
      {open &&
        createPortal(
          <div ref={panelRef} className="hselect-popover htime-popover" style={style} role="dialog" aria-label="Selecionar hora">
            <div className="htime-cols">
              <div className="htime-col">
                <div className="htime-col-head">Hora</div>
                <div className="htime-col-scroll">
                  {hours.map((h) => (
                    <button key={h} type="button" className={`htime-opt${hh === h ? " is-selected" : ""}`} onClick={() => set(`${h}:${mm || "00"}`)}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="htime-col">
                <div className="htime-col-head">Min</div>
                <div className="htime-col-scroll">
                  {minutes.map((m) => (
                    <button key={m} type="button" className={`htime-opt${mm === m ? " is-selected" : ""}`} onClick={() => set(`${hh || "00"}:${m}`)}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
