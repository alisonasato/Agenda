"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeftIcon } from "./icons";

type SaveBarProps = {
  backHref: string;
  saveLabel: string;
  saveIcon: ReactNode;
  /** Something changed since the page loaded. */
  dirty: boolean;
  toastIcon: ReactNode;
  toastTitle: string;
  toastSub: string;
  /** Forces the toast on (e.g. to acknowledge a save the prototype does not perform). */
  forceToast?: boolean;
};

/**
 * The original's form save bar: an inline dock with Voltar / Salvar at the end of the form,
 * plus a floating toast repeating those actions. The toast shows only while the form is
 * dirty and the dock is scrolled out of view, lined up with the dock on desktop and full
 * width below the sidebar breakpoint.
 */
export function SaveBar({ backHref, saveLabel, saveIcon, dirty, toastIcon, toastTitle, toastSub, forceToast }: SaveBarProps) {
  const dock = useRef<HTMLDivElement>(null);
  const [dockHidden, setDockHidden] = useState(false);
  const [edges, setEdges] = useState<CSSProperties>({ left: 0, right: 0 });

  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setDockHidden(r.top >= window.innerHeight || r.bottom <= 0);
      setEdges(window.innerWidth >= 1024 ? { left: r.left, right: window.innerWidth - r.right } : { left: 0, right: 0 });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const actions = (
    <>
      <a href={backHref} className="hbtn hbtn--secondary">
        <ChevronLeftIcon />
        Voltar
      </a>
      <button type="submit" className="hbtn hbtn--primary">
        {saveIcon}
        <span className="hsavebar-btn-label">{saveLabel}</span>
        <span className="hsavebar-btn-saving">Salvando...</span>
      </button>
    </>
  );

  return (
    <div className="hsavebar">
      <div className="hsavebar-progress" aria-hidden="true" />
      <div ref={dock} className="hsavebar-dock">
        <span className="hsavebar-dock-spacer" aria-hidden="true" />
        <div className="hsavebar-dock-actions">{actions}</div>
      </div>
      <div className="hsavebar-toast" role="status" aria-live="polite" style={{ ...edges, display: forceToast || (dirty && dockHidden) ? undefined : "none" }}>
        <span className="hsavebar-toast-icon">{toastIcon}</span>
        <div className="hsavebar-toast-text">
          <p className="hsavebar-toast-title">{toastTitle}</p>
          <p className="hsavebar-toast-sub">{toastSub}</p>
        </div>
        <div className="hsavebar-toast-actions">{actions}</div>
      </div>
    </div>
  );
}
