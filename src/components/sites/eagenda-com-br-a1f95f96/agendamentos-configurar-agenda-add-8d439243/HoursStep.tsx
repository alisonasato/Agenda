"use client";

import { DatePicker } from "../shared/DatePicker";
import { TimePicker } from "../shared/TimePicker";
import { CopyIcon, GridPlusIcon, TrashIcon } from "../shared/icons";
import type { AgendaRules, Interval } from "@/lib/seiri/types";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
/** The original lists the week from Monday. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** The chips the original prints under "Horários Gerados" for an interval. */
function generated(interval: Interval, rules: AgendaRules) {
  const step = rules.granularity || rules.duration + rules.gap;
  if (!interval.start || !interval.end || step <= 0) return [];
  const slots: string[] = [];
  for (let at = toMinutes(interval.start); at + rules.duration <= toMinutes(interval.end) && slots.length < 40; at += step) slots.push(toTime(at));
  return slots;
}

function NumberField({ id, label, help, value, onChange }: { id: string; label: string; help: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
      <p className="hinput-desc">{help}</p>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="cfg-opt">
      <label className="hcheckbox">
        <input type="checkbox" className="hcheckbox-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
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
        <span className="hcheckbox-label">{label}</span>
      </label>
    </div>
  );
}

type HoursStepProps = {
  rules: AgendaRules;
  onRules: (rules: AgendaRules) => void;
  week: Interval[][];
  onWeek: (week: Interval[][]) => void;
};

/** Step 2 of "Configurações Gerais da Agenda": the rules and the weekly table. */
export function HoursStep({ rules, onRules, week, onWeek }: HoursStepProps) {
  const set = <K extends keyof AgendaRules>(key: K, value: AgendaRules[K]) => onRules({ ...rules, [key]: value });
  const edit = (weekday: number, index: number, patch: Partial<Interval>) =>
    onWeek(week.map((day, d) => (d === weekday ? day.map((i, k) => (k === index ? { ...i, ...patch } : i)) : day)));
  const add = (weekday: number) => onWeek(week.map((day, d) => (d === weekday ? [...day, { start: "07:00", end: "18:00", max: null }] : day)));
  const remove = (weekday: number, index: number) => onWeek(week.map((day, d) => (d === weekday ? day.filter((_, k) => k !== index) : day)));
  /** "Copiar Seg → …": Monday's intervals onto the days that follow. */
  const copyMonday = (to: number[]) => onWeek(week.map((day, d) => (to.includes(d) ? week[1].map((i) => ({ ...i })) : day)));

  const dateOf = (text: string) => {
    const [day, month, year] = text.split("/").map(Number);
    return day && month && year ? new Date(year, month - 1, day) : null;
  };
  const textOf = (date: Date | null) =>
    date ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}` : "";

  return (
    <>
      <section className="cfg-group">
        <div className="cfg-group-head">
          <h3 className="cfg-group-title">Configuração de Horários</h3>
          <p className="cfg-group-desc">Duração, intervalos e capacidade dos atendimentos.</p>
        </div>
        <div className="cfg-group-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField
              id="att_interval"
              label="Duração do Atendimento (min)"
              help="Tempo de duração de cada atendimento."
              value={rules.duration}
              onChange={(v) => set("duration", v)}
            />
            <NumberField
              id="att_interval_extra"
              label="Intervalo entre Atendimentos (min)"
              help="Tempo de intervalo entre um atendimento e outro."
              value={rules.gap}
              onChange={(v) => set("gap", v)}
            />
            <NumberField
              id="max_people"
              label="Agendamentos por Horário"
              help="Máximo de agendamentos permitidos no mesmo horário."
              value={rules.maxPeople}
              onChange={(v) => set("maxPeople", v)}
            />
            <NumberField
              id="att_slot_interval"
              label="Granularidade dos Horários (min)"
              help="Intervalo entre as opções de horário. 0 usa o padrão (duração + intervalo)."
              value={rules.granularity}
              onChange={(v) => set("granularity", v)}
            />
          </div>
        </div>
      </section>

      <section className="cfg-group">
        <div className="cfg-group-head">
          <h3 className="cfg-group-title">Restrições de Agendamento</h3>
          <p className="cfg-group-desc">Quando os clientes podem agendar e cancelar.</p>
        </div>
        <div className="cfg-group-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField
              id="att_minimum_ante"
              label="Antecedência Mínima (horas)"
              help="Tempo mínimo entre agora e o horário."
              value={rules.minNotice}
              onChange={(v) => set("minNotice", v)}
            />
            <NumberField
              id="att_max_time"
              label="Antecedência Máxima (dias)"
              help="Prazo máximo, em dias, permitido para agendar."
              value={rules.maxAhead}
              onChange={(v) => set("maxAhead", v)}
            />
            <NumberField
              id="att_max_time_hours"
              label="Horário de Liberação (hora)"
              help="Hora do dia em que o próximo dia fica disponível."
              value={rules.releaseHour}
              onChange={(v) => set("releaseHour", v)}
            />
            <NumberField
              id="cancel_minimum_time"
              label="Tempo Mínimo para Cancelar (horas)"
              help="Antes do horário agendado."
              value={rules.cancelMin}
              onChange={(v) => set("cancelMin", v)}
            />
            <NumberField
              id="cancel_deadline"
              label="Prazo Máximo para Cancelar (horas)"
              help="Após a confirmação do agendamento."
              value={rules.cancelDeadline}
              onChange={(v) => set("cancelDeadline", v)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Check label="Antecedência em dias úteis" checked={rules.businessDaysOnly} onChange={(v) => set("businessDaysOnly", v)} />
            <Check label="Bloquear feriados nacionais" checked={rules.blockNationalHolidays} onChange={(v) => set("blockNationalHolidays", v)} />
            <Check label="Bloquear feriados estaduais" checked={rules.blockStateHolidays} onChange={(v) => set("blockStateHolidays", v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="data_inicio">
                Data de início
              </label>
              <div className="mt-1.5">
                <DatePicker
                  id="data_inicio"
                  name="data_inicio"
                  ariaLabel="Data de início"
                  value={dateOf(rules.startDate)}
                  onChange={(d) => set("startDate", textOf(d))}
                  today={new Date()}
                />
              </div>
              <p className="hinput-desc">A partir de quando a agenda aceita agendamentos.</p>
            </div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="data_fim">
                Data de fim
              </label>
              <div className="mt-1.5">
                <DatePicker
                  id="data_fim"
                  name="data_fim"
                  ariaLabel="Data de fim"
                  value={dateOf(rules.endDate)}
                  onChange={(d) => set("endDate", textOf(d))}
                  today={new Date()}
                />
              </div>
              <p className="hinput-desc">Deixe em branco para uma agenda sem data de término.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cfg-group">
        <div className="cfg-group-head">
          <h3 className="cfg-group-title">Tabela de Horários Semanal</h3>
          <p className="cfg-group-desc">Horários de atendimento para cada dia da semana.</p>
        </div>
        <div className="cfg-group-body space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => copyMonday([2, 3, 4, 5])}>
              <CopyIcon className="w-4 h-4" />
              Copiar Seg → Ter a Sex
            </button>
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => copyMonday([2, 3, 4, 5, 6, 0])}>
              <CopyIcon className="w-4 h-4" />
              Copiar Seg → Ter a Dom
            </button>
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => add(1)}>
              <GridPlusIcon className="w-4 h-4" />
              Adicionar Horário
            </button>
          </div>

          <div className="htable">
            <div className="htable-scroll">
              <table className="htable-table w-full">
                <thead>
                  <tr>
                    <th className="htable-col">Dia</th>
                    <th className="htable-col">Início</th>
                    <th className="htable-col">Fim</th>
                    <th className="htable-col">Por Horário</th>
                    <th className="htable-col">Horários Gerados</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDER.map((weekday) => {
                    const day = week[weekday] ?? [];
                    return (day.length ? day : [null]).map((interval, index) => (
                      <tr key={`${weekday}-${index}`} className="align-top">
                        <td className="htable-cell">
                          {index === 0 && <span className="font-semibold text-gray-900 whitespace-nowrap">{WEEKDAYS[weekday]}</span>}
                        </td>
                        <td className="htable-cell">
                          {interval && (
                            <TimePicker
                              id={`tt-${weekday}-${index}-start`}
                              name={`start_${weekday}_${index}`}
                              ariaLabel={`${WEEKDAYS[weekday]} — Início`}
                              value={interval.start}
                              onChange={(v) => edit(weekday, index, { start: v })}
                            />
                          )}
                        </td>
                        <td className="htable-cell">
                          {interval && (
                            <TimePicker
                              id={`tt-${weekday}-${index}-end`}
                              name={`end_${weekday}_${index}`}
                              ariaLabel={`${WEEKDAYS[weekday]} — Fim`}
                              value={interval.end}
                              onChange={(v) => edit(weekday, index, { end: v })}
                            />
                          )}
                        </td>
                        <td className="htable-cell">
                          {interval && (
                            <input
                              type="number"
                              min={1}
                              className="hinput"
                              aria-label={`${WEEKDAYS[weekday]} — Agendamentos por horário`}
                              value={interval.max ?? ""}
                              onChange={(e) => edit(weekday, index, { max: e.target.value ? Number(e.target.value) : null })}
                            />
                          )}
                        </td>
                        <td className="htable-cell">
                          <div className="flex flex-wrap gap-1">
                            {interval ? (
                              generated(interval, rules).map((slot) => (
                                <span key={slot} className="hchip hchip--default hchip--soft hchip--sm tabular-nums">
                                  {slot}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 inter-regular">Fechado</span>
                            )}
                          </div>
                        </td>
                        <td className="htable-cell htable-cell--end whitespace-nowrap">
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Adicionar Horário" onClick={() => add(weekday)}>
                            <GridPlusIcon className="w-4 h-4" />
                          </button>
                          {interval && (
                            <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Remover" onClick={() => remove(weekday, index)}>
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </section>

      <section className="cfg-group">
        <div className="cfg-group-head">
          <h3 className="cfg-group-title">Horários Extras e Limites</h3>
          <p className="cfg-group-desc">Datas específicas fora da grade semanal e regras de volume de agendamentos.</p>
        </div>
        <div className="cfg-group-body">
          <p className="hinput-desc">Nada por aqui ainda. Assim que houver registros, eles aparecerão nesta tabela.</p>
        </div>
      </section>
    </>
  );
}
