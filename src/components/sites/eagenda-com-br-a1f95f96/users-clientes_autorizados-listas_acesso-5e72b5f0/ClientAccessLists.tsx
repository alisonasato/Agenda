"use client";

import { useState, type CSSProperties } from "react";
import { ROUTES } from "../shared/Sidebar";
import { CalendarIcon, CloseCircleIcon, SearchSolidIcon, UsersIcon, WidgetIcon } from "../shared/icons";
import { InlineFilter } from "../shared/InlineFilter";
import { AlertDialog } from "../shared/AlertDialog";
import { AccessListModal } from "./AccessListModal";
import { DangerCircleIcon, PenIcon, TrashIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import { ACCESS_INTERVALS, ACCESS_KEY_TYPES, type AccessList } from "@/lib/seiri/types";

const SLOTS = 10;

export function ClientAccessLists() {
  const data = useData();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AccessList | null>(null);
  const [removing, setRemoving] = useState<AccessList | null>(null);
  const [query, setQuery] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const filtered = Boolean(query.trim()) || agendas.length > 0 || services.length > 0;
  const AGENDAS = data.agendas.map((a) => a.name);
  const SERVICES = data.services.map((s) => s.name);
  const term = fold(query.trim());
  const named = (ids: string[], all: { id: string; name: string }[], every: string) =>
    ids.length ? ids.map((id) => all.find((row) => row.id === id)?.name ?? id).join(", ") : every;
  const rows = data.accessLists
    .map((list) => ({
      list,
      key: ACCESS_KEY_TYPES.find((k) => k.value === list.keyType)?.label ?? list.keyType,
      interval: list.interval === "NDAYS" ? `${list.days} dias corridos` : (ACCESS_INTERVALS.find((i) => i.value === list.interval)?.label ?? "—"),
      agendaNames: named(list.agendaIds, data.agendas, "Todas"),
      serviceNames: named(list.serviceIds, data.services, "Todos"),
    }))
    .filter((row) => (term ? fold(row.list.title).includes(term) : true))
    .filter((row) => (agendas.length ? row.agendaNames === "Todas" || agendas.some((n) => row.agendaNames.includes(n)) : true))
    .filter((row) => (services.length ? row.serviceNames === "Todos" || services.some((n) => row.serviceNames.includes(n)) : true));

  const remove = (id: string) => update((d) => ({ ...d, accessLists: d.accessLists.filter((l) => l.id !== id) }));

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
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <UsersIcon className="w-4 h-4" />
              Nova Lista
            </button>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter
                  label="Agenda"
                  icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
                  options={AGENDAS}
                  values={agendas}
                  onChange={setAgendas}
                />
                <InlineFilter
                  label="Serviço"
                  icon={<WidgetIcon className="hinline-icon w-4 h-4" />}
                  options={SERVICES}
                  values={services}
                  onChange={setServices}
                />
                <span className="hactionbar-sep" aria-hidden="true" />
                <a href={ROUTES.acessoIndividual} className="hbtn hbtn--ghost hbtn--sm">
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
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                  {rows.map((row) => (
                    <tr key={row.list.id}>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-900 font-semibold inter-semibold">{row.list.title}</span>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--default hchip--soft hchip--sm">{row.key}</span>
                      </td>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-600 inter-regular">
                          {row.agendaNames} · {row.serviceNames}
                        </span>
                      </td>
                      <td className="htable-cell htable-cell--num">{row.list.clientIds.length}</td>
                      <td className="htable-cell whitespace-nowrap">{row.list.maxAppointments ? `${row.list.maxAppointments} · ${row.interval}` : "—"}</td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className={`hchip ${row.list.active ? "hchip--success" : "hchip--default"} hchip--primary hchip--sm`}>
                          {row.list.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Lista" onClick={() => setEditing(row.list)}>
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir Lista" onClick={() => setRemoving(row.list)}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
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
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>
      {creating && <AccessListModal onClose={() => setCreating(false)} />}
      {editing && <AccessListModal list={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="acl-delete-dialog"
          heading="Excluir lista"
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
          Os clientes dela perdem o acesso que ela dava.
        </AlertDialog>
      )}
    </>
  );
}
