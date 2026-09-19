"use client";

import { useState, type CSSProperties } from "react";
import { emptyFilters, FilterPopover, type FilterField } from "../shared/FilterPopover";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { AddAppointmentIcon, CloseCircleIcon, InboxIcon, RefreshIcon, SearchSolidIcon } from "../shared/icons";

const KPIS = ["Sub-contas", "Usuários ativos", "Total agendas", "Próximos 30 dias"];
/** [label, numeric column]. */
const COLUMNS: [string, boolean][] = [
  ["Conta", false],
  ["Usuários", true],
  ["Agendas", true],
  ["Próx. 30 dias", true],
  ["Assinatura", false],
  ["Contato", false],
];
const SLOTS = 10;

const FILTERS: FilterField[] = [
  ["accounts-filter-address", "Endereço", "Cidade, bairro ou rua"],
  ["accounts-filter-name", "Nome", "Ex.: Clínica Centro"],
  ["accounts-filter-label", "Sigla (link)", "Ex.: clinica-centro"],
  ["accounts-filter-service", "Serviço", "Ex.: Odontologia"],
  ["accounts-filter-email", "E-mail", "email@exemplo.com"],
  ["accounts-filter-phone", "Telefone", "Ex.: 11999998888"],
  ["accounts-filter-city", "Cidade", "Ex.: São Paulo"],
  ["accounts-filter-state", "Estado", "Ex.: SP"],
];

/** Quick filters: [value, tag label, active-filter chip label]. */
const STATUS = [
  ["", "Todos", ""],
  ["active", "Ativo", "Ativo"],
  ["expired", "Expirado", "Expirado"],
  ["inactive", "Sem plano", "Sem plano"],
] as const;
const ACTIVITY = [
  ["", "Todos", ""],
  ["recent", "Ativo 7d", "Ativo (últimos 7 dias)"],
  ["inactive", "Inativo 7d", "Inativo (últimos 7 dias)"],
] as const;
type Status = (typeof STATUS)[number][0];
type Activity = (typeof ACTIVITY)[number][0];

function TagGroup<T extends string>({ items, value, onChange }: { items: readonly (readonly [T, string, string])[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="htaggroup">
      {items.map(([v, label]) => (
        <button key={v} type="button" className={`htag${value === v ? " htag--active" : ""}`} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Sub-accounts of the organization. The account has none, so every filter ends on the default
 * empty state (as the live page does); active filters show as removable "Mostrando:" chips.
 */
export function AccountsList() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(() => emptyFilters(FILTERS));
  const [status, setStatus] = useState<Status>("");
  const [activity, setActivity] = useState<Activity>("");

  const reset = () => {
    setQuery("");
    setFilters(emptyFilters(FILTERS));
    setStatus("");
    setActivity("");
  };

  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (query.trim()) chips.push({ key: "search", label: `Busca global: ${query.trim()}`, remove: () => setQuery("") });
  for (const [id, label] of FILTERS) {
    const v = filters[id].trim();
    if (v) chips.push({ key: id, label: `${label}: ${v}`, remove: () => setFilters({ ...filters, [id]: "" }) });
  }
  if (status) chips.push({ key: "status", label: `Assinatura: ${STATUS.find(([v]) => v === status)![2]}`, remove: () => setStatus("") });
  if (activity) chips.push({ key: "activity", label: `Atividade: ${ACTIVITY.find(([v]) => v === activity)![2]}`, remove: () => setActivity("") });

  return (
    <>
      <div className="hkpi-group">
        {KPIS.map((label) => (
          <div key={label} className="hui-card hui-card--flush hkpi">
            <div className="hkpi-body">
              <p className="hkpi-label">{label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">0</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form id="formFilter" className="mt-6 hui-reveal" style={{ animationDelay: ".04s" }} onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="accounts-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Nome, sigla, serviço ou contato"
              aria-label="Nome, sigla, serviço ou contato"
              name="search"
              id="accounts-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <a href={ROUTES.novaConta} className="hbtn hbtn--primary hbtn--sm">
              <AddAppointmentIcon />
              Adicionar conta
            </a>
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              <FilterPopover title="Filtrar contas" fields={FILTERS} value={filters} onChange={setFilters} />
            </ScrollRail>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 min-w-0">
          <div id="accounts-quick-filters" className="flex flex-wrap items-center gap-3 min-w-0">
            <TagGroup items={STATUS} value={status} onChange={setStatus} />
            <TagGroup items={ACTIVITY} value={activity} onChange={setActivity} />
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              <RefreshIcon />
              Limpar filtros
            </button>
          </div>
        </div>
      </form>

      <div id="accounts-active-filters" className="mt-4">
        <div>
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="htaggroup">
                <span className="htaggroup-label">Mostrando:</span>
                {chips.map((c) => (
                  <span key={c.key} className="htag">
                    <span className="htag-label">{c.label}</span>
                    <a
                      href="#"
                      className="htag-remove"
                      aria-label="remover"
                      onClick={(e) => {
                        e.preventDefault();
                        c.remove();
                      }}
                    >
                      <CloseCircleIcon className="w-3 h-3" />
                    </a>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".08s" }}>
        <div id="accounts-table-container">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map(([c, num]) => (
                      <th key={c} className={`htable-col${num ? " htable-col--num htable-col--end" : ""}`}>
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
