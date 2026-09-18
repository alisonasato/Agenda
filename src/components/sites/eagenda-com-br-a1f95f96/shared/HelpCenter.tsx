"use client";

import { useCallback, useRef, useState, type ComponentType, type SVGProps } from "react";
import { BookOpen, CalendarPlus, CalendarX, CircleHelp, ExternalLink, LayoutDashboard, Library, Link, Repeat, X } from "lucide-react";
import { useDismiss } from "./useDismiss";

const DOCS = "https://www.seiri.com.br/docs";

export type HelpItem = { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; desc: string; href: string };

// Each page lists its own tutorials.
export const PAINEL_HELP: HelpItem[] = [
  { icon: LayoutDashboard, title: "Entendendo o painel inicial", desc: "Visão geral do painel e seus indicadores.", href: `${DOCS}/primeiros-passos/guia-painel-inicial-seiri/` },
  { icon: CalendarPlus, title: "Configurar sua primeira agenda", desc: "Passo a passo para criar e configurar uma agenda.", href: `${DOCS}/primeiros-passos/configurarando-a-sua-primeira-agenda/` },
  { icon: Link, title: "Link de agendamento", desc: "Envie o link de agendamento para seus clientes.", href: `${DOCS}/primeiros-passos/link-de-agendamento-minha-agenda-virtual/` },
];

export const CALENDAR_HELP: HelpItem[] = [
  { icon: CalendarPlus, title: "Como incluir um agendamento", desc: "Crie um agendamento manualmente pela plataforma.", href: `${DOCS}/primeiros-passos/como-incluir-um-agendamento/` },
  { icon: CalendarX, title: "Bloquear horários", desc: "Bloqueie horários específicos da sua agenda.", href: `${DOCS}/tutoriais/bloquear-horarios-no-seiri/` },
  { icon: Repeat, title: "Agendamentos recorrentes", desc: "Crie agendamentos que se repetem.", href: `${DOCS}/tutoriais/agendamentos-recorrentes-seiri/` },
];

export function HelpCenter({ items = PAINEL_HELP }: { items?: HelpItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="help-center-container hc-bottom-right">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Abrir ajuda"
        title="Ajuda"
        className={`help-center-button${open ? " hc-active" : ""}`}
      >
        <CircleHelp />
      </button>
      {open && (
        <div className="help-center-panel" role="dialog" aria-label="Precisa de ajuda?">
          <div className="help-center-header">
            <div className="hc-head-row">
              <div className="hc-head-title">
                <BookOpen />
                <span>Precisa de ajuda?</span>
              </div>
              <button type="button" className="hc-close" onClick={close} aria-label="Fechar">
                <X />
              </button>
            </div>
            <p className="hc-subtitle">Tutoriais relacionados a esta página</p>
          </div>
          <div className="help-center-list">
            {items.map((it) => (
              <a key={it.title} href={it.href} target="_blank" rel="noopener noreferrer" className="help-center-item">
                <span className="hc-icon-box">
                  <it.icon />
                </span>
                <span className="hc-item-body">
                  <span className="hc-title">{it.title}</span>
                  <span className="hc-desc">{it.desc}</span>
                </span>
                <span className="hc-arrow">
                  <ExternalLink />
                </span>
              </a>
            ))}
          </div>
          <div className="help-center-footer">
            <a href={`${DOCS}/`} target="_blank" rel="noopener noreferrer">
              <Library />
              <span>Ver todos os tutoriais</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
