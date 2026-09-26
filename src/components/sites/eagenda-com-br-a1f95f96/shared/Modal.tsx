"use client";

import { useEffect, type ReactNode } from "react";
import { CloseCircleIcon } from "./icons";

type ModalProps = {
  /** The original's modal id, e.g. "rule-form-modal"; ids for the title/body/submit derive from it. */
  id: string;
  title: string;
  /** .hmodal-subtitle under the title. */
  subtitle?: string;
  /** Wrap header, body and footer in a <form class="hmodal-form"> (the bulk-action modals do). */
  asForm?: boolean;
  onClose: () => void;
  /** Buttons for .hmodal-footer. */
  footer: ReactNode;
  /** hmodal-panel size; the original uses lg for most forms. */
  size?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  children: ReactNode;
};

/**
 * The original's hModal (large panel, scroll inside): closes on the close button, a click on
 * the backdrop, or Escape — unless a field popover is open, which takes the Escape itself.
 */
export function Modal({ id, title, subtitle, asForm, onClose, footer, size = "lg", children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector("body > .hselect-popover") && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const content = (
    <>
      <div className="hmodal-header">
        <h2 className="hmodal-title" id={`${id}-title`}>
          {title}
        </h2>
        {subtitle && <p className="hmodal-subtitle">{subtitle}</p>}
      </div>
      <div className="hmodal-body-wrap">
        <div className="hmodal-body" id={`${id}-body`}>
          {children}
        </div>
      </div>
      <div className="hmodal-footer">{footer}</div>
    </>
  );

  return (
    <div className="hmodal">
      <div className="hmodal-wrapper hmodal-wrapper--auto hmodal-wrapper--scroll-inside" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="hmodal-backdrop hmodal-backdrop--opaque" aria-hidden="true" />
        <div
          className={`hmodal-panel hmodal-panel--${size} hmodal-panel--radius-lg hmodal-panel--shadow-lg hmodal-panel--scroll-inside`}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
        >
          <button type="button" className="hmodal-close" aria-label="Fechar" onClick={onClose}>
            <CloseCircleIcon className="w-5 h-5" />
          </button>
          {asForm ? (
            <form className="hmodal-form" method="post" onSubmit={(e) => e.preventDefault()}>
              {content}
            </form>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}

/** Primary submit with the original's (CSS-driven) submit spinner. */
export function ModalSubmit({ id, form, icon, label, disabled }: { id: string; form: string; icon: ReactNode; label: string; disabled?: boolean }) {
  return (
    <button type="submit" form={form} id={`${id}-submit`} className="hbtn hbtn--primary" disabled={disabled}>
      {icon}
      {label}
      <span id={`${id}-spinner`} className="hmodal-submit-spinner">
        <span className="hmodal-submit-dot" />
      </span>
    </button>
  );
}
