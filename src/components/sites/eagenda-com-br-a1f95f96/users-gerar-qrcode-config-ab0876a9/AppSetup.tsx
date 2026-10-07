"use client";

import { withBase } from "@/lib/basePath";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ActivityIcon, QrIcon } from "../shared/icons";

const ASSETS = "/sites/eagenda-com-br-a1f95f96/users-gerar-qrcode-config-ab0876a9";

const STEPS = [
  { title: "Baixe o aplicativo", desc: "Disponível para Android." },
  { title: "Configure a sua plataforma", desc: "Abra o aplicativo e escaneie o QR Code para conectar o app à sua conta de forma segura." },
  { title: "Faça o login", desc: "Utilize as mesmas credenciais (e-mail e senha) que você usa para acessar esta plataforma." },
];

/** Ajuda › Aplicativo: the three setup steps and the QR code that pairs the phone with the account. */
/** The platform the app is pointed at; the QR carries exactly this. */
const PLATFORM = "seiri.com.br";

export function AppSetup() {
  // The original serves a ready-made PNG; here the code is drawn in the browser.
  const [qr, setQr] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(PLATFORM, { width: 352, margin: 1 })
      .then((data) => live && setQr(data))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3 rounded-xl bg-white shadow-[var(--hui-shadow-sm)] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <ActivityIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
            <h2 className="text-base md:text-lg font-bold text-gray-900 nunito-bold">Como começar em 3 passos</h2>
          </div>
          <ol className="divide-y divide-[color:var(--color-border)]">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4 py-4">
                <span className="w-9 h-9 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] flex items-center justify-center font-bold nunito-bold flex-shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 inter-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-600 inter-regular mt-1">{step.desc}</p>
                  {/* The original links the badge to its own store listing. Seiri has no app to
                      point at, and a made-up listing would be a broken link to a real store, so
                      the badge stays an image. */}
                  {i === 0 && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={withBase(`${ASSETS}/google-play-store-icon.svg`)}
                      alt="Disponível no Google Play"
                      width={151}
                      height={45}
                      className="mt-3 block h-11 w-auto"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-white shadow-[var(--hui-shadow-sm)] p-5 md:p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4 self-start">
            <QrIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
            <h2 className="text-base md:text-lg font-bold text-gray-900 nunito-bold">Escaneie para configurar</h2>
          </div>
          <div className="rounded-xl border border-[color:var(--color-border)] bg-white p-3 inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR Code de configuração do aplicativo" width={176} height={176} className="w-44 h-44" />
          </div>
          <p className="text-xs text-gray-500 inter-regular mt-4">
            Este código é único para a plataforma <strong className="text-gray-700">{PLATFORM}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
