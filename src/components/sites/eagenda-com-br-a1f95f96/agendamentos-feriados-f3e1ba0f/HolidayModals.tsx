"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { DatePicker } from "../shared/DatePicker";
import { TimePicker } from "../shared/TimePicker";
import { ActivityIcon, CaretDownIcon, CheckboxMark, SaveIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { NATIONAL_HOLIDAYS, rulesOf } from "@/lib/seiri/holidays";
import type { Agenda, Holiday } from "@/lib/seiri/types";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dateOf = (key: string) => (key ? new Date(`${key}T00:00:00`) : null);
export const showDay = (key: string) => (key ? key.split("-").reverse().join("/") : "");

function Checkbox({ label, checked, onChange, className }: { label: string; checked: boolean; onChange: (on: boolean) => void; className?: string }) {
  return (
    <label className="hcheckbox">
      <input type="checkbox" className={`hcheckbox-input${className ? ` ${className}` : ""}`} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckboxMark />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      <span className="hcheckbox-label">{label}</span>
    </label>
  );
}

/** Clone of "Feriados da agenda": what an agenda blocks, and which national dates it skips. */
export function AgendaHolidaysModal({ agenda, onClose }: { agenda: Agenda; onClose: () => void }) {
  const data = useData();
  const current = rulesOf(data, agenda.id);
  const [national, setNational] = useState(current.national);
  const [state, setState] = useState(current.state);
  const [skipped, setSkipped] = useState<string[]>(current.skipped);
  const [showList, setShowList] = useState(false);

  const save = () => {
    update((d) => ({ ...d, holidayRules: { ...d.holidayRules, [agenda.id]: { national, state, skipped } } }));
    onClose();
  };

  return (
    <Modal
      id="feriado-agenda-modal"
      title={`Feriados de ${agenda.name}`}
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            <SaveIcon className="w-4 h-4" />
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="hcheckbox-stack">
          <Checkbox label="Bloquear em feriados nacionais" checked={national} onChange={setNational} />
          <Checkbox label="Bloquear em feriados estaduais" checked={state} onChange={setState} />
        </div>

        {(national || state) && (
          <div className="space-y-3">
            <div className="border-t border-[color:var(--color-border)] pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-primary)] hover:opacity-80 transition inter-semibold"
                onClick={() => setShowList((open) => !open)}
              >
                <ActivityIcon className="w-4 h-4" />
                Personalizar quais feriados bloquear
                <CaretDownIcon className={`w-4 h-4 transition-transform${showList ? " rotate-180" : ""}`} />
              </button>
              <p className="hinput-desc mt-1">Desmarque os feriados que NÃO devem bloquear esta agenda.</p>
            </div>
            {showList && (
              <div className="max-h-64 overflow-y-auto border border-[color:var(--color-border)] rounded-xl p-3 space-y-1">
                {NATIONAL_HOLIDAYS.map((holiday) => (
                  <div key={holiday.date} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      label={holiday.name}
                      className="flex-1"
                      checked={!skipped.includes(holiday.date)}
                      onChange={(on) => setSkipped((list) => (on ? list.filter((d) => d !== holiday.date) : [...list, holiday.date]))}
                    />
                    <span className="text-xs text-gray-500 inter-regular">{showDay(holiday.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/** Clone of "Adicionar Feriado" (`/agendamentos/feriados/add_modal`). */
export function HolidayFormModal({ holiday, onClose }: { holiday?: Holiday; onClose: () => void }) {
  const data = useData();
  const today = new Date();
  const [name, setName] = useState(holiday?.name ?? "");
  const [date, setDate] = useState<Date | null>(dateOf(holiday?.date ?? ""));
  const [multiDay, setMultiDay] = useState(Boolean(holiday?.endDate));
  const [endDate, setEndDate] = useState<Date | null>(dateOf(holiday?.endDate ?? ""));
  const [allDay, setAllDay] = useState(holiday?.allDay ?? true);
  const [startTime, setStartTime] = useState(holiday?.startTime ?? "");
  const [endTime, setEndTime] = useState(holiday?.endTime ?? "");
  const [allAgendas, setAllAgendas] = useState(!holiday?.agendaIds.length);
  const [agendaIds, setAgendaIds] = useState<string[]>(holiday?.agendaIds ?? []);

  const ready = Boolean(name.trim() && date);

  const save = () => {
    if (!ready || !date) return;
    update((d) => {
      const row: Holiday = {
        id: holiday?.id ?? nextId("hd", d.holidays),
        name: name.trim(),
        date: iso(date),
        endDate: multiDay && endDate ? iso(endDate) : "",
        allDay,
        startTime: allDay ? "" : startTime,
        endTime: allDay ? "" : endTime,
        agendaIds: allAgendas ? [] : agendaIds,
      };
      return { ...d, holidays: holiday ? d.holidays.map((h) => (h.id === holiday.id ? row : h)) : [...d.holidays, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="feriado-form-modal"
      title={holiday ? "Editar Feriado" : "Adicionar Feriado"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" disabled={!ready} onClick={save}>
            <SaveIcon className="w-4 h-4" />
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_name">
            Nome do Feriado <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input
              id="id_name"
              name="name"
              className="hinput"
              type="text"
              placeholder="Ex.: Recesso de Fim de Ano"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_date_holiday">
            Data <span className="hinput-req">*</span>
          </label>
          <div className="mt-1.5">
            <DatePicker id="id_date_holiday" name="date_holiday" ariaLabel="Data" value={date} onChange={setDate} today={today} />
          </div>
        </div>
        <Checkbox label="Feriado de múltiplos dias" checked={multiDay} onChange={setMultiDay} />
        {multiDay && (
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_final_date_holiday">
              Data Final <span className="hinput-req">*</span>
            </label>
            <div className="mt-1.5">
              <DatePicker id="id_final_date_holiday" name="final_date_holiday" ariaLabel="Data Final" value={endDate} onChange={setEndDate} today={today} />
            </div>
            <p className="hinput-desc">Será criado um único feriado que engloba todos os dias do período.</p>
          </div>
        )}{" "}
        <Checkbox label="Bloquear o dia inteiro" checked={allDay} onChange={setAllDay} />
        {!allDay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_start_time">
                Horário de Início
              </label>
              <div className="mt-1.5">
                <TimePicker id="id_start_time" name="start_time" ariaLabel="Horário de Início" value={startTime} onChange={setStartTime} />
              </div>
            </div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_end_time">
                Horário de Fim
              </label>
              <div className="mt-1.5">
                <TimePicker id="id_end_time" name="end_time" ariaLabel="Horário de Fim" value={endTime} onChange={setEndTime} />
              </div>
            </div>
          </div>
        )}
        <Checkbox label="Aplicar em todas as agendas" checked={allAgendas} onChange={setAllAgendas} />
        {!allAgendas && (
          <ChipMultiSelect
            id="agendas"
            placeholder="Selecione as agendas..."
            options={data.agendas.map((a) => ({ id: a.id, label: a.name }))}
            values={agendaIds}
            onChange={setAgendaIds}
          />
        )}
      </div>
    </Modal>
  );
}
