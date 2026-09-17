"use client";

import { useState, type CSSProperties } from "react";
import { ChecklistIcon, CloseCircleIcon, SearchSolidIcon, UsersIcon } from "../shared/icons";
import { InlineFilter } from "../shared/InlineFilter";
import { ROUTES } from "../shared/Sidebar";

const STATUSES = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const TYPES = ["E-mail", "Telefone", "CPF"];
const SLOTS = 10;

// The live account has no blocked contacts, so the table always renders its empty state.
export function BlockLists() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [types, setTypes] = useState<string[]>([]);
  const filtered = Boolean(query.trim()) || status !== "all" || types.length > 0;

  const reset = () => {
    setQuery("");
    setStatus("all");
    setTypes([]);
  };

  return (
    <>
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="suppression-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por contato ou motivo"
              aria-label="Buscar por contato ou motivo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm">
              <CloseCircleIcon className="w-4 h-4" />
              Incluir bloqueio
            </button>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter label="Tipo" icon={<UsersIcon className="hinline-icon w-4 h-4" />} options={TYPES} values={types} onChange={setTypes} />
                <span className="hactionbar-sep" aria-hidden="true" />
                <a href={ROUTES.limitesAgendamentos} className="hbtn hbtn--ghost hbtn--sm">
                  <ChecklistIcon className="w-4 h-4" />
                  Limites de Agendamento
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3 min-w-0">
        <div id="suppression-status-filters" className="hrail min-w-0">
          <div className="hrail-track">
            <div className="htaggroup--nowrap htaggroup">
              {STATUSES.map((s) => (
                <button key={s.value} type="button" className={`htag${s.value === status ? " htag--active" : ""}`} onClick={() => setStatus(s.value)}>
                  {s.label}
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

      <div id="suppression-table-container" className="mt-4">
        <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  <th className="htable-col">Situação</th>
                  <th className="htable-col">Tipo</th>
                  <th className="htable-col">Chave</th>
                  <th className="htable-col">Motivo</th>
                  <th className="htable-col">Incluído em</th>
                  <th className="htable-col">Incluido por</th>
                  <th className="htable-col">Expira em</th>
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
                    <td className="htable-cell" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="htable-empty" role="status" aria-live="polite">
            <div className="hempty hempty--inline hui-reveal">
              <CloseCircleIcon className="hempty-icon" />
              <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum bloqueio encontrado" : "Nenhum bloqueio cadastrado"}</h3>
              <p className="hempty-desc inter-regular">
                {filtered
                  ? "Nenhum bloqueio corresponde aos filtros aplicados. Ajuste a busca ou limpe os filtros."
                  : "Contatos impedidos de agendar por e-mail, telefone ou CPF aparecerão nesta lista."}
              </p>
            </div>
          </div>
          <div className="htable-footer" />
        </div>
      </div>
    </>
  );
}
