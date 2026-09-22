"use client";

import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ClipboardIcon, PlusCircleIcon, TrashIcon } from "../shared/icons";
import { AskScreen, BackButton, ChoiceCard, ForwardButton, delay } from "./parts";
import type { StepProps } from "./types";

const DURATIONS = ["15", "30", "45", "60", "90", "120"] as const;
const DURATION_LABELS: Record<string, string> = { "15": "15 min", "30": "30 min", "45": "45 min", "60": "1 hora", "90": "1h30", "120": "2 horas" };
const MAX_SERVICES = 10;

type Service = { name: string; duration: string; price: string };
type Mode = "multiple" | "single";

/** Step 3 — "Agenda": name of the agenda plus either a service list or a single slot length. */
export function Step3Agenda({ phase, setPhase, onNext, onBack }: StepProps) {
  const [mode, setMode] = useState<Mode>("multiple");
  const [sub, setSub] = useState(0);
  const [agendaName, setAgendaName] = useState("");
  const [singleDuration, setSingleDuration] = useState("30");
  const [services, setServices] = useState<Service[]>([{ name: "", duration: "30", price: "" }]);

  const subSteps = ["agenda", mode === "single" ? "duration" : "services"];
  const currentSub = subSteps[sub] ?? "agenda";
  const named = services.filter((s) => s.name.trim());
  const canAdvance = currentSub === "agenda" ? !!agendaName.trim() : currentSub === "services" ? named.length > 0 : true;

  const choose = (next: Mode) => {
    setMode(next);
    setSub(0);
    setPhase("config");
  };
  const patch = (i: number, field: keyof Service, value: string) => setServices((list) => list.map((s, j) => (j === i ? { ...s, [field]: value } : s)));

  if (phase === "ask") {
    return (
      <AskScreen
        lottie="services"
        size={200}
        speed={0.5}
        lottieClass="mx-auto mb-5"
        lottieStyle={{ maxWidth: "60vw" }}
        step={3}
        title="Como você atende?"
        lead="Isso define como montamos sua agenda, dá para mudar depois."
      >
        <div className="onb-in grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-2xl w-full mt-8" style={delay(1080)}>
          <ChoiceCard
            icon={<ClipboardIcon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />}
            title="Ofereço serviços"
            desc="Tenho um ou mais serviços com nome, duração e preço."
            delay={60}
            onClick={() => choose("multiple")}
          />
          <ChoiceCard
            icon={<CalendarIcon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />}
            title="Agendamento único"
            desc="Uma agenda simples, como reuniões de alinhamento."
            delay={160}
            onClick={() => choose("single")}
          />
        </div>
        <div className="onb-in mt-6" style={delay(1160)}>
          <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onBack}>
            <ChevronLeftIcon />
            Voltar
          </button>
        </div>
      </AskScreen>
    );
  }

  return (
    <section className="min-h-full flex flex-col justify-start max-w-xl w-full mx-auto px-6 pt-4 pb-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {currentSub === "agenda" && (
          <div className="text-center">
            <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">Como vamos chamar sua agenda?</h2>
            <p className="text-[16px] text-muted mt-2 mb-6">É o nome que aparece para o cliente ao escolher onde agendar.</p>
            <input
              type="text"
              name="agenda_name"
              className="hinput hinput--lg hinput--bordered w-full text-center !text-[20px] !h-14"
              value={agendaName}
              maxLength={250}
              onChange={(e) => setAgendaName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (canAdvance) setSub(sub + 1);
              }}
              placeholder="Ex.: Agenda Principal"
            />
          </div>
        )}

        {currentSub === "services" && (
          <div>
            <div className="text-center">
              <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">Quais serviços você oferece?</h2>
              <p className="text-[16px] text-muted mt-2 mb-6">Cadastre quantos quiser agora — o preço é opcional.</p>
            </div>
            <div className="space-y-3">
              {services.map((svc, i) => (
                <div key={i} className="rounded-2xl border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <input
                        type="text"
                        className="hinput hinput--bordered w-full"
                        value={svc.name}
                        maxLength={100}
                        onChange={(e) => patch(i, "name", e.target.value)}
                        placeholder="Ex.: Corte de cabelo"
                      />
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1">
                          <label className="sr-only" htmlFor={`svc-dur-${i}`}>
                            Duração
                          </label>
                          <select
                            id={`svc-dur-${i}`}
                            className="hinput hinput--bordered hselect-native w-full"
                            value={svc.duration}
                            onChange={(e) => patch(i, "duration", e.target.value)}
                          >
                            {DURATIONS.map((v) => (
                              <option key={v} value={v}>
                                {DURATION_LABELS[v]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 flex items-stretch">
                          <span className="inline-flex items-center px-3 text-[14px] font-semibold text-muted bg-default border border-r-0 border-border rounded-l-xl">
                            R$
                          </span>
                          <label className="sr-only" htmlFor={`svc-price-${i}`}>
                            Preço
                          </label>
                          <input
                            type="number"
                            id={`svc-price-${i}`}
                            className="hinput hinput--bordered flex-1 min-w-0"
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                            placeholder="0,00"
                            step="0.01"
                            min="0"
                            value={svc.price}
                            onChange={(e) => patch(i, "price", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setServices((list) => list.filter((_, j) => j !== i))}
                        className="p-2 rounded-lg text-danger/70 hover:bg-danger/10 hover:text-danger transition-colors flex-shrink-0"
                        aria-label="Remover serviço"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              {services.length < MAX_SERVICES ? (
                <button
                  type="button"
                  className="hbtn hbtn--ghost hbtn--sm"
                  onClick={() => setServices((list) => [...list, { name: "", duration: singleDuration, price: "" }])}
                >
                  <PlusCircleIcon />
                  Adicionar serviço
                </button>
              ) : (
                <span className="text-[13px] text-muted">Máximo de 10 serviços por aqui — o resto você cadastra nas Configurações.</span>
              )}
            </div>
          </div>
        )}

        {currentSub === "duration" && (
          <div className="text-center">
            <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">Quanto tempo dura?</h2>
            <p className="text-[16px] text-muted mt-2 mb-6">Duração de cada horário na sua agenda.</p>
            <div className="grid grid-cols-3 gap-3">
              {DURATIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSingleDuration(v)}
                  className={`rounded-2xl border-2 py-4 text-[18px] font-semibold transition-all ${
                    singleDuration === v ? "border-accent bg-accent/5 text-accent" : "border-border bg-surface text-foreground hover:border-accent/40"
                  }`}
                >
                  {DURATION_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-8">
          <BackButton onClick={() => (sub > 0 ? setSub(sub - 1) : setPhase("ask"))} />
          {sub < subSteps.length - 1 ? (
            <ForwardButton label="Próximo" disabled={!canAdvance} onClick={() => setSub(sub + 1)} />
          ) : (
            <ForwardButton label="Salvar e avançar" disabled={!canAdvance} submit />
          )}
        </div>
      </form>
    </section>
  );
}
