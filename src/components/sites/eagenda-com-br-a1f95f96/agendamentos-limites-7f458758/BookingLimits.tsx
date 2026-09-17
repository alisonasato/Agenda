"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  CalendarIcon,
  CaretDownIcon,
  CheckReadIcon,
  ChecklistIcon,
  ChevronRightIcon,
  CloseCircleIcon,
  SearchSolidIcon,
  WidgetIcon,
} from "../shared/icons";

import { useDismiss } from "../shared/useDismiss";

const TYPES = [
  { value: "all", label: "Todos" },
  { value: "AGENDAMENTOS", label: "Agendamentos" },
  { value: "FALTAS", label: "Faltas" },
];

const AGENDAS = ["Agenda Principal"];
const SERVICES: string[] = [];
const INTERVALS = ["POR HORÁRIOS", "POR DIA", "POR SEMANA", "POR MÊS", "DIAS CORRIDOS"];

const SLOTS = 10;

/** Trigger + searchable popover, the same widget the other list pages use. */
function InlineFilter({
  label,
  icon,
  options,
  values,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const hits = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} className="hinline">
      <button type="button" className="hinline-trigger hinline-trigger--bare" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {icon}
        <span className="hinline-label">{label}</span>
        {values.length > 0 && <span className="hinline-count">{values.length}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hinline-popover" style={{ width: 240 }}>
          <div className="hinline-search-wrap">
            <SearchSolidIcon className="hinline-search-icon w-4 h-4" />
            <input type="text" placeholder="Buscar..." className="hinline-search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <ul className="hautocomplete-options" role="listbox">
            {hits.length === 0 ? (
              <li className="hautocomplete-state">
                <div className="hautocomplete-state-inner">
                  <SearchSolidIcon className="w-4 h-4" />
                  <span>Nenhum resultado encontrado</span>
                </div>
              </li>
            ) : (
              hits.map((o) => {
                const selected = values.includes(o);
                return (
                  <li key={o}>
                    <button
                      type="button"
                      className="hselect-option hautocomplete-option"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onChange(selected ? values.filter((v) => v !== o) : [...values, o])}
                    >
                      <span className="hautocomplete-option-check">{selected && <CheckReadIcon className="w-3 h-3" />}</span>
                      <span className="hautocomplete-option-content">
                        <span className="hselect-option-label">{o}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="hinline-footer">
            {values.length > 0 ? (
              <button type="button" className="hinline-footer-clear" onClick={() => onChange([])}>
                Limpar
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <button type="button" className="hinline-footer-done" onClick={() => setOpen(false)}>
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// The live account has no limits configured, so the table always renders its empty state.
export function BookingLimits() {
  const [type, setType] = useState("all");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [intervals, setIntervals] = useState<string[]>([]);
  const filtered = type !== "all" || agendas.length > 0 || services.length > 0 || intervals.length > 0;

  const reset = () => {
    setType("all");
    setAgendas([]);
    setServices([]);
    setIntervals([]);
  };

  return (
    <>
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm">
              <ChecklistIcon className="w-4 h-4" />
              Adicionar Limite
            </button>
            <a href="#" className="hbtn hbtn--secondary hbtn--sm">
              <CloseCircleIcon className="w-4 h-4" />
              Listas de Bloqueio
            </a>
          </div>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter label="Agenda" icon={<CalendarIcon className="hinline-icon w-4 h-4" />} options={AGENDAS} values={agendas} onChange={setAgendas} />
                <InlineFilter label="Serviço" icon={<WidgetIcon className="hinline-icon w-4 h-4" />} options={SERVICES} values={services} onChange={setServices} />
                <InlineFilter label="Intervalo" icon={<ChecklistIcon className="hinline-icon w-4 h-4" />} options={INTERVALS} values={intervals} onChange={setIntervals} />
              </div>
              <button type="button" className="hrail-arrow hrail-arrow--next" tabIndex={-1} aria-label="Rolar para o fim">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3 min-w-0">
        <div id="limits-type-filters" className="hrail min-w-0">
          <div className="hrail-track">
            <div className="htaggroup--nowrap htaggroup">
              {TYPES.map((t) => (
                <button key={t.value} type="button" className={`htag${t.value === type ? " htag--active" : ""}`} onClick={() => setType(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
            <CloseCircleIcon className="w-4 h-4" />
            Limpar filtros
          </button>
        </div>
      </div>

      <div id="limites-sections-container" className="mt-4">
        <div className="space-y-3">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Tipo</th>
                    <th className="htable-col">Chave</th>
                    <th className="htable-col">Agenda(s)</th>
                    <th className="htable-col">Serviço(s)</th>
                    <th className="htable-col">Intervalo</th>
                    <th className="htable-col htable-col--end">Qtd.</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <ChecklistIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum limite encontrado" : "Nenhum limite configurado"}</h3>
                <p className="hempty-desc inter-regular">
                  {filtered
                    ? "Nenhum limite corresponde aos filtros aplicados. Ajuste ou limpe os filtros."
                    : "Adicione um limite para controlar o volume de agendamentos e faltas dos clientes."}
                </p>
              </div>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>
    </>
  );
}

