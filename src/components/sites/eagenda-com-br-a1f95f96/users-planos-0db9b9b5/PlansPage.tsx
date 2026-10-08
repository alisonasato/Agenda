"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRightIcon, CrownIcon, InboxIcon, ReceiptIcon, StarsIcon, WalletIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useData } from "@/lib/seiri/store";
import { monthUsage } from "@/lib/seiri/select";

const TABS = [
  { id: "pagamentos", label: "Pagamentos" },
  { id: "historico", label: "Histórico" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const PAYMENT_COLUMNS = ["Status", "Vencimento", "Código de Barras", "Fatura", "Nota Fiscal"];
const HISTORY_COLUMNS = ["Plano", "Status", "Data de Início", "Valor", "Período"];
const SLOTS = 10;

const money = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Meter({ label, used, max, tone }: { label: string; used: number; max: number; tone: "accent" | "danger" }) {
  const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div className={`hmeter hmeter--${tone}`}>
      <div className="hmeter-head">
        <span className="hmeter-label">{label}</span>
        <span className="hmeter-output">
          {used} de {max}
        </span>
      </div>
      <div className="hmeter-track">
        <div className="hmeter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[] }) {
  return (
    <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
      <div className="htable-scroll">
        <table className="htable-table w-full htable-fixed">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} className="htable-col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows}
            {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
              <tr key={i} className="htable-row--empty" aria-hidden="true">
                {Array.from({ length: columns.length }, (_, j) => (
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

/** Conta › Planos: the subscription, the AgendaCoins balance and the invoice archive. */
export function PlansPage() {
  const data = useData();
  const { plan, credits, coinTransactions, payments, planHistory } = data;
  // Counted, not stored, and by the same rule the Painel's meter uses.
  const used = monthUsage(data);
  const [tab, setTab] = useState<Tab>("pagamentos");
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const free = plan.price === 0;

  return (
    <>
      {free && (
        <div className="hui-reveal">
          <div className="halert halert--accent" role="alert">
            <span className="halert-indicator" aria-hidden="true">
              <StarsIcon className="w-[18px] h-[18px]" />
            </span>
            <div className="halert-content">
              <p className="halert-title">Você está no plano gratuito</p>
              <p className="halert-description">
                Assine o Plano Básico para liberar 500 agendamentos/mês · até 3 usuários e deixar de ter o limite diário de agendamentos.
              </p>
            </div>
            <div className="halert-actions">
              <a href={`${ROUTES.confirmarPlano}/?id=3`} className="hbtn hbtn--primary hbtn--sm">
                <ArrowRightIcon className="w-4 h-4" />
                Assinar Plano Básico
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 hui-reveal mt-4">
        <a href={`${ROUTES.confirmarPlano}/?id=3`} className="hbtn hbtn--primary">
          <ArrowRightIcon className="w-4 h-4" />
          Assinar Plano Básico · BRL 45/mês
        </a>
        <a href={ROUTES.alterarPlano} className="hbtn hbtn--secondary">
          <CrownIcon className="w-4 h-4" />
          Ver todos os planos
        </a>
        <a href={ROUTES.extrato} className="hbtn hbtn--secondary">
          <WalletIcon className="w-4 h-4" />
          Detalhes de AgendaCoins
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="hsection h-full hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">Plano Atual</h2>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            <div className="flex items-center gap-3 mb-3 min-w-0">
              <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <CrownIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 nunito-bold truncate">{plan.name}</h3>
              </div>
              <span className="hchip hchip--default hchip--soft hchip--sm">{plan.cycle}</span>
            </div>
            <div className="pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-500 uppercase">BRL</span>
                <span className="text-3xl font-black text-gray-900 nunito-black leading-none tabular-nums">{money(plan.price)}</span>
                <span className="text-sm text-gray-500 inter-regular">/mês</span>
              </div>
            </div>
            <div className="space-y-3 pb-4 mb-4 border-b border-slate-100">
              <Meter label="Agendamentos neste ciclo" used={used} max={plan.appointmentsMax} tone="accent" />
              <Meter label="Usuários" used={plan.usersUsed} max={plan.usersMax} tone="danger" />
            </div>
            <p className="mt-2.5 text-xs text-gray-500 inter-regular">{plan.note}</p>
            <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-gray-400 inter-regular">{plan.limits}</p>
          </div>
        </div>

        <div className="hsection h-full hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">AgendaCoins</h2>
              <p className="hsection-desc">Saldo: {credits.general.toLocaleString("pt-BR")}</p>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            {coinTransactions.length ? (
              <ul className="space-y-2">
                {coinTransactions.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-700 inter-regular truncate">{t.description || t.kind}</span>
                    <span className="text-gray-900 inter-semibold tabular-nums">
                      {t.amount > 0 ? `+${t.amount.toLocaleString("pt-BR")}` : t.amount.toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <WalletIcon className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm text-gray-500 inter-regular mb-4 mt-2">Nenhuma transação ainda</p>
                <a href={ROUTES.extrato} className="hbtn hbtn--secondary hbtn--sm">
                  <ReceiptIcon className="w-4 h-4" />
                  Solicitar créditos de teste
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 hui-reveal" style={{ animationDelay: ".08s" }}>
        <div className="htabs" role="tablist" aria-label="Arquivo da assinatura" style={{ "--htabs-count": TABS.length } as CSSProperties}>
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
              {t.id === "pagamentos" && <span className="htabs-count">{payments.length}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4" style={tab === "pagamentos" ? undefined : { display: "none" }}>
          <Table
            columns={PAYMENT_COLUMNS}
            rows={payments.map((p) => (
              <tr key={p.id}>
                <td className="htable-cell whitespace-nowrap">
                  <span className={`hchip ${p.status === "Pago" ? "hchip--success" : "hchip--warning"} hchip--primary hchip--sm`}>{p.status}</span>
                </td>
                <td className="htable-cell whitespace-nowrap">{p.dueDate}</td>
                <td className="htable-cell">{p.barcode || "—"}</td>
                <td className="htable-cell">—</td>
                <td className="htable-cell">—</td>
              </tr>
            ))}
          />
        </div>

        <div className="mt-4" style={tab === "historico" ? undefined : { display: "none" }}>
          <Table
            columns={HISTORY_COLUMNS}
            rows={planHistory.map((h) => (
              <tr key={h.id}>
                <td className="htable-cell">{h.plan}</td>
                <td className="htable-cell whitespace-nowrap">
                  <span className="hchip hchip--default hchip--soft hchip--sm">{h.status}</span>
                </td>
                <td className="htable-cell whitespace-nowrap">{h.startedAt}</td>
                <td className="htable-cell whitespace-nowrap">BRL {money(h.amount)}</td>
                <td className="htable-cell whitespace-nowrap">{h.period}</td>
              </tr>
            ))}
          />
        </div>
      </div>
    </>
  );
}
