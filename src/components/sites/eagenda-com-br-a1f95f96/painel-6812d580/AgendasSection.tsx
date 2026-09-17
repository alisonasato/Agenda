"use client";

import { useState } from "react";
import { CalendarDays, CalendarPlus, CalendarRange, Activity } from "lucide-react";
import { CalendarIcon, CloseCircleIcon, SearchSolidIcon, SettingsIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";

type Agenda = { name: string; today: number; tomorrow: number; next7: number; occupancy: string; active: boolean };

// Mock data (the live page shows the signed-in account's agendas).
const AGENDAS: Agenda[] = [
  { name: "Agenda Principal", today: 0, tomorrow: 0, next7: 0, occupancy: "Sem horários disponíveis", active: true },
];
const SLOTS = 5;

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function StatusChip({ active }: { active: boolean }) {
  return (
    <span className={`hchip ${active ? "hchip--success" : "hchip--danger"} hchip--primary hchip--sm`}>{active ? "Ativo" : "Inativo"}</span>
  );
}

function EmptyCells() {
  return (
    <tr className="htable-row--empty" aria-hidden="true">
      <td className="htable-cell" />
      <td className="htable-cell" />
      <td className="htable-cell hidden md:table-cell" />
      <td className="htable-cell hidden lg:table-cell" />
      <td className="htable-cell hidden xl:table-cell" />
      <td className="htable-cell hidden sm:table-cell" />
      <td className="htable-cell" />
    </tr>
  );
}

function Actions({ small }: { small?: boolean }) {
  const size = small ? " btn-icon-sm" : "";
  return (
    <>
      <a href={ROUTES.calendario} title="Ver Agenda" className={`btn-icon btn-icon-solid${size}`}>
        <CalendarIcon className="w-4 h-4" />
      </a>
      <a href="#" title="Configurar Agenda" className={`btn-icon btn-icon-flat${size} group/btn`}>
        <SettingsIcon className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
      </a>
    </>
  );
}

export function AgendasSection() {
  const [query, setQuery] = useState("");
  const rows = AGENDAS.filter((a) => norm(a.name).includes(norm(query.trim())));

  return (
    <div className="mt-6 md:mt-8 hui-reveal">
      <section>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Minhas Agendas de Atendimento</h2>
            <p className="hwidget-desc">Gerencie suas agendas e monitore a ocupação</p>
          </div>
          <div className="hwidget-actions">
            <a href="#" className="hbtn hbtn--secondary">
              <SettingsIcon />
              <span className="hidden sm:inline">Painel Configuração</span>
              <span className="sm:hidden">Configurar</span>
            </a>
          </div>
        </div>

        <div className="mb-4">
          <div className="hgrid-toolbar">
            <label className={`hui-search hgrid-toolbar-search${query ? " has-query" : ""}`}>
              <span className="hui-search-icon">
                <SearchSolidIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                className="hui-search-input"
                name="busca_agendas"
                placeholder="Buscar agendas pelo nome..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="button" className="hui-search-clear" aria-label="Limpar" onClick={() => setQuery("")}>
                <CloseCircleIcon className="w-4 h-4" />
              </button>
            </label>
            <div className="hgrid-toolbar-filters" />
          </div>
        </div>

        <div className="hidden md:block htable">
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  <th className="htable-col">Agenda</th>
                  <th className="htable-col">Hoje</th>
                  <th className="htable-col hidden md:table-cell">Amanhã</th>
                  <th className="htable-col hidden lg:table-cell">Próx 7 dias</th>
                  <th className="htable-col hidden xl:table-cell">Taxa Ocupação</th>
                  <th className="htable-col hidden sm:table-cell">Status</th>
                  <th className="htable-col htable-col--end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.name} className="group">
                    <td className="htable-cell">
                      <a href={ROUTES.calendario} className="text-gray-900 hover:text-primary transition-colors duration-200">
                        <div className="font-semibold text-sm md:text-base inter-semibold truncate">{a.name}</div>
                      </a>
                    </td>
                    <td className="htable-cell htable-cell--num">
                      <a href="#" className="font-semibold text-gray-900 hover:text-primary transition-colors duration-200 inter-semibold">
                        {a.today}
                      </a>
                    </td>
                    <td className="htable-cell htable-cell--num hidden md:table-cell">
                      <span className="font-semibold text-gray-900 inter-semibold">{a.tomorrow}</span>
                    </td>
                    <td className="htable-cell htable-cell--num hidden lg:table-cell">
                      <span className="font-semibold text-gray-900 inter-semibold">{a.next7}</span>
                    </td>
                    <td className="htable-cell hidden xl:table-cell">
                      <span className="hchip hchip--danger hchip--primary hchip--sm">{a.occupancy}</span>
                    </td>
                    <td className="htable-cell hidden sm:table-cell">
                      <StatusChip active={a.active} />
                    </td>
                    <td className="htable-cell htable-cell--end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Actions small />
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length > 0 && Array.from({ length: SLOTS - rows.length }, (_, i) => <EmptyCells key={i} />)}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <SearchSolidIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nenhum resultado encontrado</h3>
                <p className="hempty-desc inter-regular">
                  Nenhum registro corresponde aos filtros aplicados. Ajuste ou limpe os filtros para ver mais resultados.
                </p>
              </div>
            </div>
          )}
          <div className="htable-footer" />
        </div>

        <div className="block md:hidden">
          <div className="space-y-4">
            {rows.map((a) => (
              <div key={a.name} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <a href={ROUTES.calendario} className="text-gray-900 hover:text-primary transition-colors duration-200">
                      <h3 className="font-bold text-base text-gray-900 alatsi-regular mb-1">{a.name}</h3>
                    </a>
                  </div>
                  <div className="ml-3">
                    <StatusChip active={a.active} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: "Hoje", icon: CalendarDays, value: a.today },
                    { label: "Amanhã", icon: CalendarPlus, value: a.tomorrow },
                    { label: "Próx 7 dias", icon: CalendarRange, value: a.next7 },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <s.icon strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600 inter-semibold">{s.label}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900 alatsi-regular">{s.value}</span>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 inter-semibold">Taxa Ocupação</span>
                    </div>
                    <span className="hchip hchip--danger hchip--primary hchip--sm">{a.occupancy}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 inter-regular">Ações disponíveis</span>
                  <div className="flex items-center gap-2">
                    <Actions />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
