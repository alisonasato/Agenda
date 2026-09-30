"use client";

import { useState, type CSSProperties } from "react";
import { ChecklistIcon, CloseCircleIcon, DangerCircleIcon, PenIcon, PowerIcon, SearchSolidIcon, TrashIcon, UsersIcon } from "../shared/icons";
import { AlertDialog } from "../shared/AlertDialog";
import { SuppressionModal, showStamp } from "./SuppressionModal";
import { update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import { BLOCK_TYPES, type Suppression } from "@/lib/seiri/types";
import { InlineFilter } from "../shared/InlineFilter";
import { ROUTES } from "../shared/Sidebar";

const STATUSES = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const TYPES = BLOCK_TYPES.map((t) => t.label);
const SLOTS = 10;

export function BlockLists() {
  const data = useData();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Suppression | null>(null);
  const [removing, setRemoving] = useState<Suppression | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [types, setTypes] = useState<string[]>([]);
  const filtered = Boolean(query.trim()) || status !== "all" || types.length > 0;
  const term = fold(query.trim());
  const rows = data.suppressions
    .map((entry) => ({ entry, typeLabel: BLOCK_TYPES.find((t) => t.value === entry.type)?.label ?? entry.type }))
    .filter((row) => (term ? fold(`${row.entry.contact} ${row.entry.reason}`).includes(term) : true))
    .filter((row) => (status === "all" ? true : status === "active" ? row.entry.active : !row.entry.active))
    .filter((row) => (types.length ? types.includes(row.typeLabel) : true));

  const toggle = (id: string) => update((d) => ({ ...d, suppressions: d.suppressions.map((s) => (s.id === id ? { ...s, active: !s.active } : s)) }));
  const remove = (id: string) => update((d) => ({ ...d, suppressions: d.suppressions.filter((s) => s.id !== id) }));

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
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
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
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                {rows.map((row) => (
                  <tr key={row.entry.id}>
                    <td className="htable-cell whitespace-nowrap">
                      <span className={`hchip hchip--${row.entry.active ? "success" : "default"} hchip--primary hchip--sm`}>
                        {row.entry.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">{row.typeLabel}</td>
                    <td className="htable-cell">{row.entry.contact}</td>
                    <td className="htable-cell">{row.entry.reason || "—"}</td>
                    <td className="htable-cell whitespace-nowrap">{row.entry.createdAt}</td>
                    <td className="htable-cell whitespace-nowrap">{row.entry.createdBy}</td>
                    <td className="htable-cell whitespace-nowrap">{showStamp(row.entry.expiresAt)}</td>
                    <td className="htable-cell htable-cell--end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="btn-icon btn-icon-sm btn-icon-flat"
                          title={row.entry.active ? "Desativar" : "Reativar"}
                          onClick={() => toggle(row.entry.id)}
                        >
                          <PowerIcon className="w-4 h-4" />
                        </button>
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(row.entry)}>
                          <PenIcon className="w-4 h-4" />
                        </button>
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(row.entry)}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
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
          {!rows.length && (
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
          )}
          <div className="htable-footer" />
        </div>
      </div>

      {creating && <SuppressionModal onClose={() => setCreating(false)} />}
      {editing && <SuppressionModal entry={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="suppression-delete-dialog"
          heading="Excluir bloqueio"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="hbtn hbtn--danger"
                onClick={() => {
                  remove(removing.id);
                  setRemoving(null);
                }}
              >
                Excluir
              </button>
            </>
          }
        >
          Esse contato volta a poder agendar.
        </AlertDialog>
      )}
    </>
  );
}
