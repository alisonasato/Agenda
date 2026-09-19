"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useDismiss } from "./useDismiss";

// Port of the original's hCellColorPicker: saturation/value area, hue rail and presets.
export const COLOR_PRESETS = ["#009DA0", "#0A70D6", "#6366F1", "#8B5CF6", "#EC4899", "#F31260", "#F5A524", "#F97316", "#17C964", "#06B6D4", "#64748B", "#101828"];

type Hsv = { h: number; s: number; v: number };
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export function hsvToHex({ h, s, v }: Hsv) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (n: number) => `0${Math.round((n + m) * 255).toString(16)}`.slice(-2);
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function hexToHsv(input: string): Hsv | null {
  let hex = input.trim().replace("#", "");
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d !== 0) h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

type ColorPickerProps = {
  name: string;
  label: string;
  desc: string;
  value: string;
  onChange: (hex: string) => void;
};

/** .hcolorpicker cell; the popover is teleported, right-aligned with the cell, 6px away, flipping up when needed. */
export function ColorPicker({ name, label, desc, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  // Hue survives grey/black picks (where the hex alone would lose it), as in the original.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 0, s: 0, v: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });
  useDismiss(rootRef, open, () => setOpen(false), panelRef);

  // Outside changes (e.g. "Restaurar cor padrão") move the thumbs too.
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (hsvToHex(hsv) !== value.toUpperCase()) setHsv(hexToHsv(value) ?? hsv);
  }

  const set = (next: Hsv) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const startDrag = (kind: "area" | "hue", e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    let cur = hsv;
    const move = (ev: PointerEvent | ReactPointerEvent) => {
      const r = el.getBoundingClientRect();
      cur =
        kind === "hue"
          ? { ...cur, h: clamp((ev.clientX - r.left) / r.width, 0, 1) * 360 }
          : { ...cur, s: clamp((ev.clientX - r.left) / r.width, 0, 1), v: 1 - clamp((ev.clientY - r.top) / r.height, 0, 1) };
      set(cur);
    };
    move(e);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      const margin = 8;
      const width = 248;
      const popH = panelRef.current?.offsetHeight || 390;
      const below = window.innerHeight - r.bottom;
      const up = below < popH + margin && r.top > below;
      const left = Math.max(margin, Math.min(r.right - width, window.innerWidth - width - margin));
      setStyle(
        up
          ? { position: "fixed", left, bottom: window.innerHeight - r.top + 6, top: "auto", zIndex: 100050 }
          : { position: "fixed", left, top: r.bottom + 6, bottom: "auto", zIndex: 100050 },
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const hex = hsvToHex(hsv);
  const hue = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div ref={rootRef} className="hcolorpicker" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <input type="hidden" name={name} id={`id_${name}`} value={hex} />
      <button type="button" className="hcolorpicker-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="hcolorpicker-label">{label}</span>
        <span className="hcolorpicker-value">{hex}</span>
        <span className="hcolorpicker-swatch" style={{ background: hex }} />
      </button>
      {open &&
        createPortal(
          <div ref={panelRef} className="hcolorpicker-popover" role="dialog" style={style}>
            <div
              className="hcp-area"
              style={{ background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), ${hue}` }}
              onPointerDown={(e) => startDrag("area", e)}
            >
              <span className="hcp-area-thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }} />
            </div>
            <div className="hcp-hue-row">
              <span className="hcp-hue-label">Matiz</span>
              <span className="hcp-hue-value">{Math.round(hsv.h)}°</span>
            </div>
            <div className="hcp-hue" onPointerDown={(e) => startDrag("hue", e)}>
              <span className="hcp-hue-thumb" style={{ left: `${(hsv.h / 360) * 100}%`, background: hue }} />
            </div>
            <div className="hcp-presets">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`hcp-preset${hex === c ? " is-selected" : ""}`}
                  style={{ background: c }}
                  title={c}
                  aria-pressed={hex === c}
                  onClick={() => set(hexToHsv(c)!)}
                />
              ))}
            </div>
          </div>,
          document.body,
        )}
      <p className="hcolorpicker-desc">{desc}</p>
    </div>
  );
}
