"use client";

import { Modal } from "../shared/Modal";
import {
  CalendarEmptyIcon,
  CalendarIcon,
  CheckReadIcon,
  ClockIcon,
  CloseCircleIcon,
  DangerCircleIcon,
  GridPlusIcon,
  LockDuoIcon,
  PenIcon,
  ReceiptIcon,
  TagIcon,
  TrashIcon,
  VideoIcon,
} from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";
import { expand, formatDate, formatTime } from "@/lib/seiri/select";
import { STATUS_LABELS, STATUS_TONES, type Appointment, type Status } from "@/lib/seiri/types";
import type { Slot } from "@/lib/seiri/slots";

const ROWS = 4;

/** What the original offers on a row, by the status it is in. */
const ACTIONS: Record<string, { label: string; to: Status; icon: React.ReactNode }[]> = {
  PENDING: [
    { label: "Confirmar", to: "CONFIRMED", icon: <CheckReadIcon className="w-4 h-4" /> },
    { label: "Recusar", to: "CANCELED", icon: <CloseCircleIcon className="w-4 h-4" /> },
  ],
  CONFIRMED: [
    { label: "Registrar Chegada", to: "ATTENDED", icon: <CheckReadIcon className="w-4 h-4" /> },
    { label: "Não Compareceu", to: "NO_SHOW", icon: <DangerCircleIcon className="w-4 h-4" /> },
    { label: "Cancelar Agendamento", to: "CANCELED", icon: <TrashIcon className="w-4 h-4" /> },
  ],
  ATTENDED: [],
  NO_SHOW: [],
  CANCELED: [],
};

/** Clone of the original's "Detalhes do Horário": what a slot holds and what can be done to it. */
export function SlotDetailsModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const data = useData();
  const agenda = data.agendas.find((a) => a.id === slot.agendaId);
  const rows = slot.appointments.map((a) => data.appointments.find((x) => x.id === a.id) ?? a);

  const setStatus = (id: string, status: Status) => update((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === id ? { ...a, status } : a)) }));

  const chip = (label: string, icon: React.ReactNode, primary = false, onClick?: () => void) => (
    <button type="button" className={`hbtn ${primary ? "hbtn--primary" : "hbtn--secondary"} hbtn--sm`} title={label} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <Modal
      id="calendar-detail-modal"
      title="Detalhes do Horário"
      size="5xl"
      onClose={onClose}
      footer={
        <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <CalendarIcon className="w-6 h-6 text-accent" />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900 alatsi-regular truncate">{agenda?.name ?? "—"}</h3>
          <p className="text-sm text-gray-600 lato-regular flex items-center gap-1.5 mt-0.5">
            <ClockIcon className="w-3.5 h-3.5" />
            {formatDate(slot.start)} {formatTime(slot.start)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        {chip("Bloquear Horário", <LockDuoIcon className="w-4 h-4" />)}
        {chip("Editar Horário", <PenIcon className="w-4 h-4" />)}
        {chip("Videoconferência", <VideoIcon className="w-4 h-4" />)}
        {chip(rows.length ? "Encaixar Agendamento" : "Incluir Agendamento", <GridPlusIcon className="w-4 h-4" />, true)}
        {chip("Sincronizar Google Agenda", <CalendarIcon className="w-4 h-4" />)}
      </div>

      {rows.length ? (
        <div className="htable" style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as React.CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  <th className="htable-col">Local</th>
                  <th className="htable-col">Tags</th>
                  <th className="htable-col">Nome</th>
                  <th className="htable-col">Email</th>
                  <th className="htable-col">Fone</th>
                  <th className="htable-col">Obs.</th>
                  <th className="htable-col">Status</th>
                  <th className="htable-col htable-col--center">Ações</th>
                  <th className="htable-col htable-col--center">Recibo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: Appointment) => {
                  const { client, serviceName, tags } = expand(data, row);
                  return (
                    <tr key={row.id} className="htable-row">
                      <td className="htable-cell">{serviceName}</td>
                      <td className="htable-cell">
                        <span className="inline-flex items-center gap-1">
                          {tags.join(", ") || "—"}
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Tags">
                            <TagIcon className="w-4 h-4" />
                          </button>
                        </span>
                      </td>
                      <td className="htable-cell font-semibold">{client?.name ?? "—"}</td>
                      <td className="htable-cell text-[11px]">{client?.email || "—"}</td>
                      <td className="htable-cell whitespace-nowrap text-[11px]">{client?.phone || "—"}</td>
                      <td className="htable-cell">
                        <span className="inline-flex items-center gap-1">
                          {row.comment || "—"}
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar comentário">
                            <PenIcon className="w-4 h-4" />
                          </button>
                        </span>
                      </td>
                      <td className="htable-cell">
                        <span className={`hchip hchip--soft hchip--sm ${STATUS_TONES[row.status]}`}>{STATUS_LABELS[row.status]}</span>
                      </td>
                      <td className="htable-cell htable-cell--center whitespace-nowrap">
                        {ACTIONS[row.status].map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            className="btn-icon btn-icon-sm btn-icon-flat"
                            title={action.label}
                            onClick={() => setStatus(row.id, action.to)}
                          >
                            {action.icon}
                          </button>
                        ))}
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Agendamento">
                          <PenIcon className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="htable-cell htable-cell--center">
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Recibo">
                          <ReceiptIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {Array.from({ length: Math.max(0, ROWS - rows.length) }, (_, k) => (
                  <tr key={`empty-${k}`} className="htable-row--empty" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, c) => (
                      <td key={c} className="htable-cell" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="htable-footer" />
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <CalendarEmptyIcon className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-base lato-regular">Nenhum agendamento neste horário</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
