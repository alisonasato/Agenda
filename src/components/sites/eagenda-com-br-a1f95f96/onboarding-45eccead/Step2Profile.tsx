"use client";

import { useState } from "react";
import { ColorPicker } from "../shared/ColorPicker";
import { PhoneInput } from "../shared/PhoneInput";
import { GalleryIcon } from "../shared/icons";
import { AskScreen, StepNav, delay } from "./parts";
import type { StepProps } from "./types";

/** Contrast ink for the "Ficará assim" chip: dark text over light accents, white over dark ones. */
function textOn(accent: string) {
  let hex = accent.replace("#", "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return "#ffffff";
  const lin = [0, 2, 4].map((i) => {
    const v = parseInt(hex.substr(i, 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] > 0.4 ? "#0b0f1a" : "#ffffff";
}

/** Step 2 — "Perfil": logo, colour, contact and welcome message of the booking page. */
export function Step2Profile({ phase, setPhase, onNext, onBack }: StepProps) {
  const [logo, setLogo] = useState("");
  const [accent, setAccent] = useState("#0A70D6");
  const [message, setMessage] = useState("");

  if (phase === "ask") {
    return (
      <AskScreen
        lottie="hello"
        size={220}
        speed={0.6}
        lottieStyle={{ maxWidth: "64vw" }}
        step={2}
        title="Quer deixar sua página com a sua cara?"
        lead="Seu logo e sua mensagem aparecem para o cliente na hora de agendar, e o contato é para onde ele responde as confirmações."
      >
        <div className="onb-in flex flex-col sm:flex-row items-center gap-3 mt-10" style={delay(1080)}>
          <button type="button" className="hbtn hbtn--primary hbtn--lg" onClick={() => setPhase("config")}>
            Personalizar agora
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 11.25a.75.75 0 0 0 0 1.5h9.25V18a.75.75 0 0 0 1.28.53l6-6a.75.75 0 0 0 0-1.06l-6-6a.75.75 0 0 0-1.28.53v5.25z" />
            </svg>
          </button>
          <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onNext}>
            Deixar para depois
          </button>
        </div>
        <div className="onb-in mt-3.5" style={delay(1160)}>
          <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m8.165 11.63l6.63-6.43C15.21 4.799 16 5.042 16 5.57v12.86c0 .528-.79.771-1.205.37l-6.63-6.43a.5.5 0 0 1 0-.74" />
            </svg>
            Voltar
          </button>
        </div>
      </AskScreen>
    );
  }

  return (
    <section className="min-h-full flex flex-col justify-start max-w-lg w-full mx-auto px-6 pt-4 pb-10">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[32px] leading-tight font-[700] text-foreground">Sua identidade</h2>
        <p className="text-[16px] text-muted mt-2 mb-7">Dá para mudar tudo depois nas Configurações.</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-default flex items-center justify-center overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <GalleryIcon className="w-8 h-8 text-muted" />}
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-sm font-semibold text-foreground" htmlFor="onb-logo">
              Logo do seu negócio
            </label>
            <p className="text-[13px] text-muted mt-0.5 mb-2">PNG ou JPG, de preferência com fundo transparente.</p>
            <input
              type="file"
              name="logo"
              id="onb-logo"
              accept="image/*"
              className="hinput hinput--bordered w-full !h-auto py-2 text-[14px]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogo(URL.createObjectURL(file));
              }}
            />
          </div>
        </div>

        <div className="mt-7">
          <label className="text-sm font-semibold text-foreground block mb-2">Cor da sua página de agendamento</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="sm:w-64">
              <ColorPicker name="accent_color" label="Cor principal" value={accent} onChange={setAccent} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] text-muted">Ficará assim:</span>
              <span
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-[14px] font-semibold"
                style={{ background: accent, color: textOn(accent) }}
              >
                Agendar
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[13px] text-muted mb-3">São os contatos que mostramos a quem agenda com você.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2" htmlFor="onb-org-email">
                E-mail de contato
              </label>
              <input
                type="email"
                name="email"
                id="onb-org-email"
                required
                defaultValue="contato@exemplo.com.br"
                className="hinput hinput--bordered w-full"
                placeholder="contato@seunegocio.com.br"
              />
            </div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label">Telefone</label>
              <PhoneInput name="phone" id="onb-org-phone" label="Telefone" />
            </div>
          </div>
        </div>

        <div className="mt-7">
          <label className="text-sm font-semibold text-foreground" htmlFor="onb-mensagem">
            Mensagem de boas-vindas
          </label>
          <p className="text-[13px] text-muted mt-0.5 mb-2">Aparece no topo da sua página de agendamento.</p>
          <textarea
            name="mensagem"
            id="onb-mensagem"
            rows={3}
            maxLength={1000}
            className="htextarea hinput--bordered w-full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex.: Seja bem-vindo! Escolha o melhor horário para o seu atendimento."
          />
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[12px] text-muted ml-auto">{message.length}/1000</span>
          </div>
        </div>

        <StepNav onBack={() => setPhase("ask")} label="Salvar e avançar" submit />
      </form>
    </section>
  );
}
