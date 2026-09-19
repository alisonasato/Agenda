import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const HIDDEN: CSSProperties = { position: "fixed", top: 0, left: 0, visibility: "hidden", zIndex: 100050 };

/**
 * Placement shared by the original's teleported field pickers (hPhoneInput, hTimePicker,
 * hDatePicker): 6px under the field, or above it when it doesn't fit below and there is more
 * room above; left-aligned with the field but kept 8px inside the viewport. Follows the field
 * on scroll and resize while open. Returns the popover's style (hidden until measured).
 */
export function useAnchoredPopover(open: boolean, anchor: RefObject<HTMLElement | null>, panel: RefObject<HTMLElement | null>) {
  const [style, setStyle] = useState<CSSProperties>(HIDDEN);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      const p = panel.current;
      if (!r || !p) return;
      const margin = 8;
      const below = window.innerHeight - r.bottom;
      const up = below < p.offsetHeight + margin && r.top > below;
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - p.offsetWidth - margin));
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
      // Closing hides it again, so the next open measures before showing.
      setStyle(HIDDEN);
    };
  }, [open, anchor, panel]);

  return style;
}
