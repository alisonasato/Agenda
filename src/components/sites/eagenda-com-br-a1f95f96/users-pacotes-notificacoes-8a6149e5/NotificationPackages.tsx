import type { CSSProperties } from "react";
import { AddAppointmentIcon, InboxIcon, ReceiptIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";

// The live account has no credits and no purchases.
const BALANCES = [
  { label: "Saldo SMS", caption: "Créditos disponíveis para envio de SMS" },
  { label: "Saldo Email", caption: "Créditos disponíveis para envio de emails" },
  { label: "Saldo Whatsapp", caption: "Créditos disponíveis para envio de WhatsApp" },
];
const COLUMNS: [string, boolean][] = [
  ["Id da Compra", false],
  ["Data da Compra", false],
  ["Tipo de Pacote", false],
  ["Quantidade da Compra", true],
  ["Quantidade Utilizada", true],
  ["Disponível", false],
  ["Status", false],
];
const SLOTS = 10;

export function NotificationPackages() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6 hui-reveal">
        <a href={ROUTES.planos} className="hbtn hbtn--primary">
          <AddAppointmentIcon />
          Solicitar Créditos de Notificação
        </a>
        <a href={ROUTES.extrato} className="hbtn hbtn--secondary">
          <ReceiptIcon />
          Ver Transações
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 hui-reveal">
        {BALANCES.map((b) => (
          <div key={b.label} className="hui-card hui-card--flush hkpi">
            <div className="hkpi-body hkpi-body--trend">
              <p className="hkpi-label">{b.label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">0</span>
              </div>
              <p className="hkpi-caption">{b.caption}</p>
            </div>
            <div className="hkpi-spark">
              <div className="hkpi-spark-empty" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <div className="hui-reveal">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Pacotes já Adquiridos (histórico)</h2>
          </div>
          <div className="hwidget-actions">
            <a href={ROUTES.planos} className="hbtn hbtn--secondary hbtn--sm">
              <AddAppointmentIcon />
              Solicitar Créditos de Notificação
            </a>
          </div>
        </div>
        <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {COLUMNS.map(([c, num]) => (
                    <th key={c} className={`htable-col${num ? " htable-col--num" : ""}`}>
                      {c}
                    </th>
                  ))}
                  <th className="htable-col htable-col--end">Extrato de Uso</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SLOTS }, (_, i) => (
                  <tr key={i} className="htable-row--empty" aria-hidden="true">
                    {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
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
      </div>
    </>
  );
}
