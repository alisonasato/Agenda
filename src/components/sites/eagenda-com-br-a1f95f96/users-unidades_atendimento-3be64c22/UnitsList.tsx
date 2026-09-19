"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { useAnchoredPopover } from "../shared/useAnchoredPopover";
import { useDismiss } from "../shared/useDismiss";
import { AddAppointmentIcon, CaretDownIcon, CloseCircleIcon, FunnelIcon, InboxIcon, SearchSolidIcon } from "../shared/icons";

const COLUMNS = ["Unidade", "Endereço", "Contato", "Agendas"];
const SLOTS = 10;
const KPIS = ["Unidades", "Agendas vinculadas", "Com contato"];

/** The "Filtros" popover fields: [key, label, placeholder]. */
const FIELDS = [
  ["name", "Nome da Unidade", "Ex.: Unidade Centro"],
  ["slug", "Slug", "Ex.: unidade-centro"],
  ["email", "Email", "Ex.: unidade@email.com"],
  ["phone", "Telefone", "Com ou sem máscara"],
  ["whatsapp", "WhatsApp", "Somente números ou formatado"],
  ["city", "Cidade", "Ex.: São Paulo"],
  ["state", "Estado", "Ex.: SP"],
] as const;
type Values = Record<(typeof FIELDS)[number][0], string>;
const EMPTY = Object.fromEntries(FIELDS.map(([k]) => [k, ""])) as Values;

/**
 * hFilterPopover: a draft of text filters; "Aplicar" commits it, closing any other way reverts to
 * the last applied values, so the count always reflects the applied filter.
 */
function FilterPopover() {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(EMPTY);
  const [draft, setDraft] = useState(EMPTY);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const style = useAnchoredPopover(open, ref, panelRef);
  const close = () => {
    setOpen(false);
    setDraft(applied);
  };
  useDismiss(ref, open, close, panelRef);

  const count = Object.values(applied).filter((v) => v.trim()).length;
  const commit = (v: Values) => {
    setApplied(v);
    setDraft(v);
  };

  return (
    <div ref={ref} className="hinline hfilterpop">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${count > 0 ? " is-active" : ""}${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <FunnelIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Filtros</span>
        <span className="hinline-count" style={count > 0 ? undefined : { display: "none" }}>
          {count}
        </span>
        <span className={`hinline-chevron${open ? " is-open" : ""}`} aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open &&
        createPortal(
          <div ref={panelRef} className="hselect-popover hfilterpop-popover" role="dialog" style={style}>
            <p className="hfilterpop-title">Filtrar unidades</p>
            <div className="hfilterpop-grid">
              {FIELDS.map(([key, label, placeholder]) => (
                <div key={key} className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor={`filter-unidade-${key}`}>
                    {label}
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id={`filter-unidade-${key}`}
                      autoComplete="off"
                      className="hinput hinput--sm"
                      type="text"
                      placeholder={placeholder}
                      value={draft[key]}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        commit(draft);
                        setOpen(false);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="hfilterpop-footer">
              {/* "Limpar" applies the cleared filter but keeps the popover open, as the original. */}
              <button type="button" className="hinline-footer-clear" onClick={() => commit(EMPTY)}>
                Limpar
              </button>
              <button
                type="button"
                className="hinline-footer-done"
                onClick={() => {
                  commit(draft);
                  setOpen(false);
                }}
              >
                Aplicar
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** The account has no units: the list, KPIs and filters all stay empty (default empty state). */
export function UnitsList() {
  const [query, setQuery] = useState("");

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="unidade-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por nome, slug, email, telefone ou whatsapp"
              aria-label="Buscar por nome, slug, email, telefone ou whatsapp"
              name="search"
              id="unidade-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <a href={`${ROUTES.adminUnidades}?action=create`} className="hbtn hbtn--primary hbtn--sm">
              <AddAppointmentIcon />
              Nova Unidade
            </a>
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              <FilterPopover />
            </ScrollRail>
          </div>
        </div>
      </form>
      <div id="unidades-active-filters" className="mt-4" />

      <div className="mt-4 hkpi-group">
        {KPIS.map((label) => (
          <div key={label} className="hui-reveal hui-card hui-card--flush hkpi">
            <div className="hkpi-body">
              <p className="hkpi-label">{label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">0</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div id="unidades-table-container">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as React.CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className="htable-col">
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
              </div>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>
    </>
  );
}
