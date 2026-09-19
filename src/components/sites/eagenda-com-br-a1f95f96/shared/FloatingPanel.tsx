"use client";

import { useLayoutEffect, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type FloatingPanelProps = {
  /** The control the panel hangs from; it takes that control's width. */
  anchor: RefObject<HTMLElement | null>;
  /** When the panel opens upwards it sits above this element (the whole field, label included). */
  flipAnchor?: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  className: string;
  /** Panel width: the anchor width by default, a fixed width, or "auto" to leave it to the CSS. */
  width?: number | "auto";
  /** Distance from the anchor (the original uses 4px for fields, 6px for menus and period pickers). */
  gap?: number;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
};

// First paint: laid out but invisible, so the real height can be measured before placing it.
const MEASURING: CSSProperties = { position: "fixed", top: 0, left: 0, visibility: "hidden", zIndex: 100050 };

const panelWidth = (width: number | "auto" | undefined, anchor: RefObject<HTMLElement | null>) =>
  width === "auto" ? undefined : (width ?? anchor.current?.getBoundingClientRect().width);

/**
 * A field popover rendered on <body> with fixed positioning, like the original's teleported
 * panels, so a scrolling modal body never clips it. Opens below the control, or above the
 * field when there isn't room below and there is more above (the original's checkDropPosition).
 * Follows the field on scroll and resize.
 */
export function FloatingPanel({ anchor, flipAnchor, panelRef, className, width, gap = 4, children, onClick }: FloatingPanelProps) {
  // Measured at the final width so wrapped options give the real height.
  const [style, setStyle] = useState<CSSProperties>(() => ({ ...MEASURING, width: panelWidth(width, anchor) }));

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      const height = panelRef.current?.offsetHeight ?? 0;
      const top = (flipAnchor?.current ?? anchor.current)!.getBoundingClientRect().top;
      const below = window.innerHeight - r.bottom - gap;
      const above = top - gap;
      const base = { position: "fixed" as const, left: r.left, width: panelWidth(width, anchor), zIndex: 100050 };
      setStyle(
        height > below && above > below
          ? { ...base, bottom: window.innerHeight - top + gap, top: "auto" }
          : { ...base, top: r.bottom + gap, bottom: "auto" },
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, flipAnchor, panelRef, width, gap]);

  return createPortal(
    <div ref={panelRef} className={className} style={style} onClick={onClick}>
      {children}
    </div>,
    document.body,
  );
}
