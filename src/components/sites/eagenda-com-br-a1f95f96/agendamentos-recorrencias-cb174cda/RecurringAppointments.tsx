"use client";

import { useState, type CSSProperties } from "react";
import { CalendarIcon, CalendarAddIcon, ChevronRightIcon, CloseCircleIcon, SearchSolidIcon, WidgetIcon } from "../shared/icons";
import { InlineFilter } from "../shared/InlineFilter";
import { RecurrenceModal } from "./RecurrenceModal";
import { TrashIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";

const SLOTS = 10;

// The live account has no recurrences, so the table always renders its empty state.
export function RecurringAppointments() {
  const data = useData();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const filtered = Boolean(query.trim()) || agendas.length > 0 || services.length > 0 || tags.length > 0;
  const AGENDAS = data.agendas.map((a) => a.name);
  const SERVICES = data.services.map((s) => s.name);
  const TAGS = data.tags.map((t) => t.name);
  const term = fold(query.trim());
  const today = new Date().toISOString().slice(0, 10);
  const rows = data.recurrences
    .map((rule) => {
      const born = data.appointments.filter((a) => a.recurrenceId === rule.id);
      return {
        rule,
        agenda: data.agendas.find((a) => a.id === rule.agendaId)?.name ?? "—",
        service: data.services.find((s) => s.id === rule.serviceId)?.name ?? "—",
        total: born.length,
        upcoming: born.filter((a) => a.start.slice(0, 10) >= today).length,
      };
    })
    .filter((row) => (term ? fold(`${row.rule.code} ${row.rule.label}`).includes(term) : true))
    .filter((row) => (agendas.length ? agendas.includes(row.agenda) : true))
    .filter((row) => (services.length ? services.includes(row.service) : true))
    .filter((row) => (tags.length ? row.rule.tagIds.some((id) => tags.includes(data.tags.find((t) => t.id === id)?.name ?? "")) : true));
  /** Removing a rule takes its future appointments with it, leaving the past ones. */
  const remove = (id: string) =>
    update((d) => ({
      ...d,
      recurrences: d.recurrences.filter((r) => r.id !== id),
      appointments: d.appointments.filter((a) => a.recurrenceId !== id || a.start.slice(0, 10) < today),
    }));

  const reset = () => {
    setQuery("");
    setAgendas([]);
    setServices([]);
    setTags([]);
  };

  return (
    <>
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="rec-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por identificador"
              aria-label="Buscar por identificador"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <CalendarAddIcon className="w-4 h-4" />
              Novo Agendamento Recorrente
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
                <InlineFilter label="Tag" icon={<WidgetIcon className="hinline-icon w-4 h-4" />} options={TAGS} values={tags} onChange={setTags} />
              </div>
              <button type="button" className="hrail-arrow hrail-arrow--next" tabIndex={-1} aria-label="Rolar para o fim">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3 min-w-0">
        <h2 className="text-base md:text-lg text-gray-900 nunito-bold flex items-center gap-2">Recorrências</h2>
        <div className="ml-auto flex-shrink-0">
          <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
            <CloseCircleIcon className="w-4 h-4" />
            Limpar filtros
          </button>
        </div>
      </div>

      <div id="recorrencias-table-container" className="mt-4">
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  <th className="htable-col">Criado Em</th>
                  <th className="htable-col">Identificador</th>
                  <th className="htable-col">Agenda</th>
                  <th className="htable-col">Serviço</th>
                  <th className="htable-col htable-col--end">Total</th>
                  <th className="htable-col htable-col--end">Futuros</th>
                  <th className="htable-col htable-col--end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rule.id} className="htable-row">
                    <td className="htable-cell whitespace-nowrap">{row.rule.createdAt}</td>
                    <td className="htable-cell">{row.rule.label || row.rule.code}</td>
                    <td className="htable-cell">{row.agenda}</td>
                    <td className="htable-cell">{row.service}</td>
                    <td className="htable-cell htable-cell--end">{row.total}</td>
                    <td className="htable-cell htable-cell--end">{row.upcoming}</td>
                    <td className="htable-cell htable-cell--end whitespace-nowrap">
                      <a href={`${ROUTES.agendamentos}/?interval=all`} className="btn-icon btn-icon-sm btn-icon-flat" title="Ver agendamentos">
                        <CalendarIcon className="w-4 h-4" />
                      </a>
                      <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => remove(row.rule.id)}>
                        <TrashIcon className="w-4 h-4" />
                      </button>
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
                <CalendarIcon className="hempty-icon" />
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
      {creating && <RecurrenceModal onClose={() => setCreating(false)} />}
    </>
  );
}
