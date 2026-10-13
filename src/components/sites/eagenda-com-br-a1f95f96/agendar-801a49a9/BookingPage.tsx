"use client";

import { useState, useSyncExternalStore } from "react";
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
import { MONTHS, WEEKDAYS_SHORT, addMonths } from "../shared/calendarDates";
import {
  dateFirstCells,
  dateStr,
  formFields,
  monthCells,
  optionsOf,
  publicAgendas,
  rulesOf,
  servicesOf,
  timesOf,
  type DateFirstCell,
  type DayCell as DayCellData,
} from "@/lib/seiri/booking";
import { flowQuery, readFlow, startsFlow, type Flow } from "@/lib/seiri/bookingUrl";
import { accessRefusal, clientByLink, denied, identify, isListed, prompt } from "@/lib/seiri/access";
import { knownClient, refusalFor } from "@/lib/seiri/publicBooking";
import { nextId, update, useData } from "@/lib/seiri/store";
import type { Agenda, Appointment, Client } from "@/lib/seiri/types";

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

function StepCard({
  title,
  context,
  onBack,
  backTitle = "Voltar",
  children,
}: {
  title: string;
  context?: React.ReactNode;
  onBack?: () => void;
  backTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 booking-step-anim">
      <div className="booking-step-card">
        <div className="booking-step-head">
          <div className="booking-step-head-info">
            <h2 className="booking-step-title">{title}</h2>
            {context && <p className="booking-step-context">{context}</p>}
          </div>
          {onBack && (
            <button type="button" className="booking-back-btn" title={backTitle} onClick={onBack}>
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

/**
 * One day of a month grid: the button, the dot under a day that has room and the bar over one that is full or a
 * holiday. The agenda's own calendar dims those two as it dims a day it does not work; "Por Data" does not.
 */
function DayCell({ cell, selected, dimBlocked, onPick }: { cell: DayCellData | DateFirstCell; selected: boolean; dimBlocked: boolean; onPick: () => void }) {
  const blocked = cell.status === "full" || cell.status === "holiday";
  const dim = cell.isPast || (dimBlocked ? !cell.hasAvailability : !cell.hasAvailability && !blocked);
  return (
    <>
      <button
        type="button"
        disabled={cell.isPast || !cell.hasAvailability}
        title={cell.status === "full" ? "Sem vagas neste dia" : cell.status === "holiday" ? "Feriado / indisponível" : ""}
        className={[
          "iframe-day w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-150",
          selected ? "selected" : "",
          cell.isToday && !selected ? "today" : "",
          !cell.isPast && cell.hasAvailability && (dimBlocked ? !selected : true) ? "cursor-pointer font-medium" : "",
          dim ? "opacity-30 cursor-default" : "",
          blocked ? "iframe-day-blocked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onPick}
      >
        {cell.day}
      </button>
      {cell.hasAvailability && !cell.isPast && !selected && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full iframe-avail-dot pointer-events-none" />
      )}
      {blocked && <span className={`iframe-blocked-mark pointer-events-none${cell.status === "holiday" ? " is-holiday" : ""}`} />}
    </>
  );
}

const addressListeners = new Set<() => void>();

/** The address's query string, where the flow lives: re-read when a step pushes a new one and on the browser's Back and Forward. */
function subscribeAddress(onChange: () => void) {
  addressListeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    addressListeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const readAddress = () => window.location.search;

/** Moves the flow to `patch` on top of what the address holds, as a history entry the Back button can return to. */
function goTo(patch: Partial<Flow>) {
  const { pathname, search } = window.location;
  const query = flowQuery(search, { ...readFlow(search), ...patch });
  const url = pathname + (query ? `?${query}` : "");
  if (url !== pathname + search) window.history.pushState(null, "", url);
  addressListeners.forEach((listener) => listener());
}

/** What an agenda is called in the address: its identifier, or its id when it has none. */
const agendaKey = (a: Agenda) => a.slug || a.id;
const CLEARED = { agenda: "", servico: "", data: "", hora: "" };

/** The public booking screen, the page a client opens from an agenda's link. */
export function BookingPage() {
  const data = useData();
  // The flow (unit, agenda, service, day, time) lives in the address, so each step has a link and Back walks them.
  // An agenda's own link carries ?agenda=<identificador> and opens the flow already on that agenda.
  const search = useSyncExternalStore(subscribeAddress, readAddress, () => "");
  const flow = readFlow(search);
  const [now] = useState(() => new Date());
  const [started, setStarted] = useState(false);
  // "Todas as unidades" is not in the address, as in the original, where it is a unit with no id.
  const [allUnits, setAllUnits] = useState(false);
  // "Por Data": the month on show and the day picked before an agenda is. The original keeps them out of the address
  // too, until an agenda is chosen and the day goes in as ?data=.
  const [dateMonth, setDateMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [dateDay, setDateDay] = useState("");
  // For an agenda that only authorized clients may book: the key the visitor typed, who it opened, and what it was told.
  const [typedKey, setTypedKey] = useState("");
  const [identifiedId, setIdentifiedId] = useState("");
  const [accessError, setAccessError] = useState("");
  // The month the visitor paged to, good only while the day in the address is the one it was paged on.
  const [paged, setPaged] = useState<{ month: Date; day: string } | null>(null);
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
  const unit = units.find((u) => u.id === flow.unidade) ?? null;
  const unitId = unit ? unit.id : allUnits ? "all" : null;
  const mode: Mode = flow.modo === "servico" ? "service" : flow.modo === "data" ? "date" : "agenda";
  const all = publicAgendas(data);
  const agendas = unit ? all.filter((a) => a.unitId === unit.id) : all;
  const needsUnit = units.length > 0 && unitId === null;

  // A lone agenda, and a lone service, are chosen for the visitor, as the original does.
  const agenda = needsUnit ? null : (agendas.find((a) => agendaKey(a) === flow.agenda) ?? (agendas.length === 1 ? agendas[0] : null));
  const options = agenda ? optionsOf(data, agenda.id) : null;
  const rules = agenda ? rulesOf(data, agenda.id) : null;
  const subTypes = agenda ? servicesOf(data, agenda.id) : [];
  const service = subTypes.find((s) => s.id === flow.servico) ?? (subTypes.length === 1 ? subTypes[0] : null);
  const allServices = data.services.filter((s) => agendas.some((a) => s.agendaIds.includes(a.id))).sort((a, b) => a.order - b.order);

  const needsService = Boolean(agenda && subTypes.length > 0 && !service);
  const calendarReady = Boolean(agenda && !needsService);

  // "Somente Agendamento Autorizado": the visitor is who the personal link (?cliente=) names, or who the key they typed
  // opened, and must be on a list in force for this agenda and service. Until then neither calendar nor form shows.
  const accessSlot = agenda ? { agendaId: agenda.id, serviceId: service?.id ?? "" } : null;
  const restricted = Boolean(calendarReady && accessSlot && options?.authorizedOnly);
  const visitor = restricted
    ? (clientByLink(data, new URLSearchParams(search).get("cliente") ?? "") ?? data.clients.find((c) => c.id === identifiedId && !c.inactive) ?? null)
    : null;
  const needsAccess = restricted && !(visitor && accessSlot && isListed(data, visitor, accessSlot, now));
  const canBook = calendarReady && !needsAccess;
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // A day or time in the address that the agenda cannot offer reads as not chosen.
  const chosenDay = flow.data ? new Date(`${flow.data}T00:00:00`) : null;
  const times = agenda && canBook && chosenDay ? timesOf(data, agenda.id, chosenDay, now) : [];
  const day = times.length > 0 ? chosenDay : null;
  const time = (day && times.find((t) => t.label === flow.hora)?.id) || "";
  const onForm = Boolean(time);
  const month = paged && paged.day === flow.data ? paged.month : day ? new Date(day.getFullYear(), day.getMonth(), 1) : thisMonth;
  const cells = agenda && canBook ? monthCells(data, agenda.id, month, now) : [];
  const dateCells = !needsUnit && mode === "date" && !agenda ? dateFirstCells(data, agendas, dateMonth, now) : [];
  const onThatDay = agendas.filter((a) => dateCells.find((c) => c?.dateStr === dateDay)?.agendaIds.includes(a.id));

  const duration = service?.duration || rules?.duration || 30;
  const unitLabel = unit?.name ?? "";
  const canGoBack = month > thisMonth;

  const resetSelection = () => goTo(CLEARED);
  const chooseUnit = (id: string) => {
    setAllUnits(false);
    goTo({ unidade: id, ...CLEARED });
  };
  const browseBy = (modo: Flow["modo"]) => {
    setDateDay("");
    setDateMonth(thisMonth);
    goTo({ modo, ...CLEARED });
  };
  const pageDates = (by: number) => {
    setDateMonth(addMonths(dateMonth, by));
    setDateDay("");
  };
  /** A day with room is picked; when only one agenda has it, that agenda is chosen with it. */
  const pickDate = (cell: DateFirstCell) => {
    setDateDay(cell.dateStr);
    const only = cell.agendaIds.length === 1 ? agendas.find((a) => a.id === cell.agendaIds[0]) : undefined;
    if (only) goTo({ agenda: agendaKey(only), servico: "", data: cell.dateStr, hora: "" });
  };

  /** A form field's value: what was typed, or else what the identified client has on file. */
  const val = (name: string) => fields[name] ?? String((visitor as Record<string, unknown> | null)?.[name] ?? "");

  const submit = () => {
    if (!agenda || !day || !time) return;
    if (!accepted) return setError("Você precisa aceitar os termos para continuar.");
    if (options?.password && password !== options.password) return setError("Senha inválida para esta agenda.");
    if (!val("name").trim()) return setError("Informe o seu nome.");
    const details: Omit<Client, "id"> = {
      name: val("name").trim(),
      email: val("email"),
      phone: val("phone"),
      cpf: val("cpf") || undefined,
      birthday: val("birthday") || undefined,
      nationality: val("nationality") || undefined,
      placeOfBirth: val("placeOfBirth") || undefined,
      profession: val("profession") || undefined,
      identificationNumber: val("identificationNumber") || undefined,
    };
    const slot = { agendaId: agenda.id, serviceId: service?.id ?? "", start: time };
    // An agenda for authorized clients books for the client the visitor was identified as, and only if their list allows this slot.
    if (restricted) {
      if (!visitor) return setError(denied(data, slot, new Date()));
      const barred = accessRefusal(data, visitor, slot, new Date());
      if (barred) return setError(barred);
    }
    // Someone with the e-mail or phone typed is already a client: the booking is theirs, and counts toward their limits.
    const known = visitor ?? knownClient(data, details);
    const refusal = refusalFor(data, known ?? { id: nextId("c", data.clients), ...details }, slot, orgName);
    if (refusal) return setError(refusal);
    setError("");
    update((d) => {
      const clientId = known?.id ?? nextId("c", d.clients);
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
        comment: val("comment"),
        createdAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      };
      setBooked(appointment);
      return { ...d, clients: known ? d.clients : [...d.clients, { id: clientId, ...details }], appointments: [...d.appointments, appointment] };
    });
  };

  if (!started && !startsFlow(flow) && !booked) {
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

  // The receipt is of what was booked, whatever the address says now.
  const bookedService = booked ? data.services.find((s) => s.id === booked.serviceId) : undefined;
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
                  <button key={u.id} type="button" className="booking-unit-card" onClick={() => chooseUnit(u.id)}>
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
                <button
                  type="button"
                  className="booking-unit-card"
                  style={{ borderStyle: "dashed" }}
                  onClick={() => {
                    setAllUnits(true);
                    goTo({ unidade: "", ...CLEARED });
                  }}
                >
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

          {!needsUnit && !calendarReady && !onForm && !booked && agendas.length > 1 && (
            <div className="booking-tabs booking-step-anim">
              <button type="button" className={`booking-tab${mode === "agenda" ? " active" : ""}`} onClick={() => browseBy("")}>
                <CalendarDays className="w-3.5 h-3.5 inline -mt-0.5" /> Por Agenda
              </button>
              {allServices.length > 0 && (
                <button type="button" className={`booking-tab${mode === "service" ? " active" : ""}`} onClick={() => browseBy("servico")}>
                  <List className="w-3.5 h-3.5 inline -mt-0.5" /> Por Serviço
                </button>
              )}
              <button type="button" className={`booking-tab${mode === "date" ? " active" : ""}`} onClick={() => browseBy("data")}>
                <CalendarSearch className="w-3.5 h-3.5 inline -mt-0.5" /> Por Data
              </button>
            </div>
          )}

          {!needsUnit && mode === "date" && !agenda && (
            <StepCard title="Escolha a Data" context={<span>Dias com horários disponíveis estão destacados</span>}>
              <div className="flex items-center justify-between mb-2">
                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600" onClick={() => pageDates(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-semibold text-slate-800 capitalize">
                  {MONTHS[dateMonth.getMonth()]} {dateMonth.getFullYear()}
                </h3>
                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600" onClick={() => pageDates(1)}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0">
                {WEEKDAYS_SHORT.map((w) => (
                  <span key={w} className="text-center text-xs font-medium text-slate-400 py-1">
                    {w}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0 mt-1">
                {dateCells.map((cell, i) => (
                  <div key={i} className="flex items-center justify-center p-0.5 relative">
                    {cell && (
                      <DayCell
                        cell={cell}
                        selected={cell.dateStr === dateDay}
                        dimBlocked={false}
                        onPick={() => cell.hasAvailability && !cell.isPast && pickDate(cell)}
                      />
                    )}
                  </div>
                ))}
              </div>
              {dateCells.some((c) => c && (c.status === "full" || c.status === "holiday")) && (
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
            </StepCard>
          )}

          {!needsUnit && mode === "date" && !agenda && dateDay && onThatDay.length > 1 && (
            <StepCard
              title="Escolha a Agenda"
              context={
                <span>
                  <Calendar className="w-3.5 h-3.5" />
                  Disponíveis em {dateDay.split("-").reverse().join("/")}
                </span>
              }
              backTitle="Escolher outra data"
              onBack={() => setDateDay("")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {onThatDay.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="booking-agenda-card"
                    onClick={() => goTo({ agenda: agendaKey(a), servico: "", data: dateDay, hora: "" })}
                  >
                    <span className="booking-agenda-card-avatar">{a.name.charAt(0).toUpperCase()}</span>
                    <span className="booking-agenda-card-info">
                      <span className="booking-agenda-card-title">{a.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {!needsUnit && mode === "agenda" && !agenda && agendas.length > 0 && (
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
              onBack={
                units.length
                  ? () => {
                      setAllUnits(false);
                      goTo({ unidade: "", ...CLEARED });
                    }
                  : undefined
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {agendas.map((a) => {
                  const subs = servicesOf(data, a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="booking-agenda-card"
                      onClick={() => goTo({ agenda: agendaKey(a), servico: "", data: "", hora: "" })}
                    >
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
            <StepCard
              title="Escolha o Serviço"
              onBack={
                units.length
                  ? () => {
                      setAllUnits(false);
                      goTo({ unidade: "", ...CLEARED });
                    }
                  : undefined
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="booking-service-card"
                    onClick={() => {
                      const offers = agendas.find((a) => s.agendaIds.includes(a.id));
                      goTo({ servico: s.id, agenda: offers ? agendaKey(offers) : "", data: "", hora: "" });
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
                  <button
                    key={s.id}
                    type="button"
                    className="booking-service-card"
                    onClick={() => goTo({ servico: s.id, data: mode === "date" ? flow.data : "", hora: "" })}
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

          {needsAccess && !booked && (
            <StepCard
              title="Identifique-se"
              context={
                <span>
                  <Lock className="w-3.5 h-3.5" />
                  {agenda?.name}
                </span>
              }
              onBack={() => resetSelection()}
            >
              {visitor ? (
                <p className="text-sm" style={{ color: "var(--iframe-text)" }}>
                  {denied(data, accessSlot!, now)}
                </p>
              ) : (
                <form
                  className="iframe-form-container space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const found = identify(data, accessSlot!, typedKey, now);
                    setAccessError(found ? "" : denied(data, accessSlot!, now));
                    if (found) setIdentifiedId(found.id);
                  }}
                >
                  <div className="iframe-form-group">
                    <label className="iframe-form-label" htmlFor="booking-access-key">
                      {prompt(data, accessSlot!, now).label}
                    </label>
                    <input id="booking-access-key" type="text" autoComplete="off" value={typedKey} onChange={(e) => setTypedKey(e.target.value)} />
                    {prompt(data, accessSlot!, now).help && (
                      <p className="text-xs mt-1" style={{ color: "var(--iframe-muted)" }}>
                        {prompt(data, accessSlot!, now).help}
                      </p>
                    )}
                  </div>
                  {accessError && <p className="text-xs text-red-500">{accessError}</p>}
                  <button type="submit" className="iframe-btn-primary relative text-sm font-medium text-white">
                    Continuar
                  </button>
                </form>
              )}
            </StepCard>
          )}

          {canBook && !onForm && !booked && (
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
                        onClick={() => setPaged({ month: addMonths(month, -1), day: flow.data })}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-sm font-semibold text-slate-800 capitalize">
                        {MONTHS[month.getMonth()]} {month.getFullYear()}
                      </h3>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        onClick={() => setPaged({ month: addMonths(month, 1), day: flow.data })}
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
                            <DayCell
                              cell={cell}
                              selected={Boolean(day) && dateStr(day!) === cell.dateStr}
                              dimBlocked
                              onPick={() => goTo({ data: cell.dateStr, hora: "" })}
                            />
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
                              onClick={() => goTo({ hora: t.label })}
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
                  <button type="button" className="booking-summary-change" onClick={() => goTo({ hora: "" })}>
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
                        <textarea id={`booking-${f.name}`} rows={3} value={val(f.name)} onChange={(e) => setFields({ ...fields, [f.name]: e.target.value })} />
                      ) : (
                        <input
                          id={`booking-${f.name}`}
                          type={f.type}
                          required={f.required}
                          readOnly={Boolean(visitor)}
                          value={val(f.name)}
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
                  <button type="button" className="booking-back-btn" onClick={() => goTo({ hora: "" })}>
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
                  <span className="val">{data.agendas.find((a) => a.id === booked.agendaId)?.name}</span>
                </div>
                <div className="booking-receipt-row">
                  <Clock />
                  <span className="val">
                    {longDay(new Date(`${booked.start.slice(0, 10)}T00:00:00`))} • {booked.start.slice(11, 16)}
                  </span>
                </div>
                {bookedService?.price != null && (
                  <div className="booking-receipt-row">
                    <Banknote />
                    <span className="lbl">Valor:</span>
                    <span className="val">{money(bookedService.price)}</span>
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
