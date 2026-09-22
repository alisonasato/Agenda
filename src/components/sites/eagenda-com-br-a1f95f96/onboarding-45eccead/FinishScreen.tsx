"use client";

import { useState } from "react";
import { withBase } from "@/lib/basePath";
import { ROUTES } from "../shared/Sidebar";
import { ArrowRightIcon, CopySolidIcon, ExternalLinkIcon, PlusCircleIcon } from "../shared/icons";
import { Lottie, delay } from "./parts";

const PUBLIC_LINK = "https://seiri.com.br/agendar/minhaempresa/";

/** The screen after step 7: the agenda is live, with its public link and the first actions. */
export function FinishScreen({ days, notices }: { days: number; notices: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="min-h-full max-w-md mx-auto flex flex-col items-center justify-center text-center px-6 py-12">
      <Lottie name="congrats" size={200} className="mx-auto mb-4" style={{ maxWidth: "64vw", ...delay(0) }} />
      <h1 className="onb-in text-[34px] sm:text-[42px] leading-[1.05] tracking-tight text-balance font-[700] text-foreground" style={delay(200)}>
        Sua agenda está no ar!
      </h1>
      <p className="onb-in text-[17px] leading-relaxed text-pretty text-muted mt-3" style={delay(320)}>
        Seus clientes já podem agendar pelo link abaixo.
      </p>
      <div className="onb-in flex flex-wrap items-center justify-center gap-2 mt-5" style={delay(380)}>
        <span className="hchip hchip--success hchip--soft hchip--sm">{days} dias de atendimento</span>
        <span className="hchip hchip--default hchip--soft hchip--sm">{notices} avisos automáticos</span>
      </div>
      <div className="onb-in mt-7 w-full" style={delay(440)}>
        <div className="flex items-stretch gap-2">
          <code
            className="flex-1 min-w-0 break-all text-left flex items-center rounded-2xl border border-border bg-surface px-4 py-2.5 text-[14px] font-semibold text-accent"
            id="public-link"
          >
            {PUBLIC_LINK}
          </code>
          <button
            type="button"
            id="copy-btn"
            className="hbtn hbtn--secondary hbtn--lg"
            onClick={() => {
              navigator.clipboard?.writeText(PUBLIC_LINK).catch(() => {});
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            <CopySolidIcon />
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
      <div className="onb-in mt-4 w-full flex flex-col gap-2.5" style={delay(560)}>
        <a href={withBase("/")} id="go-to-panel-btn" className="hbtn hbtn--primary hbtn--lg hbtn--block">
          Começar a usar
          <ArrowRightIcon />
        </a>
        <a href={ROUTES.novoAgendamento} className="hbtn hbtn--secondary hbtn--lg hbtn--block">
          <PlusCircleIcon />
          Criar meu primeiro agendamento
        </a>
        {/* The public booking page is not part of this clone, so the link only shows what the original opens. */}
        <a href="#" className="hbtn hbtn--ghost hbtn--lg hbtn--block">
          <ExternalLinkIcon />
          Ver como seus clientes vão ver
        </a>
      </div>
      <p className="onb-in text-[13px] text-muted mt-8" style={delay(680)}>
        Você pode personalizar tudo nas{" "}
        <a href={withBase("/")} className="text-accent font-semibold hover:underline">
          Configurações
        </a>
        .
      </p>
    </section>
  );
}
