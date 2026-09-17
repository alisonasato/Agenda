"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type ScrollRailProps = {
  /** Class for the outer rail element, e.g. "hactionbar". */
  className: string;
  /** Class for the scrolling track, e.g. "hrail-track hactionbar-track". */
  trackClassName: string;
  children: ReactNode;
};

/**
 * Horizontally scrollable rail with paging arrows that only show while there is
 * something to scroll to — the clone of the original's `hScrollRail()`.
 */
export function ScrollRail({ className, trackClassName, children }: ScrollRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [{ prev, next }, setArrows] = useState({ prev: false, next: false });

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setArrows({ prev: el.scrollLeft > 1, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const page = (direction: number) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className={className} role="group">
      <button
        type="button"
        className="hrail-arrow hrail-arrow--prev"
        tabIndex={-1}
        aria-label="Rolar para o início"
        style={prev ? undefined : { display: "none" }}
        onClick={() => page(-1)}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <div ref={trackRef} className={trackClassName} onScroll={sync}>
        {children}
      </div>
      <button
        type="button"
        className="hrail-arrow hrail-arrow--next"
        tabIndex={-1}
        aria-label="Rolar para o fim"
        style={next ? undefined : { display: "none" }}
        onClick={() => page(1)}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
