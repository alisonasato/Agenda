"use client";

import { useLayoutEffect, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type FloatingPanelProps = {
  /** The field the panel hangs from; it takes that field's width. */
  anchor: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  className: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
};

/**
 * A field popover rendered on <body> with fixed positioning, like the original's teleported
 * panels — so a scrolling modal body never clips it. Follows the field on scroll and resize.
 */
export function FloatingPanel({ anchor, panelRef, className, children, onClick }: FloatingPanelProps) {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (r) setStyle({ position: "fixed", left: r.left, top: r.bottom + 4, width: r.width, bottom: "auto", zIndex: 100050 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor]);

  if (!style) return null;
  return createPortal(
    <div ref={panelRef} className={className} style={style} onClick={onClick}>
      {children}
    </div>,
    document.body,
  );
}
