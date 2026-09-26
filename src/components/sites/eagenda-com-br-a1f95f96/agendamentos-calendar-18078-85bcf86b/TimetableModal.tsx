"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { TimePicker } from "../shared/TimePicker";
import { CheckCircleIcon, GridPlusIcon, TrashIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";
import type { Interval } from "@/lib/seiri/types";

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
/** The original lists the week from Monday and leaves Sunday last. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];

const DEFAULT: Interval = { start: "07:00", end: "18:00", max: null };

/** Clone of the original's "Configurar Horários": the agenda's week, one row per day. */
export function TimetableModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const [agendaId, setAgendaId] = useState(data.agendas[0]?.id ?? "");
  const [week, setWeek] = useState<Interval[][]>(() => data.hours[data.agendas[0]?.id ?? ""] ?? Array.from({ length: 7 }, () => []));

  const pickAgenda = (id: string) => {
    setAgendaId(id);
    setWeek(data.hours[id] ?? Array.from({ length: 7 }, () => []));
  };

  const edit = (weekday: number, index: number, patch: Partial<Interval>) =>
    setWeek((w) => w.map((day, d) => (d === weekday ? day.map((i, k) => (k === index ? { ...i, ...patch } : i)) : day)));
  const add = (weekday: number) => setWeek((w) => w.map((day, d) => (d === weekday ? [...day, { ...DEFAULT }] : day)));
  const remove = (weekday: number, index: number) => setWeek((w) => w.map((day, d) => (d === weekday ? day.filter((_, k) => k !== index) : day)));

  const save = () => {
    update((d) => ({ ...d, hours: { ...d.hours, [agendaId]: week } }));
    onClose();
  };

  return (
    <Modal
      id="calendar-timetable-modal"
      title="Configurar Horários"
      size="3xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            <CheckCircleIcon className="w-4 h-4" />
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="max-w-sm">
          <Combobox
            id="tt_agenda"
            label="Agenda a configurar"
            options={data.agendas.map((a) => ({ value: a.id, label: a.name }))}
            value={agendaId}
            onChange={pickAgenda}
            placeholder="Selecione a agenda"
            clearable={false}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {ORDER.map((weekday) => (
            <div key={weekday} className="px-4 py-3 grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] gap-x-3 gap-y-2 items-start">
              <span className="text-sm font-semibold text-gray-900 lato-bold pt-1.5">{WEEKDAYS[weekday]}</span>
              <div className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 min-w-0 space-y-2">
                {week[weekday]?.length ? (
                  week[weekday].map((interval, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-32 shrink-0">
                          <TimePicker
                            id={`tt-${weekday}-${index}-start`}
                            name={`start_${weekday}_${index}`}
                            ariaLabel="Horário de Início"
                            value={interval.start}
                            onChange={(v) => edit(weekday, index, { start: v })}
                          />
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">–</span>
                      <div className="w-32 shrink-0">
                        <TimePicker
                          id={`tt-${weekday}-${index}-end`}
                          name={`end_${weekday}_${index}`}
                          ariaLabel="Horário de Fim"
                          value={interval.end}
                          onChange={(v) => edit(weekday, index, { end: v })}
                        />
                      </div>
                      <div className="w-24 shrink-0">
                        <div className="hinput-wrap">
                          <input
                            type="number"
                            min={1}
                            className="hinput"
                            placeholder="máx"
                            aria-label="Máximo de pessoas"
                            value={interval.max ?? ""}
                            onChange={(e) => edit(weekday, index, { max: e.target.value ? Number(e.target.value) : null })}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-icon btn-icon-sm btn-icon-danger"
                        title="Remover intervalo"
                        aria-label="Remover intervalo"
                        onClick={() => remove(weekday, index)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 lato-regular pt-1.5">Fechado</p>
                )}
              </div>
              <button
                type="button"
                className="hbtn hbtn--primary hbtn--icon hbtn--sm"
                title="Adicionar intervalo"
                aria-label="Adicionar intervalo"
                onClick={() => add(weekday)}
              >
                <GridPlusIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
