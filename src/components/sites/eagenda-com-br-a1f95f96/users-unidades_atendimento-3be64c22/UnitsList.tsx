"use client";

import { useState } from "react";
import { emptyFilters, FilterPopover, type FilterField } from "../shared/FilterPopover";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { AddAppointmentIcon, CloseCircleIcon, InboxIcon, SearchSolidIcon } from "../shared/icons";

const COLUMNS = ["Unidade", "Endereço", "Contato", "Agendas"];
const SLOTS = 10;
const KPIS = ["Unidades", "Agendas vinculadas", "Com contato"];

const FILTERS: FilterField[] = [
  ["filter-unidade-name", "Nome da Unidade", "Ex.: Unidade Centro"],
  ["filter-unidade-slug", "Slug", "Ex.: unidade-centro"],
  ["filter-unidade-email", "Email", "Ex.: unidade@email.com"],
  ["filter-unidade-phone", "Telefone", "Com ou sem máscara"],
  ["filter-unidade-whatsapp", "WhatsApp", "Somente números ou formatado"],
  ["filter-unidade-city", "Cidade", "Ex.: São Paulo"],
  ["filter-unidade-state", "Estado", "Ex.: SP"],
];

/** The account has no units: the list, KPIs and filters all stay empty (default empty state). */
export function UnitsList() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(() => emptyFilters(FILTERS));

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
              <FilterPopover title="Filtrar unidades" fields={FILTERS} value={filters} onChange={setFilters} />
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
