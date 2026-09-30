"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { CalendarAddIcon, CalendarIcon, DangerCircleIcon, PenIcon, TrashIcon } from "../shared/icons";
import { AlertDialog } from "../shared/AlertDialog";
import { AgendaHolidaysModal, HolidayFormModal, showDay } from "./HolidayModals";
import { update, useData } from "@/lib/seiri/store";
import { NATIONAL_HOLIDAYS, rulesOf } from "@/lib/seiri/holidays";
import type { Agenda, Holiday } from "@/lib/seiri/types";

const EMPTY_TITLE = "Nada por aqui ainda";
const EMPTY_DESC = "Assim que houver registros, eles aparecerão nesta tabela.";

function SectionHead({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="hwidget-head">
      <div className="hwidget-titles">
        <h2 className="hwidget-title">{title}</h2>
        <p className="hwidget-desc">{desc}</p>
      </div>
      <div className="hwidget-actions">{action}</div>
    </div>
  );
}

function EmptyRows({ count, columns }: { count: number; columns: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i} className="htable-row--empty" aria-hidden="true">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="htable-cell" />
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="htable-empty" role="status" aria-live="polite">
      <div className="hempty hempty--inline hui-reveal">
        <CalendarIcon className="hempty-icon" />
        <h3 className="hempty-title nunito-bold">{EMPTY_TITLE}</h3>
        <p className="hempty-desc inter-regular">{EMPTY_DESC}</p>
      </div>
    </div>
  );
}

const ROW_H = { "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties;

/** "Sim" comes in the success tone, "Não" in the default one. */
const YesNo = ({ on }: { on: boolean }) => <span className={`hchip hchip--${on ? "success" : "default"} hchip--primary hchip--sm`}>{on ? "Sim" : "Não"}</span>;

export function HolidaysPage() {
  const data = useData();
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Holiday | null>(null);

  const agendas = data.agendas.filter((a) => a.active);
  const holidays = [...data.holidays].sort((a, b) => a.date.localeCompare(b.date));
  // Only the agendas that actually block national holidays see the system list.
  const showSystem = agendas.some((a) => rulesOf(data, a.id).national);

  const agendaNames = (holiday: Holiday) =>
    holiday.agendaIds.length ? holiday.agendaIds.map((id) => agendas.find((a) => a.id === id)?.name ?? id).join(", ") : "Todas";

  const remove = (id: string) => update((d) => ({ ...d, holidays: d.holidays.filter((h) => h.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div>
        <SectionHead
          title="Configuração de Feriados das Suas Agendas Ativas"
          desc="Indique, por agenda, se feriados nacionais e estaduais devem bloquear o atendimento."
        />
        <div id="feriados-config-content">
          <div className="htable" style={ROW_H}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Agenda</th>
                    <th className="htable-col">Bloquear em Feriados Nacionais</th>
                    <th className="htable-col">Bloquear Feriados Estaduais</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {agendas.map((agenda) => {
                    const rules = rulesOf(data, agenda.id);
                    return (
                      <tr key={agenda.id}>
                        <td className="htable-cell whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 inter-semibold">{agenda.name}</span>
                        </td>
                        <td className="htable-cell whitespace-nowrap">
                          <YesNo on={rules.national} />
                        </td>
                        <td className="htable-cell whitespace-nowrap">
                          <YesNo on={rules.state} />
                        </td>
                        <td className="htable-cell htable-cell--end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="btn-icon btn-icon-sm btn-icon-flat"
                              title="Editar Configuração"
                              aria-label="Editar configuração de feriado"
                              onClick={() => setEditingAgenda(agenda)}
                            >
                              <PenIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <EmptyRows count={Math.max(0, 6 - agendas.length)} columns={4} />
                </tbody>
              </table>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionHead
          title="Feriados Customizados"
          desc="Lista de feriados locais, recessos, dias sem atendimento e períodos com atendimento reduzido."
          action={
            <button type="button" className="hbtn hbtn--primary" onClick={() => setCreating(true)}>
              <CalendarAddIcon className="w-4 h-4" />
              Adicionar Feriado
            </button>
          }
        />
        <div id="feriados-customizados-content">
          <div className={`htable${holidays.length ? "" : " htable-is-empty"}`} style={ROW_H}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Dia</th>
                    <th className="htable-col">Horário</th>
                    <th className="htable-col">Descrição</th>
                    <th className="htable-col">Aplicar nas Agendas</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td className="htable-cell whitespace-nowrap">
                        {holiday.endDate ? `${showDay(holiday.date)} – ${showDay(holiday.endDate)}` : showDay(holiday.date)}
                      </td>
                      <td className="htable-cell whitespace-nowrap">{holiday.allDay ? "Dia inteiro" : `${holiday.startTime} – ${holiday.endTime}`}</td>
                      <td className="htable-cell">{holiday.name}</td>
                      <td className="htable-cell">{agendaNames(holiday)}</td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditingHoliday(holiday)}>
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(holiday)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <EmptyRows count={Math.max(0, 6 - holidays.length)} columns={5} />
                </tbody>
              </table>
            </div>
            {!holidays.length && <EmptyState />}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionHead
          title="Feriados do Sistema"
          desc="Lista de feriados já existentes no sistema. Na configuração da agenda, indique se é para considerar os feriados nacionais ou estaduais."
        />
        <div className={`htable${showSystem ? "" : " htable-is-empty"}`} style={ROW_H}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  <th className="htable-col">Dia</th>
                  <th className="htable-col">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {showSystem &&
                  NATIONAL_HOLIDAYS.map((holiday) => (
                    <tr key={holiday.date}>
                      <td className="htable-cell whitespace-nowrap">{showDay(holiday.date)}</td>
                      <td className="htable-cell">{holiday.name}</td>
                    </tr>
                  ))}
                <EmptyRows count={showSystem ? 0 : 10} columns={2} />
              </tbody>
            </table>
          </div>
          {!showSystem && <EmptyState />}
          <div className="htable-footer">
            <div className="htable-pagination" hidden />
          </div>
        </div>
      </div>

      {editingAgenda && <AgendaHolidaysModal agenda={editingAgenda} onClose={() => setEditingAgenda(null)} />}
      {creating && <HolidayFormModal onClose={() => setCreating(false)} />}
      {editingHoliday && <HolidayFormModal holiday={editingHoliday} onClose={() => setEditingHoliday(null)} />}
      {removing && (
        <AlertDialog
          id="feriado-delete-dialog"
          heading="Excluir feriado"
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
          As agendas voltam a atender nesses dias.
        </AlertDialog>
      )}
    </div>
  );
}
