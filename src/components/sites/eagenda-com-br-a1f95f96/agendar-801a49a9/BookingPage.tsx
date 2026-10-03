"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  CalendarSearch,
  CalendarX,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  LayoutGrid,
  List,
  Lock,
  MapPin,
  Pencil,
  Phone,
  Repeat,
  Tag,
  User,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { MONTHS, WEEKDAYS_SHORT, addMonths } from "../shared/calendarDates";
import { dateStr, formFields, monthCells, optionsOf, publicAgendas, rulesOf, servicesOf, timesOf } from "@/lib/seiri/booking";
import { nextId, update, useData } from "@/lib/seiri/store";
import type { Appointment, Client } from "@/lib/seiri/types";

const STEPS = ["Agenda", "Data e Hora", "Seus Dados"];
const WEEKDAY_CHIPS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const pad = (n: number) => String(n).padStart(2, "0");
const money = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
const longDay = (d: Date) => {
  // "segunda-feira, 5 de outubro" — only the first letter is raised, as the original prints it.
  const text = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

type Mode = "agenda" | "service" | "date";

function Stepper({ step }: { step: number }) {
  return (
    <div className="booking-stepper-wrap">
      <div className="booking-stepper">
        {STEPS.map((label, i) => {
          const n = i + 1;
          return (
            <span key={label} className="contents">
              {i > 0 && <span className={`booking-step-sep${step > i ? " done" : ""}`} />}
              <span className={`booking-step${step === n ? " active" : ""}${step > n ? " done" : ""}`}>
                <span className="booking-step-num">{step > n ? <Check className="booking-step-check" strokeWidth={3} /> : n}</span>
                <span className="booking-step-label">{label}</span>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({ title, context, onBack, children }: { title: string; context?: React.ReactNode; onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-3 booking-step-anim">
      <div className="booking-step-card">
        <div className="booking-step-head">
          <div className="booking-step-head-info">
            <h2 className="booking-step-title">{title}</h2>
            {context && <p className="booking-step-context">{context}</p>}
          </div>
          {onBack && (
            <button type="button" className="booking-back-btn" title="Voltar" onClick={onBack}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
          )}
        </div>
        <div className="booking-step-body">{children}</div>
      </div>
    </div>
  );
}

/** The public booking screen, the page a client opens from an agenda's link. */
export function BookingPage() {
  const data = useData();
  // An agenda's own link carries ?agenda=<identificador>; it opens the flow already on that agenda.
  const linked = useSearchParams().get("agenda");
  const linkedId = data.agendas.find((a) => a.slug === linked)?.id ?? "";
  const [now] = useState(() => new Date());
  const [started, setStarted] = useState(false);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("agenda");
  // "-" is the agenda the visitor cleared, which the link must not put back.
  const [picked, setAgendaId] = useState("");
  const agendaId = picked === "-" ? "" : picked || linkedId;
  const [serviceId, setServiceId] = useState("");
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [onForm, setOnForm] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<Appointment | null>(null);
  const [footerOpen, setFooterOpen] = useState(false);

  const screen = data.bookingScreen as Record<string, string | boolean>;
  const orgName = String(screen.name || screen.short_name || "Minha Empresa");
  const orgMessage = String(screen.mensagem || "Agende seu atendimento de forma rápida e prática.");

  const units = data.units;
  const all = publicAgendas(data);
  const agendas = unitId && unitId !== "all" ? all.filter((a) => a.unitId === unitId) : all;
  const needsUnit = units.length > 0 && unitId === null;

  const agenda = agendas.find((a) => a.id === agendaId) ?? null;
  const options = agenda ? optionsOf(data, agenda.id) : null;
  const rules = agenda ? rulesOf(data, agenda.id) : null;
  const subTypes = agenda ? servicesOf(data, agenda.id) : [];
  const service = subTypes.find((s) => s.id === serviceId) ?? null;
  const allServices = data.services.filter((s) => agendas.some((a) => s.agendaIds.includes(a.id))).sort((a, b) => a.order - b.order);

  const needsService = Boolean(agenda && subTypes.length > 0 && !service);
  const calendarReady = Boolean(agenda && !needsService);
  const cells = agenda ? monthCells(data, agenda.id, month, now) : [];
  const times = agenda && day ? timesOf(data, agenda.id, day, now) : [];

  const duration = service?.duration || rules?.duration || 30;
  const unitLabel = unitId && unitId !== "all" ? (units.find((u) => u.id === unitId)?.name ?? "") : "";
  const canGoBack = month > new Date(now.getFullYear(), now.getMonth(), 1);

  const resetSelection = () => {
    setAgendaId("-");
    setServiceId("");
    setDay(null);
    setTime("");
  };

  const submit = () => {
    if (!agenda || !day || !time) return;
    if (!accepted) return setError("Você precisa aceitar os termos para continuar.");
    if (options?.password && password !== options.password) return setError("Senha inválida para esta agenda.");
    if (!fields.name?.trim()) return setError("Informe o seu nome.");
    setError("");
    update((d) => {
      const clientId = nextId("c", d.clients);
      const client: Client = {
        id: clientId,
        name: fields.name.trim(),
        email: fields.email ?? "",
        phone: fields.phone ?? "",
        cpf: fields.cpf,
        birthday: fields.birthday,
        nationality: fields.nationality,
        placeOfBirth: fields.placeOfBirth,
        profession: fields.profession,
        identificationNumber: fields.identificationNumber,
      };
      const id = nextId("ap", d.appointments);
      const appointment: Appointment = {
        id,
        // The original hands out a five-digit code, which is what the client is told to keep.
        code: String(10000 + ((d.appointments.length * 7919 + 48000) % 90000)),
        clientId,
        agendaId: agenda.id,
        serviceId: service?.id ?? "",
        start: time,
        duration,
        // The original leaves an external booking pending until the agenda accepts it.
        status: "PENDING",
        owner: "",
        tagIds: [],
        comment: fields.comment ?? "",
        createdAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      };
      setBooked(appointment);
      return { ...d, clients: [...d.clients, client], appointments: [...d.appointments, appointment] };
    });
  };

  if (!started && !agendaId && !booked) {
    return (
      <>
        <div className="booking-landing-wrap">
          <div className="booking-landing">
            <h1 className="booking-landing-title">{orgName}</h1>
            <p className="booking-landing-desc">{orgMessage}</p>
            <button type="button" className="booking-landing-cta" onClick={() => setStarted(true)}>
              <CalendarPlus className="w-5 h-5" />
              Agendar
            </button>
          </div>
        </div>
        <Footer open={footerOpen} onToggle={() => setFooterOpen((v) => !v)} />
      </>
    );
  }

  const step = booked ? 3 : onForm ? 3 : calendarReady ? 2 : 1;

  return (
    <>
      <div className="booking-hero-bg">
        <div className="booking-container">
          {!booked && <Stepper step={step} />}

          {needsUnit && (
            <StepCard title="Escolha a Unidade" context={<span>Onde você deseja ser atendido?</span>}>
              <div className="grid grid-cols-1 gap-2.5">
                {units.map((u) => (
                  <button key={u.id} type="button" className="booking-unit-card" onClick={() => setUnitId(u.id)}>
                    <span className="booking-unit-card-avatar">{u.name.charAt(0).toUpperCase()}</span>
                    <span className="booking-unit-card-info">
                      <span className="booking-unit-card-title">{u.name}</span>
                      {u.description && <span className="booking-unit-card-desc">{u.description}</span>}
                      {u.address.street && (
                        <span className="booking-unit-card-address">
                          <MapPin className="w-3 h-3" />
                          <span>{u.address.street}</span>
                        </span>
                      )}
                      <span className="booking-unit-card-meta">
                        {u.phone && (
                          <span className="booking-agenda-card-pill">
                            <Phone className="w-3 h-3" />
                            <span>{u.phone}</span>
                          </span>
                        )}
                        <span className="booking-agenda-card-pill">
                          <span>{all.filter((a) => a.unitId === u.id).length} agenda(s)</span>
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
                <button type="button" className="booking-unit-card" style={{ borderStyle: "dashed" }} onClick={() => setUnitId("all")}>
                  <span className="booking-unit-card-avatar" style={{ background: "var(--iframe-muted)" }}>
                    <LayoutGrid className="w-6 h-6" />
                  </span>
                  <span className="booking-unit-card-info">
                    <span className="booking-unit-card-title">Todas as unidades</span>
                    <span className="booking-unit-card-desc">Ver todas as agendas disponíveis</span>
                  </span>
                </button>
              </div>
            </StepCard>
          )}

          {!needsUnit && !calendarReady && !onForm && !booked && (
            <div className="booking-tabs booking-step-anim">
              <button
                type="button"
                className={`booking-tab${mode === "agenda" ? " active" : ""}`}
                onClick={() => {
                  setMode("agenda");
                  resetSelection();
                }}
              >
                <CalendarDays className="w-3.5 h-3.5 inline -mt-0.5" /> Por Agenda
              </button>
              {allServices.length > 0 && (
                <button
                  type="button"
                  className={`booking-tab${mode === "service" ? " active" : ""}`}
                  onClick={() => {
                    setMode("service");
                    resetSelection();
                  }}
                >
                  <List className="w-3.5 h-3.5 inline -mt-0.5" /> Por Serviço
                </button>
              )}
              <button
                type="button"
                className={`booking-tab${mode === "date" ? " active" : ""}`}
                onClick={() => {
                  setMode("date");
                  resetSelection();
                }}
              >
                <CalendarSearch className="w-3.5 h-3.5 inline -mt-0.5" /> Por Data
              </button>
            </div>
          )}

          {!needsUnit && mode !== "service" && !agenda && agendas.length > 0 && (
            <StepCard
              title="Escolha a Agenda"
              context={
                unitLabel ? (
                  <span>
                    <MapPin className="w-3.5 h-3.5" />
                    {unitLabel}
                  </span>
                ) : undefined
              }
              onBack={units.length ? () => setUnitId(null) : undefined}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {agendas.map((a) => {
                  const subs = servicesOf(data, a.id);
                  return (
                    <button key={a.id} type="button" className="booking-agenda-card" onClick={() => setAgendaId(a.id)}>
                      <span className="booking-agenda-card-avatar">{a.name.charAt(0).toUpperCase()}</span>
                      <span className="booking-agenda-card-info">
                        <span className="booking-agenda-card-title">{a.name}</span>
                        <span className="booking-agenda-card-meta">
                          <span className="booking-agenda-card-pill">
                            <Clock className="w-3 h-3" />
                            <span>{rulesOf(data, a.id).duration} min</span>
                          </span>
                          {subs.length > 0 && (
                            <span className="booking-agenda-card-pill">
                              <span>{subs.length} serviços</span>
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </StepCard>
          )}

          {!needsUnit && mode === "service" && !agenda && (
            <StepCard title="Escolha o Serviço" onBack={units.length ? () => setUnitId(null) : undefined}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="booking-service-card"
                    onClick={() => {
                      setServiceId(s.id);
                      setAgendaId(s.agendaIds.find((id) => agendas.some((a) => a.id === id)) ?? "");
                    }}
                  >
                    <span className="booking-service-card-icon">
                      <Tag className="w-4 h-4" />
                    </span>
                    <span className="booking-service-card-info">
                      <span className="booking-service-card-label">{s.name}</span>
                      <span className="booking-service-card-meta">
                        {s.duration} min{s.price != null ? ` · ${money(s.price)}` : ""}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {needsService && mode !== "service" && (
            <StepCard
              title="Escolha o Serviço"
              context={
                <span>
                  <Calendar className="w-3.5 h-3.5" />
                  {agenda?.name}
                </span>
              }
              onBack={() => resetSelection()}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subTypes.map((s) => (
                  <button key={s.id} type="button" className="booking-service-card" onClick={() => setServiceId(s.id)}>
                    <span className="booking-service-card-icon">
                      <Tag className="w-4 h-4" />
                    </span>
                    <span className="booking-service-card-info">
                      <span className="booking-service-card-label">{s.name}</span>
                      <span className="booking-service-card-meta">
                        {s.duration} min{s.price != null ? ` · ${money(s.price)}` : ""}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {calendarReady && !onForm && !booked && (
            <div className="iframe-card p-0 overflow-hidden flex flex-col booking-step-anim">
              <div className="booking-step-head">
                <div className="booking-step-head-info">
                  <h2 className="booking-step-title">Escolha a Data e o Horário</h2>
                  <p className="booking-step-context">
                    <span>
                      <Calendar className="w-3.5 h-3.5" />
                      {agenda?.name}
                    </span>
                    {service && (
                      <span>
                        <Tag className="w-3.5 h-3.5" />
                        {service.name}
                      </span>
                    )}
                    <span>
                      <Clock className="w-3.5 h-3.5" />
                      {duration} min
                    </span>
                    {unitLabel && (
                      <span>
                        <MapPin className="w-3.5 h-3.5" />
                        {unitLabel}
                      </span>
                    )}
                  </p>
                </div>
                <button type="button" className="booking-summary-change" title="Voltar e escolher outro serviço" onClick={resetSelection}>
                  <Pencil className="w-3.5 h-3.5" />
                  Alterar
                </button>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-3 md:border-r border-b md:border-b-0 flex flex-col" style={{ borderColor: "var(--iframe-border)" }}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        disabled={!canGoBack}
                        className={`p-1.5 rounded-lg transition-colors text-slate-600 ${canGoBack ? "hover:bg-slate-100" : "opacity-30 cursor-default"}`}
                        onClick={() => setMonth(addMonths(month, -1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-sm font-semibold text-slate-800 capitalize">
                        {MONTHS[month.getMonth()]} {month.getFullYear()}
                      </h3>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        onClick={() => setMonth(addMonths(month, 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0 mt-2">
                      {WEEKDAYS_SHORT.map((w) => (
                        <span key={w} className="text-center text-xs font-medium text-slate-400 py-1">
                          {w}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0 flex-1 auto-rows-fr mt-1">
                      {cells.map((cell, i) => (
                        <div key={i} className="flex items-center justify-center p-0.5 relative">
                          {cell && (
                            <>
                              <button
                                type="button"
                                disabled={cell.isPast || !cell.hasAvailability}
                                title={cell.status === "full" ? "Sem vagas neste dia" : cell.status === "holiday" ? "Feriado / indisponível" : ""}
                                className={[
                                  "iframe-day w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-150",
                                  day && dateStr(day) === cell.dateStr ? "selected" : "",
                                  cell.isToday && (!day || dateStr(day) !== cell.dateStr) ? "today" : "",
                                  !cell.isPast && cell.hasAvailability && (!day || dateStr(day) !== cell.dateStr) ? "cursor-pointer font-medium" : "",
                                  cell.isPast || !cell.hasAvailability ? "opacity-30 cursor-default" : "",
                                  cell.status === "full" || cell.status === "holiday" ? "iframe-day-blocked" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                onClick={() => {
                                  setDay(cell.date);
                                  setTime("");
                                }}
                              >
                                {cell.day}
                              </button>
                              {cell.hasAvailability && !cell.isPast && (!day || dateStr(day) !== cell.dateStr) && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full iframe-avail-dot pointer-events-none" />
                              )}
                              {(cell.status === "full" || cell.status === "holiday") && (
                                <span className={`iframe-blocked-mark pointer-events-none${cell.status === "holiday" ? " is-holiday" : ""}`} />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {cells.some((c) => c && (c.status === "full" || c.status === "holiday")) && (
                      <div className="booking-cal-legend">
                        <span className="lg-item">
                          <span className="lg-dot avail" />
                          Disponível
                        </span>
                        <span className="lg-item">
                          <span className="lg-bar full" />
                          Sem vaga
                        </span>
                        <span className="lg-item">
                          <span className="lg-bar holiday" />
                          Feriado
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:w-1/2 p-3">
                  {!day ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-slate-400">
                      <Clock className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">Selecione um dia no calendário</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">{longDay(day)}</h3>
                      {times.length === 0 ? (
                        <div className="text-center py-6 text-sm" style={{ color: "var(--iframe-muted, #94a3b8)" }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background: "var(--iframe-surface, #f1f5f9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 0.75rem",
                            }}
                          >
                            <CalendarX className="w-6 h-6" style={{ opacity: 0.6 }} />
                          </div>
                          <p style={{ margin: "0 0 0.25rem" }}>Nenhum horário disponível neste dia</p>
                          <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>Tente selecionar outro dia no calendário.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {times.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              className={`iframe-slot py-3 px-3 rounded-lg text-sm text-center font-medium${time === t.id ? " selected" : ""}`}
                              onClick={() => {
                                setTime(t.id);
                                setOnForm(true);
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {onForm && !booked && agenda && options && day && (
            <div className="iframe-card p-0 overflow-auto booking-step-anim">
              <div className="booking-summary-header sticky">
                <div className="booking-summary-row">
                  <div className="booking-summary-info">
                    <span className="booking-summary-name">{agenda.name}</span>
                    <div className="booking-summary-meta">
                      <span>
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{longDay(day)}</span>
                      </span>
                      <span className="booking-summary-time">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{time.slice(11, 16)}</span>
                      </span>
                      {service && (
                        <span>
                          <Tag className="w-3.5 h-3.5" />
                          <span>{service.name}</span>
                        </span>
                      )}
                      {service?.price != null && (
                        <span className="booking-summary-time">
                          <Banknote className="w-3.5 h-3.5" />
                          <span>{money(service.price)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button type="button" className="booking-summary-change" onClick={() => setOnForm(false)}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Alterar
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: "var(--iframe-text)" }}>
                  <User className="w-4 h-4" />
                  Seus Dados
                </h2>
                <div className="iframe-form-container space-y-3">
                  {formFields(options).map((f) => (
                    <div key={f.name} className="iframe-form-group">
                      <label className="iframe-form-label" htmlFor={`booking-${f.name}`}>
                        {f.label}
                        {f.required && " *"}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea
                          id={`booking-${f.name}`}
                          rows={3}
                          value={fields[f.name] ?? ""}
                          onChange={(e) => setFields({ ...fields, [f.name]: e.target.value })}
                        />
                      ) : (
                        <input
                          id={`booking-${f.name}`}
                          type={f.type}
                          required={f.required}
                          value={fields[f.name] ?? ""}
                          onChange={(e) => setFields({ ...fields, [f.name]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {options.password && (
                  <div className="mt-4">
                    <label htmlFor="booking-pass-agenda" className="block text-xs font-semibold mb-1" style={{ color: "var(--iframe-text)" }}>
                      <Lock className="w-3.5 h-3.5 inline-block align-text-bottom" /> Senha para Agendamento
                    </label>
                    <input
                      type="password"
                      id="booking-pass-agenda"
                      autoComplete="off"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--iframe-border, #e5e7eb)" }}
                      placeholder="Informe a senha fornecida"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--iframe-muted)" }}>
                      Esta agenda exige uma senha para confirmar o agendamento.
                    </p>
                  </div>
                )}

                {options.allowRecurring && (
                  <div className="booking-recurrence mt-4">
                    <label className="flex items-start gap-2 cursor-pointer text-sm font-medium" style={{ color: "var(--iframe-primary-text)" }}>
                      <input type="checkbox" className="mt-0.5" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
                      <span>
                        <Repeat className="w-4 h-4 inline-block align-text-bottom" /> Tornar este um agendamento recorrente
                      </span>
                    </label>
                    {recurring && (
                      <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--accent-tint)", border: "1px solid var(--iframe-border, #e5e7eb)" }}>
                        <p className="text-xs mb-2" style={{ color: "var(--iframe-muted)" }}>
                          Repetir o agendamento em...
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {WEEKDAY_CHIPS.map((label, i) => (
                            <button
                              key={label}
                              type="button"
                              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                              style={
                                weekdays.includes(i)
                                  ? { background: "var(--accent)", color: "var(--accent-contrast)", borderColor: "var(--accent)" }
                                  : { background: "#fff", color: "var(--iframe-primary-text)", borderColor: "var(--iframe-border, #e5e7eb)" }
                              }
                              onClick={() => setWeekdays(weekdays.includes(i) ? weekdays.filter((w) => w !== i) : [...weekdays, i])}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 mb-3">
                  <label className="flex items-start gap-2 cursor-pointer text-xs" style={{ color: "var(--iframe-muted)" }}>
                    <input type="checkbox" className="mt-0.5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                    <span>Ao confirmar, você concorda com os Termos de Uso e a Política de Privacidade.</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" className="booking-back-btn" onClick={() => setOnForm(false)}>
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>
                  <div className="flex-1" />
                  <button type="button" className="iframe-btn-primary relative text-sm font-medium text-white" onClick={submit}>
                    <span className="inline-flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      Confirmar Agendamento
                    </span>
                  </button>
                </div>
                {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
              </div>
            </div>
          )}

          {booked && (
            <div className="iframe-card p-6 space-y-4 booking-step-anim">
              <div className="text-center space-y-1">
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent-tint)" }}>
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-heading font-bold" style={{ color: "var(--iframe-text)" }}>
                  Agendamento confirmado
                </h2>
                <p className="text-sm" style={{ color: "var(--iframe-muted)" }}>
                  Você receberá a confirmação assim que {orgName} aceitar o horário.
                </p>
              </div>
              <div className="booking-receipt-rows rounded-lg p-4 text-left" style={{ backgroundColor: "var(--iframe-surface)" }}>
                <div className="booking-receipt-row">
                  <Calendar />
                  <span className="lbl">Agenda:</span>
                  <span className="val">{agenda?.name}</span>
                </div>
                <div className="booking-receipt-row">
                  <Clock />
                  <span className="val">
                    {day && longDay(day)} • {booked.start.slice(11, 16)}
                  </span>
                </div>
                {service?.price != null && (
                  <div className="booking-receipt-row">
                    <Banknote />
                    <span className="lbl">Valor:</span>
                    <span className="val">{money(service.price)}</span>
                  </div>
                )}
                <div className="booking-receipt-row">
                  <Hash />
                  <span className="lbl">Código:</span>
                  <span className="val">{booked.code}</span>
                </div>
              </div>
              <div className="booking-pre-text">
                <AlertCircle className="w-4 h-4" style={{ color: "var(--iframe-secondary-text)", flexShrink: 0, marginTop: 1 }} />
                <div>Guarde o código acima: é por ele que o atendimento é localizado.</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer open={footerOpen} onToggle={() => setFooterOpen((v) => !v)} />
    </>
  );
}

function Footer({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <footer className={`booking-footer${open ? " open" : ""}`}>
      <button type="button" className="booking-footer-toggle" aria-expanded={open} aria-controls="booking-footer-details" onClick={onToggle}>
        <span>{open ? "Menos informações" : "Mais informações"}</span>
        <ChevronDown className="w-4 h-4 booking-footer-chevron" />
      </button>
      <div className="booking-footer-details" id="booking-footer-details">
        <div className="booking-footer-details-clip">
          <div className="booking-footer-inner">
            <div className="booking-footer-zone booking-footer-zone-right">
              <h5 className="booking-footer-label">Links Úteis</h5>
              <div className="booking-footer-links">
                {/* The clone has no sign-in, so the original's "Login" link has nowhere to go. */}
                <span>Login</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="booking-footer-bottom">
        <p>Agendamento online por Seiri</p>
      </div>
    </footer>
  );
}
