"use client";

import { useState, type CSSProperties } from "react";
import { AddAppointmentIcon, InboxIcon, WalletIcon } from "../shared/icons";
import { AddCreditsModal } from "../shared/AddCreditsModal";
import { Combobox } from "../shared/Combobox";
import { CreditCards } from "../shared/CreditCards";
import { ROUTES } from "../shared/Sidebar";

const TABS = [
  { id: "general-rules", label: "Regras Gerais" },
  { id: "specific-rules", label: "Regras por Agenda" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const AGENDA_FILTER = [{ value: "", label: "Todas as agendas" }];
const CHANNEL_FILTER = [
  { value: "", label: "Todos os canais" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
];

// These tables reserve six rows, not the usual ten.
const SLOTS = 6;

function RulesTable({ columns }: { columns: string[] }) {
  return (
    <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
      <div className="htable-scroll">
        <table className="htable-table w-full htable-fixed">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} className="htable-col">
                  {c}
                </th>
              ))}
              <th className="htable-col htable-col--end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SLOTS }, (_, i) => (
              <tr key={i} className="htable-row--empty" aria-hidden="true">
                {Array.from({ length: columns.length + 1 }, (_, j) => (
                  <td key={j} className="htable-cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="htable-empty" role="status" aria-live="polite">
        <div className="hempty hempty--inline hui-reveal">
          <InboxIcon className="hempty-icon" />
          <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
          <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
        </div>
      </div>
      <div className="htable-footer" />
    </div>
  );
}

export function StatusRules() {
  const [tab, setTab] = useState<Tab>("general-rules");
  const [agenda, setAgenda] = useState("");
  const [channel, setChannel] = useState("");
  const [addingCredits, setAddingCredits] = useState(false);
  const tabIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div id="status-rules-page-root" className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
      <CreditCards balanceLabel="AgendaCoins" />

      <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-center gap-3 min-w-0 hui-reveal">
        <div className="htabs" role="tablist" aria-label="Escopo das regras" style={{ "--htabs-count": TABS.length } as CSSProperties}>
          <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${tabIndex} * 100%))` }} />
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`htabs-tab${t.id === tab ? " is-active" : ""}`} role="tab" aria-selected={t.id === tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
          <a href={ROUTES.novaRegraStatus} className="hbtn hbtn--primary hbtn--sm">
            <AddAppointmentIcon />
            Nova Regra
          </a>
          <button type="button" aria-label="Adicionar Créditos" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setAddingCredits(true)}>
            <WalletIcon />
            Adicionar Créditos
          </button>
        </div>
      </div>

      <div className="mt-5" style={tab === "general-rules" ? undefined : { display: "none" }}>
        <RulesTable columns={["Status", "Canal", "Template", "Conteúdo"]} />
      </div>

      <div className="mt-5" style={tab === "specific-rules" ? undefined : { display: "none" }}>
        <form id="formFilter" className="mb-4 flex flex-col sm:flex-row gap-2 min-w-0" onSubmit={(e) => e.preventDefault()}>
          <div className="w-full sm:w-56 min-w-0">
            <Combobox id="agenda_filter" label="Agenda" options={AGENDA_FILTER} value={agenda} onChange={setAgenda} placeholder="Filtrar por agenda" />
          </div>
          <div className="w-full sm:w-48 min-w-0">
            <Combobox id="channel_filter" label="Canal" options={CHANNEL_FILTER} value={channel} onChange={setChannel} placeholder="Filtrar por canal" />
          </div>
        </form>
        <RulesTable columns={["Status", "Canal", "Agendas", "Template", "Conteúdo"]} />
      </div>

      {addingCredits && <AddCreditsModal onClose={() => setAddingCredits(false)} />}
    </div>
  );
}
