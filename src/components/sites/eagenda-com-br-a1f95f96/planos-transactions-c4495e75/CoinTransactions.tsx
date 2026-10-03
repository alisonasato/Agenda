"use client";

import { useState, type CSSProperties } from "react";
import { AddCreditsModal } from "../shared/AddCreditsModal";
import { CardIcon, InboxIcon, WalletIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";

const COLUMNS = ["Data/Hora", "Tipo", "Valor", "Descrição", "Status"];
const SLOTS = 10;

/** "Detalhes de AgendaCoins": the balance, how it is topped up and every movement. */
export function CoinTransactions() {
  const { credits, coinTransactions } = useData();
  const [adding, setAdding] = useState(false);
  const rows = [...coinTransactions].reverse();

  const kpis = [
    { label: "Saldo atual (AgendaCoins)", value: credits.general.toLocaleString("pt-BR") },
    { label: "Recarga automática", value: credits.autoRecharge ? `${credits.autoRecharge.toLocaleString("pt-BR")} coins/mês` : "Desativada" },
    { label: "Método de pagamento", value: credits.paymentMethod || "Nenhum" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6 hui-reveal">
        <button type="button" className="hbtn hbtn--primary" onClick={() => setAdding(true)}>
          <WalletIcon />
          Adicionar Créditos
        </button>
        <button
          type="button"
          className="hbtn hbtn--secondary"
          onClick={() => update((d) => ({ ...d, credits: { ...d.credits, paymentMethod: "Cartão terminado em 4242" } }))}
        >
          <CardIcon />
          Adicionar método de pagamento
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 hui-reveal">
        {kpis.map((k) => (
          <div key={k.label} className="hui-card hui-card--flush hkpi">
            <div className="hkpi-body">
              <p className="hkpi-label">{k.label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">{k.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hui-reveal">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Transações</h2>
          </div>
          <div className="hwidget-actions" />
        </div>
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c} className={`htable-col${c === "Valor" ? " htable-col--num" : ""}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="htable-cell whitespace-nowrap">{row.at}</td>
                    <td className="htable-cell whitespace-nowrap">{row.kind}</td>
                    <td className="htable-cell htable-cell--num">
                      {row.amount > 0 ? `+${row.amount.toLocaleString("pt-BR")}` : row.amount.toLocaleString("pt-BR")}
                    </td>
                    <td className="htable-cell">{row.description}</td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className={`hchip ${row.status === "Concluída" ? "hchip--success" : "hchip--warning"} hchip--primary hchip--sm`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                  <tr key={i} className="htable-row--empty" aria-hidden="true">
                    {COLUMNS.map((c) => (
                      <td key={c} className="htable-cell" />
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
      </div>

      {adding && <AddCreditsModal onClose={() => setAdding(false)} />}
    </>
  );
}
