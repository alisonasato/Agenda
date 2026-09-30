"use client";

import { useState, type CSSProperties } from "react";
import { AddAppointmentIcon, DangerCircleIcon, InboxIcon, PenIcon, TrashIcon, WalletIcon } from "../shared/icons";
import { AlertDialog } from "../shared/AlertDialog";
import { update, useData } from "@/lib/seiri/store";
import { CHANNEL_LABELS, STATUS_RULE_STATUSES, type Channel, type StatusRule } from "@/lib/seiri/types";
import { AddCreditsModal } from "../shared/AddCreditsModal";
import { Combobox } from "../shared/Combobox";
import { CreditCards } from "../shared/CreditCards";
import { ROUTES } from "../shared/Sidebar";

const TABS = [
  { id: "general-rules", label: "Regras Gerais" },
  { id: "specific-rules", label: "Regras por Agenda" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const CHANNEL_FILTER = [
  { value: "", label: "Todos os canais" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
];

// These tables reserve six rows, not the usual ten.
const SLOTS = 6;

type Row = { rule: StatusRule; channel: Channel; template: string; content: string };

/** One row per channel a rule sends through. */
function rowsOf(rules: StatusRule[]): Row[] {
  return rules.flatMap((rule) =>
    (["whatsapp", "sms", "email"] as Channel[])
      .filter((channel) => rule.channels[channel])
      .map((channel) => ({
        rule,
        channel,
        template: channel === "whatsapp" ? rule.whatsappTemplate : channel === "email" ? rule.emailTemplate : "",
        content: channel === "sms" ? rule.smsText : "",
      })),
  );
}

const statusLabel = (value: string) => STATUS_RULE_STATUSES.find((s) => s.value === value)?.label ?? value;

function RulesTable({
  columns,
  rows,
  agendaNames,
  onRemove,
}: {
  columns: string[];
  rows: Row[];
  agendaNames?: (rule: StatusRule) => string;
  onRemove: (rule: StatusRule) => void;
}) {
  return (
    <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
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
            {rows.map((row) => (
              <tr key={`${row.rule.id}-${row.channel}`}>
                <td className="htable-cell whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-semibold inter-semibold">{statusLabel(row.rule.status)}</span>
                </td>
                <td className="htable-cell whitespace-nowrap">
                  <span className="hchip hchip--warning hchip--primary hchip--sm">{CHANNEL_LABELS[row.channel]}</span>
                </td>
                {agendaNames && <td className="htable-cell">{agendaNames(row.rule)}</td>}
                <td className="htable-cell">{row.template || <span className="text-sm text-gray-400">—</span>}</td>
                <td className="htable-cell">
                  {row.content ? (
                    <span className="text-sm text-gray-600 inter-regular line-clamp-2">{row.content}</span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="htable-cell htable-cell--end whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <a href={`${ROUTES.novaRegraStatus}/?id=${row.rule.id}`} className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Regra">
                      <PenIcon className="w-4 h-4" />
                    </a>
                    <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir Regra" onClick={() => onRemove(row.rule)}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
              <tr key={i} className="htable-row--empty" aria-hidden="true">
                {Array.from({ length: columns.length + 1 }, (_, j) => (
                  <td key={j} className="htable-cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="htable-empty" role="status" aria-live="polite">
          <div className="hempty hempty--inline hui-reveal">
            <InboxIcon className="hempty-icon" />
            <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
            <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
          </div>
        </div>
      )}
      <div className="htable-footer" />
    </div>
  );
}

export function StatusRules() {
  const data = useData();
  const [tab, setTab] = useState<Tab>("general-rules");
  const [agenda, setAgenda] = useState("");
  const [channel, setChannel] = useState("");
  const [addingCredits, setAddingCredits] = useState(false);
  const [removing, setRemoving] = useState<StatusRule | null>(null);
  const tabIndex = TABS.findIndex((t) => t.id === tab);

  const agendaFilter = [{ value: "", label: "Todas as agendas" }, ...data.agendas.map((a) => ({ value: a.id, label: a.name }))];
  // "Regras Gerais" holds the rules that apply to every agenda; the other tab holds the rest.
  const general = rowsOf(data.statusRules.filter((r) => !r.agendaIds.length));
  const specific = rowsOf(data.statusRules.filter((r) => r.agendaIds.length))
    .filter((row) => (agenda ? row.rule.agendaIds.includes(agenda) : true))
    .filter((row) => (channel ? row.channel === channel : true));

  const agendaNames = (rule: StatusRule) => rule.agendaIds.map((id) => data.agendas.find((a) => a.id === id)?.name ?? id).join(", ");
  const remove = (id: string) => update((d) => ({ ...d, statusRules: d.statusRules.filter((r) => r.id !== id) }));

  return (
    <div id="status-rules-page-root" className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
      <CreditCards balanceLabel="AgendaCoins" />

      <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-center gap-3 min-w-0 hui-reveal">
        <div className="htabs" role="tablist" aria-label="Escopo das regras" style={{ "--htabs-count": TABS.length } as CSSProperties}>
          <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${tabIndex} * 100%))` }} />
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`htabs-tab${t.id === tab ? " is-active" : ""}`}
              role="tab"
              aria-selected={t.id === tab}
              onClick={() => setTab(t.id)}
            >
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
        <RulesTable columns={["Status", "Canal", "Template", "Conteúdo"]} rows={general} onRemove={setRemoving} />
      </div>

      <div className="mt-5" style={tab === "specific-rules" ? undefined : { display: "none" }}>
        <form id="formFilter" className="mb-4 flex flex-col sm:flex-row gap-2 min-w-0" onSubmit={(e) => e.preventDefault()}>
          <div className="w-full sm:w-56 min-w-0">
            <Combobox id="agenda_filter" label="Agenda" options={agendaFilter} value={agenda} onChange={setAgenda} placeholder="Filtrar por agenda" />
          </div>
          <div className="w-full sm:w-48 min-w-0">
            <Combobox id="channel_filter" label="Canal" options={CHANNEL_FILTER} value={channel} onChange={setChannel} placeholder="Filtrar por canal" />
          </div>
        </form>
        <RulesTable
          columns={["Status", "Canal", "Agendas", "Template", "Conteúdo"]}
          rows={specific}
          agendaNames={agendaNames}

          onRemove={setRemoving}
        />
      </div>

      {addingCredits && <AddCreditsModal onClose={() => setAddingCredits(false)} />}
      {removing && (
        <AlertDialog
          id="status-rule-delete-dialog"
          heading="Excluir regra"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="hbtn hbtn--danger"
                onClick={() => {
                  remove(removing.id);
                  setRemoving(null);
                }}
              >
                Excluir
              </button>
            </>
          }
        >
          Esse status deixa de disparar notificação.
        </AlertDialog>
      )}
    </div>
  );
}
