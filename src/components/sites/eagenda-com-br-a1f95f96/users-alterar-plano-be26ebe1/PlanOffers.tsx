"use client";

import { useState } from "react";
import { ArrowUpIcon, ChevronLeftIcon, ClockSolidIcon, HistoryIcon, LetterIcon, PlugCircleIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { PLAN_OFFERS } from "@/lib/seiri/types";

const INCLUDED = [
  { label: "Envio de e-mails", Icon: LetterIcon },
  { label: "Integrações", Icon: PlugCircleIcon },
  { label: "Agendamento até 365 dias", Icon: ClockSolidIcon },
  { label: "Histórico por 365 dias", Icon: HistoryIcon },
];

const pill = "relative z-10 h-9 inline-flex items-center justify-center px-5 rounded-full text-sm font-semibold transition-colors duration-200 inter-semibold";

/** "Alterar Plano": the catalogue reached from "Ver todos os planos" on Meu Plano. */
export function PlanOffers() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="hui-reveal">
        <a href={ROUTES.planos} className="hbtn hbtn--secondary">
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar para Meu Plano
        </a>
      </div>

      <div className="mt-5 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="relative inline-grid grid-cols-2 p-1 gap-1 bg-slate-100 rounded-full border border-slate-200">
          <button
            type="button"
            className={`${pill} ${yearly ? "text-gray-600 hover:text-gray-900" : "bg-white text-primary shadow-sm"}`}
            onClick={() => setYearly(false)}
          >
            Mensal
          </button>
          <button
            type="button"
            className={`${pill} gap-2 ${yearly ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setYearly(true)}
          >
            Anual
            <span className="hchip hchip--success hchip--primary hchip--sm">economize</span>
          </button>
        </div>
      </div>

      <div className="mt-5 hui-reveal" style={{ animationDelay: ".045s" }}>
        <p className="text-xs uppercase tracking-wide text-gray-500 inter-semibold mb-2">Todos os planos incluem</p>
        <div className="flex flex-wrap gap-2">
          {INCLUDED.map(({ label, Icon }) => (
            <span key={label} className="hchip hchip--default hchip--soft hchip--sm">
              <span className="inline-flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6 hui-reveal" style={{ animationDelay: ".05s" }}>
        {PLAN_OFFERS.map((plan) => (
          <div key={plan.id} className="hui-card h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-slate-100" />
            <div className="pt-2 mb-4 min-w-0 flex items-start justify-between gap-2">
              <h3 className="text-lg font-black text-gray-900 nunito-black truncate">{plan.name}</h3>
            </div>
            <div className="mb-4 pb-4 border-b border-slate-100">
              <p className="text-xs uppercase tracking-wide text-gray-500 inter-semibold">Valor mensal</p>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-sm font-semibold text-gray-500 uppercase">BRL</span>
                <span className="text-3xl font-black text-gray-900 nunito-black leading-none tabular-nums">{yearly ? plan.annualMonthly : plan.monthly}</span>
                <span className="text-sm text-gray-500 inter-regular">/mês</span>
              </div>
              {yearly && <p className="mt-1.5 text-xs text-gray-500 inter-regular">BRL {plan.annualTotal} cobrados por ano</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xl font-bold text-gray-900 nunito-bold tabular-nums leading-none">{plan.appointments}</p>
                <p className="mt-1 text-xs text-gray-500 inter-regular">agendamentos/mês</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 nunito-bold tabular-nums leading-none">{plan.users}</p>
                <p className="mt-1 text-xs text-gray-500 inter-regular">usuários</p>
              </div>
            </div>
            <div className="mt-auto">
              {/* The original carries the cycle on the query string, so the confirm screen opens on it. */}
              <a href={`${ROUTES.confirmarPlano}/?id=${plan.id}${yearly ? "&frequencia=anual" : ""}`} className="hbtn hbtn--primary hbtn--block">
                <ArrowUpIcon />
                Selecionar Plano
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
