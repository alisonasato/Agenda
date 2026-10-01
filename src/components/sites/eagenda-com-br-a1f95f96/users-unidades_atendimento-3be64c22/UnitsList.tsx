"use client";

import { useState } from "react";
import { emptyFilters, FilterPopover, type FilterField } from "../shared/FilterPopover";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { AddAppointmentIcon, CloseCircleIcon, DangerCircleIcon, InboxIcon, PenIcon, SearchSolidIcon, TrashIcon } from "../shared/icons";
import { AlertDialog } from "../shared/AlertDialog";
import { update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import type { Unit } from "@/lib/seiri/types";

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

export function UnitsList() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(() => emptyFilters(FILTERS));
  const [removing, setRemoving] = useState<Unit | null>(null);

  const term = fold(query.trim());
  const hit = (value: string, wanted: string) => (wanted.trim() ? fold(value).includes(fold(wanted.trim())) : true);
  const rows = data.units
    .map((unit) => ({
      unit,
      place: [unit.address.street, unit.address.number, unit.address.city, unit.address.state].filter(Boolean).join(", "),
      contact: [unit.email, unit.phone || unit.whatsapp].filter(Boolean).join(" · "),
      agendas: data.agendas.filter((a) => a.unitId === unit.id),
    }))
    .filter((row) => (term ? fold(`${row.unit.name} ${row.unit.slug} ${row.unit.email} ${row.unit.phone} ${row.unit.whatsapp}`).includes(term) : true))
    .filter(
      (row) =>
        hit(row.unit.name, filters["filter-unidade-name"]) &&
        hit(row.unit.slug, filters["filter-unidade-slug"]) &&
        hit(row.unit.email, filters["filter-unidade-email"]) &&
        hit(row.unit.phone, filters["filter-unidade-phone"]) &&
        hit(row.unit.whatsapp, filters["filter-unidade-whatsapp"]) &&
        hit(row.unit.address.city, filters["filter-unidade-city"]) &&
        hit(row.unit.address.state, filters["filter-unidade-state"]),
    );

  const counts = [rows.length, rows.reduce((total, row) => total + row.agendas.length, 0), rows.filter((row) => row.contact).length];

  // Removing a unit leaves its agendas without one.
  const remove = (id: string) =>
    update((d) => ({
      ...d,
      units: d.units.filter((u) => u.id !== id),
      agendas: d.agendas.map((a) => (a.unitId === id ? { ...a, unitId: undefined } : a)),
    }));

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
        {KPIS.map((label, i) => (
          <div key={label} className="hui-reveal hui-card hui-card--flush hkpi">
            <div className="hkpi-body">
              <p className="hkpi-label">{label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">{counts[i]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div id="unidades-table-container">
          <div
            className={`htable${rows.length ? "" : " htable-is-empty"}`}
            style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as React.CSSProperties}
          >
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
                  {rows.map((row) => (
                    <tr key={row.unit.id}>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-900 font-semibold inter-semibold">{row.unit.name}</span>
                      </td>
                      <td className="htable-cell">
                        {row.place ? (
                          <span className="text-sm text-gray-600 inter-regular">{row.place}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="htable-cell">
                        {row.contact ? (
                          <span className="text-sm text-gray-600 inter-regular">{row.contact}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="htable-cell">
                        {row.agendas.length ? (
                          <span className="hchip hchip--default hchip--soft hchip--sm">{row.agendas.map((a) => a.name).join(", ")}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`${ROUTES.adminUnidades}/?id=${row.unit.id}`} className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Unidade">
                            <PenIcon className="w-4 h-4" />
                          </a>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir Unidade" onClick={() => setRemoving(row.unit)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <InboxIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                  <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>
      {removing && (
        <AlertDialog
          id="unit-delete-dialog"
          heading="Excluir unidade"
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
          As agendas ligadas a ela ficam sem unidade.
        </AlertDialog>
      )}
    </>
  );
}
