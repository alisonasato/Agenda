"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { DatePicker } from "../shared/DatePicker";
import { TimePicker } from "../shared/TimePicker";
import { LockIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";

const key = (date: Date | null) =>
  date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";

/** Clone of the original's "Bloquear Horários": a range the agenda stops taking bookings in. */
export function BlockHoursModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const today = new Date();
  const [agendaIds, setAgendaIds] = useState<string[]>(data.agendas[0] ? [data.agendas[0].id] : []);
  const [from, setFrom] = useState<Date | null>(today);
  const [to, setTo] = useState<Date | null>(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const save = () => {
    if (!agendaIds.length || !from) return;
    update((d) => ({
      ...d,
      blocks: [...d.blocks, { id: nextId("bl", d.blocks), agendaIds, from: key(from), to: key(to) || key(from), startTime, endTime, reason: reason.trim() }],
    }));
    onClose();
  };

  return (
    <Modal
      id="calendar-block-hours-modal"
      title="Bloquear Horários"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--danger" disabled={!agendaIds.length || !from} onClick={save}>
            <LockIcon width={16} height={16} />
            Bloquear
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <ChipMultiSelect
          id="calendars"
          label="Agendas"
          required
          placeholder="Selecione as agendas"
          options={data.agendas.map((a) => ({ id: a.id, label: a.name }))}
          values={agendaIds}
          onChange={setAgendaIds}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="initial_date">
              Data Inicial
            </label>
            <div className="mt-1.5">
              <DatePicker id="initial_date" name="initial_date" ariaLabel="Data Inicial" value={from} onChange={setFrom} today={today} />
            </div>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="final_date">
              Data Final (opcional)
            </label>
            <div className="mt-1.5">
              <DatePicker id="final_date" name="final_date" ariaLabel="Data Final" value={to} onChange={setTo} today={today} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="start_time">
              Horário de Início (opcional)
            </label>
            <div className="mt-1.5">
              <TimePicker id="start_time" name="start_time" ariaLabel="Horário de Início" value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="end_time">
              Horário de Fim (opcional)
            </label>
            <div className="mt-1.5">
              <TimePicker id="end_time" name="end_time" ariaLabel="Horário de Fim" value={endTime} onChange={setEndTime} />
            </div>
          </div>
        </div>
        <p className="hinput-desc">Deixe os horários em branco para bloquear o dia inteiro, ou informe um intervalo.</p>

        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="reason">
            Motivo do Bloqueio
          </label>
          <div className="hinput-wrap">
            <input
              id="reason"
              name="reason"
              className="hinput"
              type="text"
              placeholder="Ex: Reunião, Feriado, Manutenção..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
