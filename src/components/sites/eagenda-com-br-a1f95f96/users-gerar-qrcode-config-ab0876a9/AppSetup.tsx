"use client";

import { withBase } from "@/lib/basePath";
import { ActivityIcon, QrIcon } from "../shared/icons";

const ASSETS = "/sites/eagenda-com-br-a1f95f96/users-gerar-qrcode-config-ab0876a9";

const STEPS = [
  { title: "Baixe o aplicativo", desc: "Disponível para Android." },
  { title: "Configure a sua plataforma", desc: "Abra o aplicativo e escaneie o QR Code para conectar o app à sua conta de forma segura." },
  { title: "Faça o login", desc: "Utilize as mesmas credenciais (e-mail e senha) que você usa para acessar esta plataforma." },
];

/** Ajuda › Aplicativo: the three setup steps and the QR code that pairs the phone with the account. */
export function AppSetup() {
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
                  {i === 0 && (
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/20 transition-all duration-200 hover:opacity-90"
                      aria-label="Baixar na Google Play"
                      title="Baixar na Google Play"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={withBase(`${ASSETS}/google-play-store-icon.svg`)}
                        alt="Disponível no Google Play"
                        width={151}
                        height={45}
                        className="h-11 w-auto"
                      />
                    </a>
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
            <img src={withBase(`${ASSETS}/qrcode-config.png`)} alt="QR Code de configuração do aplicativo" width={176} height={176} className="w-44 h-44" />
          </div>
          <p className="text-xs text-gray-500 inter-regular mt-4">
            Este código é único para a plataforma <strong className="text-gray-700">seiri.com.br</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
