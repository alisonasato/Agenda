"use client";

import { useState, type CSSProperties } from "react";
import { CalendarIcon, ChecklistIcon, ChevronRightIcon, CloseCircleIcon, DangerCircleIcon, PenIcon, TrashIcon, WidgetIcon } from "../shared/icons";
import { InlineFilter } from "../shared/InlineFilter";
import { AlertDialog } from "../shared/AlertDialog";
import { ROUTES } from "../shared/Sidebar";
import { LimitModal } from "./LimitModal";
import { update, useData } from "@/lib/seiri/store";
import { intervalLabel, keyLabel } from "@/lib/seiri/limits";
import { LIMIT_INTERVALS, type BookingLimit } from "@/lib/seiri/types";

const TYPES = [
  { value: "all", label: "Todos" },
  { value: "AGENDAMENTOS", label: "Agendamentos" },
  { value: "FALTAS", label: "Faltas" },
];

const INTERVALS = LIMIT_INTERVALS.map((i) => i.label);

const SLOTS = 10;

export function BookingLimits() {
  const data = useData();
  const [type, setType] = useState("all");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [intervals, setIntervals] = useState<string[]>([]);
  const [editing, setEditing] = useState<BookingLimit | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<BookingLimit | null>(null);
  const filtered = type !== "all" || agendas.length > 0 || services.length > 0 || intervals.length > 0;

  const reset = () => {
    setType("all");
    setAgendas([]);
    setServices([]);
    setIntervals([]);
  };

  const names = (ids: string[], all: { id: string; name: string }[], empty: string) =>
    ids.length ? ids.map((id) => all.find((row) => row.id === id)?.name ?? id).join(", ") : empty;

  const rows = data.limits
    .map((limit) => ({
      limit,
      agendaNames: names(limit.agendaIds, data.agendas, "Todas"),
      serviceNames: names(limit.serviceIds, data.services, "Todos"),
      interval: intervalLabel(limit),
    }))
    .filter((row) => (type === "all" ? true : row.limit.type === type))
    .filter((row) => (agendas.length ? agendas.some((name) => row.agendaNames === "Todas" || row.agendaNames.includes(name)) : true))
    .filter((row) => (services.length ? services.some((name) => row.serviceNames === "Todos" || row.serviceNames.includes(name)) : true))
    .filter((row) => (intervals.length ? intervals.some((label) => row.interval.endsWith(label) || row.interval === label) : true));

  const remove = (id: string) => update((d) => ({ ...d, limits: d.limits.filter((l) => l.id !== id) }));

  return (
    <>
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <ChecklistIcon className="w-4 h-4" />
              Adicionar Limite
            </button>
            <a href={ROUTES.listasBloqueio} className="hbtn hbtn--secondary hbtn--sm">
              <CloseCircleIcon className="w-4 h-4" />
              Listas de Bloqueio
            </a>
          </div>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter
                  label="Agenda"
                  icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
                  options={data.agendas.map((a) => a.name)}
                  values={agendas}
                  onChange={setAgendas}
                />
                <InlineFilter
                  label="Serviço"
                  icon={<WidgetIcon className="hinline-icon w-4 h-4" />}
                  options={data.services.map((s) => s.name)}
                  values={services}
                  onChange={setServices}
                />
                <InlineFilter
                  label="Intervalo"
                  icon={<ChecklistIcon className="hinline-icon w-4 h-4" />}
                  options={INTERVALS}
                  values={intervals}
                  onChange={setIntervals}
                />
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
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                  {rows.map((row) => (
                    <tr key={row.limit.id} className="htable-row">
                      <td className="htable-cell whitespace-nowrap">{row.limit.type}</td>
                      <td className="htable-cell">{keyLabel(row.limit)}</td>
                      <td className="htable-cell">{row.agendaNames}</td>
                      <td className="htable-cell">{row.serviceNames}</td>
                      <td className="htable-cell whitespace-nowrap">{row.interval}</td>
                      <td className="htable-cell htable-cell--end">{row.limit.max}</td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(row.limit)}>
                          <PenIcon className="w-4 h-4" />
                        </button>
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(row.limit)}>
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
                  <ChecklistIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum limite encontrado" : "Nenhum limite configurado"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered
                      ? "Nenhum limite corresponde aos filtros aplicados. Ajuste ou limpe os filtros."
                      : "Adicione um limite para controlar o volume de agendamentos e faltas dos clientes."}
                  </p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {creating && <LimitModal onClose={() => setCreating(false)} />}
      {editing && <LimitModal limit={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="limite-delete-dialog"
          heading="Excluir limite"
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
          Este limite deixa de valer para novos agendamentos. Os agendamentos já criados não mudam.
        </AlertDialog>
      )}
    </>
  );
}
