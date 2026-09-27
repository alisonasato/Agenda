"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { TimePicker } from "../shared/TimePicker";
import { SaveIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { STATUS_LABELS, type Appointment, type Recurrence, type Status } from "@/lib/seiri/types";

const WEEKDAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const textOf = (date: Date | null) => (date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : "");
const dateOf = (text: string) => {
  const [day, month, year] = text.split("/").map(Number);
  return day && month && year ? new Date(year, month - 1, day) : null;
};

/** The days a recurrence lands on, from its first date until the end date or the count runs out. */
export function occurrences(rule: Pick<Recurrence, "start" | "weekdays" | "interval" | "endDate" | "maxCount">) {
  const first = new Date(`${rule.start}:00`);
  const time = rule.start.slice(11, 16);
  const end = dateOf(rule.endDate);
  const days: string[] = [];
  // Walk week by week from the first one, taking the chosen weekdays in each.
  const weekStart = new Date(first);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  for (let week = 0; days.length < rule.maxCount && week < 260; week += rule.interval || 1) {
    for (const weekday of [...rule.weekdays].sort()) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + week * 7 + weekday);
      if (day < first) continue;
      if (end && day > end) return days;
      if (days.length >= rule.maxCount) return days;
      days.push(`${iso(day)}T${time}`);
    }
  }
  return days;
}

/** Clone of "Novo Agendamento Recorrente": the rule and the appointments it creates. */
export function RecurrenceModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const today = new Date();
  const [agendaId, setAgendaId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [day, setDay] = useState<Date | null>(today);
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<Status>("CONFIRMED");
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [companions, setCompanions] = useState<string[]>([]);
  const [owner, setOwner] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [label, setLabel] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [interval, setInterval] = useState("1");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [maxCount, setMaxCount] = useState("10");
  const [notify, setNotify] = useState(true);

  const team = [...new Set(data.services.flatMap((s) => s.members))].sort();
  const services = data.services.filter((s) => !agendaId || s.agendaIds.includes(agendaId));
  const ready = Boolean(agendaId && day && weekdays.length);

  const save = () => {
    if (!day || !ready) return;
    const start = `${iso(day)}T${time}`;
    update((d) => {
      const rule: Recurrence = {
        id: nextId("rc", d.recurrences),
        code: `R${String(d.recurrences.length + 1).padStart(4, "0")}`,
        createdAt: `${textOf(new Date())} ${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`,
        label: label.trim(),
        agendaId,
        serviceId: serviceId || services[0]?.id || "",
        start,
        status,
        clientIds,
        owner: owner || team[0] || "",
        tagIds,
        weekdays,
        interval: Number(interval) || 1,
        endDate: textOf(endDate),
        maxCount: Number(maxCount) || 1,
        notify,
      };
      const service = d.services.find((s) => s.id === rule.serviceId);
      // Each occurrence becomes an appointment, one per chosen client (or one without a client).
      let counter = d.appointments.reduce((max, a) => Math.max(max, Number(a.code) || 0), 48000);
      const born: Appointment[] = occurrences(rule).flatMap((at) =>
        (rule.clientIds.length ? rule.clientIds : [""]).map((clientId, k) => ({
          id: nextId("ap", [...d.appointments, ...Array.from({ length: k }, (_, n) => ({ id: `tmp${n}` }))]),
          code: String(++counter),
          clientId,
          agendaId: rule.agendaId,
          serviceId: rule.serviceId,
          start: at,
          duration: service?.duration ?? 30,
          status: rule.status,
          owner: rule.owner,
          tagIds: rule.tagIds,
          comment: "",
          createdAt: rule.createdAt,
          recurrenceId: rule.id,
        })),
      );
      return { ...d, recurrences: [...d.recurrences, rule], appointments: [...d.appointments, ...born] };
    });
    onClose();
  };

  return (
    <Modal
      id="rec-create-modal"
      title="Novo Agendamento Recorrente"
      size="xl"
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
        <Combobox
          id="agenda"
          label="Agenda"
          required
          options={data.agendas.map((a) => ({ value: a.id, label: a.name }))}
          value={agendaId}
          onChange={setAgendaId}
          placeholder="Escolha a agenda"
        />
        <Combobox
          id="servico"
          label="Serviço"
          options={services.map((s) => ({ value: s.id, label: s.name }))}
          value={serviceId}
          onChange={setServiceId}
          placeholder="Selecione os serviços da agenda"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="dia">
              Dia <span className="hinput-req">*</span>
            </label>
            <div className="mt-1.5">
              <DatePicker id="dia" name="dia" ariaLabel="Dia" value={day} onChange={setDay} today={today} />
            </div>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="horario">
              Horário <span className="hinput-req">*</span>
            </label>
            <div className="mt-1.5">
              <TimePicker id="horario" name="horario" ariaLabel="Horário" value={time} onChange={setTime} />
            </div>
          </div>
        </div>
        <Combobox
          id="status"
          label="Situação"
          required
          options={(Object.keys(STATUS_LABELS) as Status[]).map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          value={status}
          onChange={(v) => setStatus(v as Status)}
          placeholder="Confirmado"
          clearable={false}
        />

        <h4 className="text-sm font-semibold text-gray-900 inter-semibold pt-2">Participantes</h4>
        <ChipMultiSelect
          id="clientes"
          label="Clientes"
          placeholder="Selecione os clientes"
          options={data.clients.map((c) => ({ id: c.id, label: c.name }))}
          values={clientIds}
          onChange={setClientIds}
        />
        <ChipMultiSelect
          id="acompanhantes"
          label="Acompanhantes"
          placeholder="Selecione os acompanhantes"
          options={data.clients.map((c) => ({ id: c.id, label: c.name }))}
          values={companions}
          onChange={setCompanions}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Combobox
            id="owner_user"
            label="Responsável pelo atendimento"
            options={team.map((m) => ({ value: m, label: m }))}
            value={owner}
            onChange={setOwner}
            placeholder="Selecione o responsável"
          />
          <ChipMultiSelect
            id="membros"
            label="Membros da equipe"
            placeholder="Selecione os membros"
            options={team.map((m) => ({ id: m, label: m }))}
            values={members}
            onChange={setMembers}
          />
        </div>
        <ChipMultiSelect
          id="tags"
          label="Tags"
          placeholder="Selecione as tags"
          options={data.tags.map((t) => ({ id: t.id, label: t.name }))}
          values={tagIds}
          onChange={setTagIds}
        />

        <h4 className="text-sm font-semibold text-gray-900 inter-semibold pt-2">Recorrência</h4>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="label">
            Identificador
          </label>
          <div className="hinput-wrap">
            <input id="label" className="hinput" type="text" placeholder="Ex.: Consultas semanais" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="hinput-label">
            Dias da semana <span className="hinput-req">*</span>
          </label>
          <div className="mt-1.5 grid grid-cols-4 sm:grid-cols-7 gap-2">
            {WEEKDAYS.map((weekday) => {
              const on = weekdays.includes(weekday.value);
              return (
                <label key={weekday.value} className="relative block cursor-pointer">
                  <input
                    type="checkbox"
                    name="weekdays"
                    value={weekday.value}
                    className="sr-only"
                    checked={on}
                    onChange={() => setWeekdays((w) => (on ? w.filter((x) => x !== weekday.value) : [...w, weekday.value]))}
                  />
                  <span
                    className="flex min-h-[44px] items-center justify-center rounded-[0.875rem] border px-2 text-center text-xs font-semibold transition-colors inter-semibold"
                    style={
                      on
                        ? { borderColor: "var(--color-primary)", background: "var(--color-primary)", color: "#fff" }
                        : { borderColor: "var(--color-border)", background: "#fff", color: "#475569" }
                    }
                  >
                    {weekday.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="interval">
              Intervalo
            </label>
            <div className="hinput-wrap">
              <input id="interval" className="hinput" type="number" min={1} value={interval} onChange={(e) => setInterval(e.target.value)} />
            </div>
            <p className="hinput-desc">A cada N semanas</p>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="max_date">
              Data final
            </label>
            <div className="mt-1.5">
              <DatePicker id="max_date" name="max_date" ariaLabel="Data final" value={endDate} onChange={setEndDate} today={today} />
            </div>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="max_number">
              Quantidade máxima
            </label>
            <div className="hinput-wrap">
              <input id="max_number" className="hinput" type="number" min={1} value={maxCount} onChange={(e) => setMaxCount(e.target.value)} />
            </div>
          </div>
        </div>
        <label className="hcheckbox">
          <input type="checkbox" className="hcheckbox-input" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span className="hcheckbox-box" aria-hidden="true">
            <svg className="hcheckbox-check" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline
                className="hcheckbox-check-line"
                points="1 9 7 14 15 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hcheckbox-dash" aria-hidden="true" />
          </span>
          <span className="hcheckbox-label">Incluir estes agendamentos nas suas regras de notificações</span>
        </label>
      </div>
    </Modal>
  );
}
