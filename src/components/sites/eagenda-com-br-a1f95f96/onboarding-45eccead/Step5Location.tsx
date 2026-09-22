"use client";

import { useState } from "react";
import { ChevronLeftIcon, InfoIcon, MapPinIcon, ShopIcon, VideoIcon } from "../shared/icons";
import { BackButton, ForwardButton, delay } from "./parts";
import type { StepProps } from "./types";

type Mode = "presencial" | "online" | "ambos";

const CARDS: [Mode, string, string, React.ReactNode, number][] = [
  [
    "presencial",
    "Presencial",
    "O cliente vai até um endereço.",
    <ShopIcon key="p" className="w-7 h-7 text-accent group-hover:text-white transition-colors" />,
    60,
  ],
  ["online", "Online", "Atendimento por videochamada.", <VideoIcon key="o" className="w-7 h-7 text-accent group-hover:text-white transition-colors" />, 140],
  [
    "ambos",
    "Os dois",
    "Presencial e online, conforme o caso.",
    <MapPinIcon key="a" className="w-7 h-7 text-accent group-hover:text-white transition-colors" />,
    220,
  ],
];

const maskCep = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

/** Step 5 — "Atendimento": the address, the video platform, or both. */
export function Step5Location({ phase, setPhase, onNext, onBack }: StepProps) {
  const [mode, setMode] = useState<Mode>("presencial");
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [provider, setProvider] = useState("meet");

  const needsAddress = mode === "presencial" || mode === "ambos";
  const needsVideo = mode === "online" || mode === "ambos";
  const canSave = !needsAddress || (cep.replace(/\D/g, "").length === 8 && !!number.trim());

  const fetchCep = async () => {
    const digits = cep.replace(/\D/g, "");
    setLookup("");
    setLookupError("");
    if (digits.length !== 8) return;
    try {
      const data = await fetch(`https://viacep.com.br/ws/${digits}/json/`).then((r) => r.json());
      if (data.erro) {
        setLookupError("CEP não encontrado.");
        return;
      }
      setLookup([data.logradouro, data.bairro, data.localidade && `${data.localidade}/${data.uf}`].filter(Boolean).join(", "));
    } catch {
      setLookupError("Não consegui consultar o CEP agora.");
    }
  };

  if (phase === "ask") {
    return (
      <section className="min-h-full flex flex-col items-center justify-center text-center px-6 py-8">
        <p className="onb-in text-[13px] font-bold uppercase tracking-[.16em] text-accent mb-3" style={delay(0)}>
          ETAPA 5 DE 7
        </p>
        <h1 className="onb-in text-[38px] sm:text-[46px] leading-[1.06] text-balance font-[700] text-foreground" style={delay(90)}>
          Onde você atende?
        </h1>
        <p className="onb-in text-[19px] leading-relaxed text-pretty text-muted max-w-lg mx-auto mt-5" style={delay(180)}>
          É o que o cliente precisa saber para chegar até você — endereço ou link da chamada.
        </p>
        <div className="onb-in grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl w-full mt-9" style={delay(270)}>
          {CARDS.map(([value, title, desc, icon, d]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setPhase("config");
              }}
              className="onb-rise group bg-surface border border-border rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-accent hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
              style={delay(d)}
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">{icon}</div>
              <div className="text-[20px] font-[700] text-foreground mb-1.5">{title}</div>
              <p className="text-[15px] leading-relaxed text-muted">{desc}</p>
            </button>
          ))}
        </div>
        <div className="onb-in mt-7" style={delay(340)}>
          <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onBack}>
            <ChevronLeftIcon />
            Voltar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full flex flex-col justify-start max-w-lg w-full mx-auto px-6 pt-6 pb-10">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">
          {mode === "online" ? "Sua videochamada" : mode === "presencial" ? "Seu endereço" : "Endereço e videochamada"}
        </h2>
        <p className="text-[16px] text-muted mt-2 mb-7">
          {needsAddress ? "Informe o CEP e o número — o resto a gente completa." : "Escolha a plataforma que você usa para atender."}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {needsAddress && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-40">
                <label htmlFor="onb-cep" className="text-sm font-semibold text-foreground">
                  CEP
                </label>
                <input
                  type="text"
                  id="onb-cep"
                  name="cep"
                  inputMode="numeric"
                  maxLength={9}
                  className="hinput hinput--bordered w-full mt-1.5"
                  value={cep}
                  onChange={(e) => setCep(maskCep(e.target.value))}
                  onBlur={fetchCep}
                  placeholder="00000-000"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="onb-num" className="text-sm font-semibold text-foreground">
                  Número
                </label>
                <input
                  type="text"
                  id="onb-num"
                  name="number"
                  maxLength={10}
                  className="hinput hinput--bordered w-full mt-1.5"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>
            <div>
              <label htmlFor="onb-comp" className="text-sm font-semibold text-foreground">
                Complemento <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input
                type="text"
                id="onb-comp"
                name="complement"
                maxLength={200}
                className="hinput hinput--bordered w-full mt-1.5"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Sala 12, bloco B…"
              />
            </div>
            {lookup && (
              <p className="flex items-start gap-2 text-[14px] text-muted">
                <MapPinIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{lookup}</span>
              </p>
            )}
            {lookupError && <p className="text-[14px] text-danger">{lookupError}</p>}
          </div>
        )}

        {needsVideo && (
          <div className={needsAddress ? "mt-7 pt-7 border-t border-border" : ""}>
            <label htmlFor="onb-provider" className="text-sm font-semibold text-foreground">
              Plataforma de videochamada
            </label>
            <p className="text-[13px] text-muted mt-0.5 mb-2">O link é gerado automaticamente em cada agendamento.</p>
            <select
              id="onb-provider"
              name="video_provider"
              className="hinput hinput--bordered hselect-native w-full"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
              <option value="zoom">Zoom</option>
              <option value="other">Outros</option>
            </select>
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-accent/5 border border-accent/15 px-4 py-3">
              <InfoIcon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-[13px] leading-snug text-muted">Para o link sair automaticamente, conecte sua conta em Integrações depois do onboarding.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-9">
          <BackButton onClick={() => setPhase("ask")} />
          <ForwardButton label="Salvar e avançar" disabled={!canSave} submit />
        </div>
      </form>
    </section>
  );
}
