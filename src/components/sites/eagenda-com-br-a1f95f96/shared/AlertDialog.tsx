"use client";

import { useEffect, type ReactNode } from "react";
import { CloseCircleIcon } from "./icons";

type AlertDialogProps = {
  /** The original's dialog id, e.g. "client-delete-dialog"; the heading and body ids derive from it. */
  id: string;
  heading: string;
  /** The mark in the header circle. */
  icon: ReactNode;
  tone?: "danger" | "accent" | "success";
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
};

/** The original's alert_dialog (`.halertdialog`): a small confirmation panel over an opaque backdrop. */
export function AlertDialog({ id, heading, icon, tone = "danger", onClose, footer, children }: AlertDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="halertdialog-backdrop halertdialog-backdrop--opaque" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="halertdialog-container">
        <div className="halertdialog-dialog halertdialog-dialog--sm" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-heading`} tabIndex={-1}>
          <button type="button" className="halertdialog-close" onClick={onClose} aria-label="Fechar">
            <CloseCircleIcon className="w-4 h-4" />
          </button>
          <div className="halertdialog-header">
            <span className={`halertdialog-icon halertdialog-icon--${tone}`} aria-hidden="true">
              {icon}
            </span>
            <h2 className="halertdialog-heading" id={`${id}-heading`}>
              {heading}
            </h2>
          </div>
          <div className="halertdialog-body" id={`${id}-body`}>
            {children}
          </div>
          <div className="halertdialog-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
}
