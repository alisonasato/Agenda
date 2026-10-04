"use client";

import { useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { AddCreditsModal } from "../shared/AddCreditsModal";
import { AlertDialog } from "../shared/AlertDialog";
import { ArrowRightIcon, DangerCircleIcon, InboxIcon, PenIcon, TrashIcon, UndoIcon, WalletIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { update, useData } from "@/lib/seiri/store";
import type { AgendaEmailTemplate } from "@/lib/seiri/types";

const COLUMNS = ["Tipo de E-mail", "Nome do Template", "Assunto do E-mail"];
const SLOTS = 10;

/** "Modelos de Email da Agenda": the templates one agenda sends for each appointment status. */
export function AgendaEmails() {
  const data = useData();
  const agendaId = useSearchParams().get("id") || data.agendas[0]?.id || "";
  const rows = data.agendaEmails.filter((t) => t.agendaId === agendaId);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AgendaEmailTemplate | null>(null);

  const remove = (id: string) => update((d) => ({ ...d, agendaEmails: d.agendaEmails.filter((t) => t.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-wrap items-center gap-2 hui-reveal">
        <button type="button" className="hbtn hbtn--secondary" onClick={() => setAdding(true)}>
          <WalletIcon />
          Adicionar Créditos
        </button>
        <a href={ROUTES.configurarAgendas} className="hbtn hbtn--tertiary">
          <UndoIcon />
          Voltar
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="hui-card hui-card--flush hkpi">
          <div className="hkpi-body hkpi-body--trend">
            <p className="hkpi-label">Templates</p>
            <div className="hkpi-value-row">
              <span className="hkpi-value">{rows.length}</span>
            </div>
            <p className="hkpi-caption">&nbsp;</p>
          </div>
          <div className="hkpi-spark">
            <div className="hkpi-spark-empty" aria-hidden="true" />
          </div>
        </div>
        <a href={ROUTES.extrato} className="hui-card hui-card--flush hkpi hkpi--link hkpi--cta">
          <div className="hkpi-body hkpi-body--trend">
            <p className="hkpi-label">AgendaCoins</p>
            <div className="hkpi-value-row">
              <span className="hkpi-value">{data.credits.general.toLocaleString("pt-BR")}</span>
            </div>
            <p className="hkpi-caption">&nbsp;</p>
          </div>
          <span className="hkpi-cta" aria-hidden="true">
            <span>Extrato</span>
            <ArrowRightIcon />
          </span>
          <div className="hkpi-spark">
            <div className="hkpi-spark-empty" aria-hidden="true" />
          </div>
        </a>
      </div>

      <div className="mt-6 hui-reveal" style={{ animationDelay: ".06s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Lista de Templates</h2>
          </div>
          <div className="hwidget-actions" />
        </div>
        <div id="email-templates-table" className="mt-4">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className="htable-col">
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--default hchip--soft hchip--sm">{row.type}</span>
                      </td>
                      <td className="htable-cell">
                        <span className="text-sm font-medium text-gray-900 inter-regular">{row.name}</span>
                      </td>
                      <td className="htable-cell htable-cell--muted">{row.subject}</td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`${ROUTES.modelosEmail}/?id=${row.id}`}
                            className="btn-icon btn-icon-sm btn-icon-flat"
                            title="Editar modelo de email"
                            aria-label="Editar modelo de email"
                          >
                            <PenIcon className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            className="btn-icon btn-icon-sm btn-icon-danger"
                            title="Excluir modelo de email"
                            aria-label="Excluir modelo de email"
                            onClick={() => setRemoving(row)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
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
        </div>
      </div>

      {adding && <AddCreditsModal onClose={() => setAdding(false)} />}
      {removing && (
        <AlertDialog
          id="tpl-delete-dialog"
          heading="Excluir este modelo de email?"
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
                <TrashIcon />
                Excluir
              </button>
            </>
          }
        >
          <p>
            O modelo <strong className="font-semibold">{removing.name}</strong> deixa de ser usado nas notificações deste status.
          </p>
        </AlertDialog>
      )}
    </div>
  );
}
