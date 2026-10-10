"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightIcon, CloseCircleIcon, InboxIcon } from "./icons";
import { ROUTES } from "./Sidebar";
import { useData } from "@/lib/seiri/store";
import { recentAppointments } from "@/lib/seiri/activity";
import { expand, formatWhen } from "@/lib/seiri/select";
import { STATUS_LABELS, STATUS_TONES } from "@/lib/seiri/types";

/**
 * The topbar's "Atividade recente": a right-hand `.hdrawer` over a darkened page, closed by its ✕,
 * the backdrop or Escape, with the page behind it locked against scrolling. Structure and classes are
 * the original's, read off the open drawer. The original fills it from /painel/atividade-recente/;
 * here the list comes from the browser's own data.
 */
/** The slide and the dim both run .25s; the drawer stays mounted that long on its way out. */
const MOTION_MS = 250;

export function ActivityDrawer({ onClose }: { onClose: () => void }) {
  const data = useData();
  const dialogRef = useRef<HTMLDivElement>(null);
  const rows = recentAppointments(data);

  // It mounts off to the right with the page undimmed, and one painted frame later moves in; closing
  // runs the same thing backwards before the parent is told.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, MOTION_MS);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  // Measured on the original: while it is open the body is `overflow: hidden` with the scrollbar's
  // width added back as padding, so the page does not jump sideways.
  useEffect(() => {
    const body = document.body;
    const before = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const bar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (bar > 0) body.style.paddingRight = `${bar}px`;
    dialogRef.current?.focus();
    return () => {
      body.style.overflow = before.overflow;
      body.style.paddingRight = before.paddingRight;
    };
  }, []);

  return createPortal(
    <>
      {/* The page is dimmed by the shared modal layer, not by the drawer's own backdrop, which is transparent. */}
      <div className={`hmodal-dim hmodal-dim--opaque${shown ? " hmodal-dim--on" : ""}`} aria-hidden="true" />
      <div className="hdrawer-content hdrawer-content--right">
        <div className="hdrawer-backdrop hdrawer-backdrop--opaque" aria-hidden="true" onClick={close} />
        <div
          ref={dialogRef}
          className={`hdrawer-dialog hdrawer-dialog--right hdrawer-dialog--lg hdrawer-dialog--draggable${shown ? "" : " hdrawer-dialog--off"}`}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          data-placement="right"
          aria-labelledby="activity-drawer-title"
        >
          <button type="button" className="hdrawer-close" aria-label="Fechar" onClick={close}>
            <CloseCircleIcon className="w-5 h-5" />
          </button>
          <div className="hdrawer-header">
            <h2 className="hdrawer-heading" id="activity-drawer-title">
              Atividade recente
            </h2>
          </div>
          <div className="hdrawer-body" id="activity-drawer-body" data-slot="drawer-body">
            {rows.length ? (
              // Not captured: the reference account has nothing in the last seven days, so the original's
              // filled rows were never seen. These are built from the design system's own list vocabulary.
              <ul className="divide-y divide-[color:var(--color-border)]">
                {rows.map((a) => {
                  const { clientName, serviceName, agendaName } = expand(data, a);
                  return (
                    <li key={a.id}>
                      <a href={`${ROUTES.agendamentoDetalhes}?id=${a.id}`} className="flex items-start justify-between gap-3 py-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-gray-900 inter-semibold">{clientName}</span>
                          <span className="block truncate text-xs text-gray-500 inter-regular">
                            {serviceName} · {agendaName}
                          </span>
                          <span className="block text-xs text-gray-500 inter-regular">{formatWhen(a.start, a.duration)}</span>
                        </span>
                        <span className={`hchip hchip--sm shrink-0 ${STATUS_TONES[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Sem atividade recente</h3>
                <p className="hempty-desc inter-regular">Os agendamentos dos últimos 7 dias aparecem aqui.</p>
              </div>
            )}
          </div>
          <div className="hdrawer-footer">
            <a href={ROUTES.agendamentos} className="hbtn hbtn--secondary hbtn--block">
              <ArrowRightIcon className="w-4 h-4" />
              Ver todos os agendamentos
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
