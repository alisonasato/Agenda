"use client";

import { useEffect, useState, type CSSProperties } from "react";
import QRCode from "qrcode";
import { ChatBubbleIcon, CheckCircleIcon, CheckReadIcon, ClockSolidIcon, CopySolidIcon, DangerCircleIcon, RefreshIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";

/** The clone has no WhatsApp line of its own, so the link points at an obvious placeholder. */
const NUMBER = "5511999999999";
/** The original starts the countdown at ten minutes. */
const WINDOW_SECONDS = 600;

const STEPS = [
  { title: "Escaneie o QR Code", desc: 'Aponte a câmera do celular ou toque em "Abrir WhatsApp".' },
  { title: "Envie a mensagem", desc: "O WhatsApp abre com o código já preenchido — basta enviar." },
  { title: "Pronto", desc: "A confirmação aparece nesta tela automaticamente." },
];

const newCode = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 22 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
};

/** "Ativar WhatsApp": send a token to the platform's number so it knows the line is yours. */
export function WhatsAppActivation() {
  const data = useData();
  const message = `Código de ativação:${data.whatsappCode}`;
  const link = `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;

  const [remaining, setRemaining] = useState(WINDOW_SECONDS);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    QRCode.toDataURL(link, { width: 512, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [link]);

  const expired = remaining <= 0;
  const countdown = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  const regenerate = () => {
    update((d) => ({ ...d, whatsappCode: newCode() }));
    setRemaining(WINDOW_SECONDS);
    setSent(false);
  };

  const copy = () => {
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
      <div className="@container w-full hui-reveal">
        <div className="grid grid-cols-1 @3xl:grid-cols-[minmax(0,1fr)_18rem] gap-6 items-stretch">
          <div className="hsection hui-card hui-card--flush">
            <div className="hsection-head">
              <div className="hsection-titles">
                <h2 className="hsection-title">Conecte seu WhatsApp</h2>
                <p className="hsection-desc">Envie o código abaixo para o WhatsApp do Seiri — é assim que confirmamos que o número é seu.</p>
              </div>
              <div className="hsection-actions" />
            </div>
            <div className="hsection-body">
              {!expired && (
                <div className="@container">
                  <div className="grid gap-6 @min-[38rem]:grid-cols-[auto_minmax(0,1fr)] items-start">
                    <div className="justify-self-center @min-[38rem]:justify-self-start flex items-center justify-center rounded-2xl bg-[color:var(--color-surface-secondary,#ecf0f4)] p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL, like the original's inline QR */}
                      <img src={qr} alt="QR Code do WhatsApp" className="w-40 h-40 @3xl:w-48 @3xl:h-48 @5xl:w-56 @5xl:h-56 rounded-xl bg-white p-2" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-4">
                      <div className="hcopyfield-field">
                        <span className="hcopyfield-label">Ou envie exatamente este texto</span>
                        <div className="hcopyfield hcopyfield--iconbtn hcopyfield--mono hcopyfield--wrap">
                          <code className="hcopyfield-value">{message}</code>
                          <button
                            type="button"
                            className="hcopyfield-btn hbtn hbtn--tertiary"
                            title={copied ? "Copiado!" : "Copiar"}
                            aria-label={copied ? "Copiado!" : "Copiar"}
                            onClick={copy}
                          >
                            {copied ? (
                              <span className="hcopyfield-btn-state hcopyfield-btn-state--done">
                                <CheckCircleIcon className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="hcopyfield-btn-state">
                                <CopySolidIcon className="w-4 h-4" />
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="flex items-center gap-1.5 text-xs text-[color:var(--color-muted-foreground,#667085)] inter-regular">
                        <ClockSolidIcon className="w-4 h-4" />
                        <span>
                          O código expira em <strong className="nunito-bold text-gray-700">{countdown}</strong>
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="hbtn hbtn--primary">
                          <ChatBubbleIcon />
                          Abrir WhatsApp
                        </a>
                        <button type="button" className="hbtn hbtn--secondary" onClick={regenerate}>
                          <RefreshIcon />
                          Gerar novo código
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {expired && (
                <div className="halert halert--danger" role="alert">
                  <span className="halert-indicator" aria-hidden="true">
                    <DangerCircleIcon className="w-5 h-5" />
                  </span>
                  <div className="halert-content">
                    <p className="halert-title">Código expirado</p>
                    <p className="halert-description">O código de verificação não é mais válido. Gere um novo para continuar.</p>
                  </div>
                  <div className="halert-actions">
                    <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={regenerate}>
                      <RefreshIcon />
                      Gerar novo código
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-[color:var(--color-border,#eaecf0)]">
                <div id="activation-status" className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground,#667085)] inter-regular">
                    {sent ? (
                      <>
                        <ClockSolidIcon className="w-4 h-4 flex-shrink-0" />
                        {/* No server to poll: the original's hx-get every 15s would answer here. */}
                        <span>Nenhuma mensagem chegou ainda — o clone não tem servidor para confirmar o envio.</span>
                      </>
                    ) : (
                      <>
                        <span
                          className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-gray-200 border-t-[color:var(--color-primary)] animate-spin"
                          aria-hidden="true"
                        />
                        <span>Aguardando o envio da mensagem…</span>
                      </>
                    )}
                  </span>
                  <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setSent(true)}>
                    <CheckCircleIcon />
                    Já enviei o código
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hsection hui-card hui-card--flush">
            <div className="hsection-head">
              <div className="hsection-titles">
                <h2 className="hsection-title">Como funciona</h2>
              </div>
              <div className="hsection-actions" />
            </div>
            <div className="hsection-body flex-1 flex flex-col justify-center">
              <ol
                className="hstepper hstepper--lg hstepper--vertical"
                role="list"
                aria-label="Como funciona"
                style={{ "--stepper-gap": "2.5rem" } as CSSProperties}
              >
                {STEPS.map((step, i) => (
                  <li key={step.title} className="hstepper__step" data-status="inactive">
                    <div className="hstepper__step-button">
                      <span className="hstepper__indicator">
                        <span className="hstepper__icon" aria-hidden="true">
                          <span className="hstepper__num">{i + 1}</span>
                          <span className="hstepper__check">
                            <CheckReadIcon className="w-full h-full" />
                          </span>
                        </span>
                      </span>
                      <span className="hstepper__content">
                        <span className="hstepper__title">{step.title}</span>
                        <span className="hstepper__description">{step.desc}</span>
                      </span>
                    </div>
                    {i < STEPS.length - 1 && <span className="hstepper__separator" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
