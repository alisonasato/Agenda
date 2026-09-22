"use client";

import { useState } from "react";
import { CheckboxMark, ChevronLeftIcon, ClockSolidIcon, DangerCircleIcon, PlusCircleIcon, ShieldEyeIcon, TrashIcon } from "../shared/icons";
import { AskScreen, BackButton, ForwardButton, delay } from "./parts";
import type { StepProps } from "./types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = { mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom" };

const TIMEZONES: [string, string][] = [
  ["America/Sao_Paulo", "Brasília, São Paulo (GMT-3)"],
  ["America/Bahia", "Salvador (GMT-3)"],
  ["America/Fortaleza", "Fortaleza, Recife (GMT-3)"],
  ["America/Belem", "Belém (GMT-3)"],
  ["America/Manaus", "Manaus, Cuiabá (GMT-4)"],
  ["America/Campo_Grande", "Campo Grande (GMT-4)"],
  ["America/Porto_Velho", "Porto Velho (GMT-4)"],
  ["America/Rio_Branco", "Rio Branco (GMT-5)"],
  ["America/Noronha", "Fernando de Noronha (GMT-2)"],
  ["America/Argentina/Buenos_Aires", "Buenos Aires (GMT-3)"],
  ["America/Montevideo", "Montevidéu (GMT-3)"],
  ["America/Santiago", "Santiago (GMT-4)"],
  ["America/Bogota", "Bogotá, Lima (GMT-5)"],
  ["America/Mexico_City", "Cidade do México (GMT-6)"],
  ["America/New_York", "Nova York (GMT-5)"],
  ["America/Chicago", "Chicago (GMT-6)"],
  ["America/Los_Angeles", "Los Angeles (GMT-8)"],
  ["Europe/Lisbon", "Lisboa (GMT+0)"],
  ["Europe/London", "Londres (GMT+0)"],
  ["Europe/Madrid", "Madri, Paris, Roma (GMT+1)"],
  ["UTC", "UTC"],
];

type Slot = { start: string; end: string };
type Day = { active: boolean; slots: Slot[] };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":");
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};
const toHHMM = (mins: number) => {
  const clamped = Math.max(0, Math.min(mins, 23 * 60 + 59));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}`;
};
/** A long range splits in two with an hour's break around its middle: 09:00–18:00 → 09:00–13:00 + 14:00–18:00. */
const canSplit = (slots: Slot[]) => slots.length === 1 && toMinutes(slots[0].end) - toMinutes(slots[0].start) >= 240;
const addPeriod = (slots: Slot[]): Slot[] => {
  if (slots.length >= 4) return slots;
  if (canSplit(slots)) {
    const middle = Math.floor((toMinutes(slots[0].start) + toMinutes(slots[0].end)) / 2 / 60) * 60;
    return [
      { start: slots[0].start, end: toHHMM(middle) },
      { start: toHHMM(middle + 60), end: slots[0].end },
    ];
  }
  const last = slots[slots.length - 1];
  let start = toMinutes(last.end) + 60;
  if (start >= 23 * 60) start = toMinutes(last.end);
  return [...slots, { start: toHHMM(start), end: toHHMM(start + 120) }];
};
const periodLabel = (slots: Slot[]) => (canSplit(slots) ? "Fechar para o almoço" : "Adicionar período");
const slotInvalid = (slot: Slot) => toMinutes(slot.start) >= toMinutes(slot.end);
const overlaps = (slots: Slot[]) =>
  slots.some((a, i) => slots.slice(i + 1).some((b) => toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)));

const initialSchedule = (): Record<string, Day> => Object.fromEntries(DAYS.map((d) => [d, { active: d !== "sun", slots: [{ start: "09:00", end: "18:00" }] }]));

/** Step 4 — "Horários": which days the agenda opens, the times of each one and the timezone. */
export function Step4Schedule({ phase, setPhase, onNext, onBack }: StepProps) {
  const [sub, setSub] = useState(0);
  const [schedule, setSchedule] = useState<Record<string, Day>>(initialSchedule);
  const [globalSlots, setGlobalSlots] = useState<Slot[]>([{ start: "09:00", end: "18:00" }]);
  const [mode, setMode] = useState<"global" | "custom">("global");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  const activeDays = DAYS.filter((d) => schedule[d].active);
  const lists = mode === "global" ? [globalSlots] : activeDays.map((d) => schedule[d].slots);
  const problem = lists.some((l) => l.some(slotInvalid))
    ? "Há um período com o término antes do início."
    : lists.some(overlaps)
      ? "Há períodos que se sobrepõem no mesmo dia."
      : "";

  const setGlobal = (next: Slot[]) => {
    setGlobalSlots(next);
    setSchedule((s) => Object.fromEntries(DAYS.map((d) => [d, { ...s[d], slots: next.map((x) => ({ ...x })) }])));
  };
  const setDaySlots = (day: string, next: Slot[]) => setSchedule((s) => ({ ...s, [day]: { ...s[day], slots: next } }));

  if (phase === "ask") {
    return (
      <AskScreen
        lottie="agenda"
        size={240}
        step={4}
        title="Quando você atende?"
        lead="Seus clientes só conseguem agendar dentro dos dias e horários que você definir. Vamos por partes."
      >
        <div className="onb-in flex flex-col items-center gap-4 mt-11" style={delay(1080)}>
          <ForwardButton label="Definir meus horários" onClick={() => setPhase("config")} />
          <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onBack}>
            <ChevronLeftIcon />
            Voltar
          </button>
        </div>
      </AskScreen>
    );
  }

  return (
    <section className="max-w-lg mx-auto px-6 pt-6 pb-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {sub === 0 && (
          <div>
            <div className="text-center">
              <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">Em quais dias você atende?</h2>
              <p className="text-[16px] text-muted mt-3 mb-8">Toque nos dias em que você recebe agendamentos.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                    schedule[day].active ? "border-accent bg-accent/5" : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <span className="hcheckbox hcheckbox--lg">
                    <input
                      type="checkbox"
                      className="hcheckbox-input"
                      checked={schedule[day].active}
                      aria-label={DAY_LABELS[day]}
                      onChange={(e) => setSchedule((s) => ({ ...s, [day]: { ...s[day], active: e.target.checked } }))}
                    />
                    <span className="hcheckbox-box" aria-hidden="true">
                      <CheckboxMark />
                      <span className="hcheckbox-dash" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="text-[18px] font-semibold text-foreground">{DAY_LABELS[day]}</span>
                </label>
              ))}
            </div>
            {!activeDays.length && <p className="mt-5 text-center text-[14px] text-muted">Selecione pelo menos um dia para continuar.</p>}
            <div className="mt-7">
              <label className="hcheckbox">
                <input type="checkbox" name="national_holiday" defaultChecked id="onb-holiday" className="hcheckbox-input" />
                <span className="hcheckbox-box" aria-hidden="true">
                  <CheckboxMark />
                  <span className="hcheckbox-dash" aria-hidden="true" />
                </span>
                <span className="hcheckbox-label">Não atender em feriados nacionais</span>
              </label>
              <p className="text-[13px] text-muted mt-1.5">
                Bloqueia as datas do calendário nacional. Depois, em Configuração › Feriados, dá para liberar feriados específicos ou cadastrar os seus.
              </p>
            </div>
          </div>
        )}

        {sub === 1 && (
          <div>
            <div className="text-center">
              <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">Qual seu horário?</h2>
              <p className="text-[16px] text-muted mt-3 mb-7">Já sugerimos um horário comercial — ajuste como quiser.</p>
            </div>
            <div className="flex justify-center mb-7">
              <div className="inline-flex items-center gap-1 p-1 bg-default rounded-full">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold rounded-full transition-all ${
                    mode === "global" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => {
                    setMode("global");
                    setGlobal(globalSlots);
                  }}
                >
                  <ClockSolidIcon className="w-4 h-4" />
                  Mesmo horário
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold rounded-full transition-all ${
                    mode === "custom" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => setMode("custom")}
                >
                  <ShieldEyeIcon className="w-4 h-4" />
                  Por dia
                </button>
              </div>
            </div>

            {mode === "global" && (
              <div className="space-y-3">
                {globalSlots.map((gs, gi) => (
                  <div key={gi} className="flex items-center justify-center gap-3">
                    <input
                      type="time"
                      className={`hinput hinput--lg hinput--bordered w-[130px] text-center !text-[18px] !h-14${slotInvalid(gs) ? " hinput--invalid" : ""}`}
                      value={gs.start}
                      onChange={(e) => setGlobal(globalSlots.map((s, i) => (i === gi ? { ...s, start: e.target.value } : s)))}
                      aria-label="Horário de início"
                    />
                    <span className="text-muted">–</span>
                    <input
                      type="time"
                      className={`hinput hinput--lg hinput--bordered w-[130px] text-center !text-[18px] !h-14${slotInvalid(gs) ? " hinput--invalid" : ""}`}
                      value={gs.end}
                      onChange={(e) => setGlobal(globalSlots.map((s, i) => (i === gi ? { ...s, end: e.target.value } : s)))}
                      aria-label="Horário de término"
                    />
                    {globalSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setGlobal(globalSlots.filter((_, i) => i !== gi))}
                        className="p-2 rounded-lg text-danger/70 hover:bg-danger/10 hover:text-danger transition-colors flex-shrink-0"
                        aria-label="Remover este período"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1 pt-1">
                  {globalSlots.length < 4 && (
                    <button type="button" className="hbtn hbtn--secondary" onClick={() => setGlobal(addPeriod(globalSlots))}>
                      <PlusCircleIcon />
                      <span>{periodLabel(globalSlots)}</span>
                    </button>
                  )}
                  {globalSlots.length < 2 && (
                    <p className="text-[13px] text-muted text-center max-w-xs">Atende em dois turnos? Divida o dia em manhã e tarde.</p>
                  )}
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {DAYS.filter((d) => schedule[d].active).map((day) => (
                  <div key={day} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-foreground">{DAY_LABELS[day]}</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {schedule[day].slots.map((slot, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <input
                            type="time"
                            className={`hinput hinput--sm hinput--bordered w-[110px]${slotInvalid(slot) ? " hinput--invalid" : ""}`}
                            value={slot.start}
                            onChange={(e) =>
                              setDaySlots(
                                day,
                                schedule[day].slots.map((s, i) => (i === si ? { ...s, start: e.target.value } : s)),
                              )
                            }
                            aria-label={`${DAY_LABELS[day]} — início`}
                          />
                          <span className="text-muted text-xs">–</span>
                          <input
                            type="time"
                            className={`hinput hinput--sm hinput--bordered w-[110px]${slotInvalid(slot) ? " hinput--invalid" : ""}`}
                            value={slot.end}
                            onChange={(e) =>
                              setDaySlots(
                                day,
                                schedule[day].slots.map((s, i) => (i === si ? { ...s, end: e.target.value } : s)),
                              )
                            }
                            aria-label={`${DAY_LABELS[day]} — término`}
                          />
                          {schedule[day].slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setDaySlots(
                                  day,
                                  schedule[day].slots.filter((_, i) => i !== si),
                                )
                              }
                              className="p-1.5 rounded-lg text-danger/70 hover:bg-danger/10 hover:text-danger transition-colors flex-shrink-0"
                              aria-label="Remover este período"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {schedule[day].slots.length < 4 && (
                        <button
                          type="button"
                          onClick={() => setDaySlots(day, addPeriod(schedule[day].slots))}
                          className="inline-flex items-center gap-1 text-[13px] text-accent hover:text-accent/80 font-semibold transition-colors"
                        >
                          <PlusCircleIcon className="w-3.5 h-3.5" />
                          <span>{periodLabel(schedule[day].slots)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-7">
              <label htmlFor="onb-tz" className="text-sm font-semibold text-foreground">
                Fuso horário da agenda
              </label>
              <p className="text-[13px] text-muted mt-0.5 mb-2">Os horários acima valem neste fuso.</p>
              <select id="onb-tz" className="hinput hinput--bordered hselect-native w-full" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5">
              <label htmlFor="onb-horizon" className="text-sm font-semibold text-foreground">
                Até quando o cliente pode agendar
              </label>
              <p className="text-[13px] text-muted mt-0.5 mb-2">A partir de hoje. Quem agenda com mais antecedência precisa de uma janela maior.</p>
              <select id="onb-horizon" name="booking_horizon_days" className="hinput hinput--bordered hselect-native w-full sm:max-w-xs" defaultValue="30">
                {["7", "15", "30", "60", "90"].map((v) => (
                  <option key={v} value={v}>
                    {v} dias
                  </option>
                ))}
              </select>
            </div>
            {problem && (
              <p className="mt-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-[14px] text-danger" role="alert">
                <DangerCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{problem}</span>
              </p>
            )}
            <p className="mt-6 text-center text-[14px] text-muted">
              Você atende: <span className="font-semibold text-foreground">{activeDays.map((d) => DAY_LABELS[d]).join(", ") || "nenhum dia"}</span>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-11">
          <BackButton onClick={() => (sub > 0 ? setSub(0) : setPhase("ask"))} />
          {sub < 1 ? (
            <ForwardButton label="Próximo" disabled={!activeDays.length} onClick={() => setSub(1)} />
          ) : (
            <ForwardButton label="Salvar e avançar" disabled={!activeDays.length || !!problem} submit />
          )}
        </div>
      </form>
    </section>
  );
}
