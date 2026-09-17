"use client";

import { useState, type CSSProperties } from "react";
import { CalendarIcon, CloseCircleIcon, SearchSolidIcon, UsersIcon, WidgetIcon } from "../shared/icons";
import { InlineFilter } from "../shared/InlineFilter";

const AGENDAS: string[] = [];
const SERVICES = ["Agenda Principal"];
const SLOTS = 10;

// The live account has no access lists, so the table always renders its empty state.
export function ClientAccessLists() {
  const [query, setQuery] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const filtered = Boolean(query.trim()) || agendas.length > 0 || services.length > 0;

  const reset = () => {
    setQuery("");
    setAgendas([]);
    setServices([]);
  };

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="acl-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por nome ou email do cliente"
              aria-label="Buscar por nome ou email do cliente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm">
              <UsersIcon className="w-4 h-4" />
              Nova Lista
            </button>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter label="Agenda" icon={<CalendarIcon className="hinline-icon w-4 h-4" />} options={AGENDAS} values={agendas} onChange={setAgendas} />
                <InlineFilter label="Serviço" icon={<WidgetIcon className="hinline-icon w-4 h-4" />} options={SERVICES} values={services} onChange={setServices} />
                <span className="hactionbar-sep" aria-hidden="true" />
                <a href="#" className="hbtn hbtn--ghost hbtn--sm">
                  <UsersIcon className="w-4 h-4" />
                  <span className="hactionbar-label">Gestão Individual</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6 md:mt-8 hui-reveal">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              <CloseCircleIcon className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        <div id="acl-table-container">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Lista</th>
                    <th className="htable-col">Configurações</th>
                    <th className="htable-col">Permissões</th>
                    <th className="htable-col">Clientes</th>
                    <th className="htable-col">Limites</th>
                    <th className="htable-col">Status</th>
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
                <UsersIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum resultado encontrado" : "Nada por aqui ainda"}</h3>
                <p className="hempty-desc inter-regular">
                  {filtered
                    ? "Nenhum registro corresponde aos filtros aplicados. Ajuste ou limpe os filtros para ver mais resultados."
                    : "Assim que houver registros, eles aparecerão nesta tabela."}
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
