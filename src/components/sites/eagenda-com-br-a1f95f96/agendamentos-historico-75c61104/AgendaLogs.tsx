"use client";

import { useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { ClockIcon, InboxIcon, SettingsIcon, UndoIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { ScrollRail } from "../shared/ScrollRail";
import { useData } from "@/lib/seiri/store";

const TABS = [
  {
    id: "config",
    label: "Configurações",
    desc: "Alterações de configuração desta agenda",
    columns: ["Data", "Usuário", "Ação", "Campo", "Valor Anterior", "Novo Valor"],
  },
  { id: "hours", label: "Horários", desc: "Alterações nas janelas de atendimento", columns: ["Data", "Usuário", "Ação", "Dia", "Começo", "Fim"] },
] as const;
type Tab = (typeof TABS)[number]["id"];

const PAGE = 10;
/** The original paints "Criar" and "Adicionar" as the accent chip and the rest as the plain one. */
const accentActions = ["Criar", "Adicionar"];

/** An agenda's "Logs": every change to its settings and to its opening hours. */
export function AgendaLogs() {
  const data = useData();
  const agendaId = useSearchParams().get("id") || data.agendas[0]?.id || "";
  const agenda = data.agendas.find((a) => a.id === agendaId);
  const [tab, setTab] = useState<Tab>("config");
  const [user, setUser] = useState("");
  const [page, setPage] = useState(1);

  const view = TABS.find((t) => t.id === tab)!;
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const all = data.agendaLogs.filter((l) => l.agendaId === agendaId && l.kind === tab && (!user || l.user === user));
  const users = [...new Set(data.agendaLogs.filter((l) => l.agendaId === agendaId).map((l) => l.user))];
  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  const current = Math.min(page, pages);
  const rows = all.slice((current - 1) * PAGE, current * PAGE);
  const filtered = Boolean(user);

  const go = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
      <div className="min-w-0 hui-reveal">
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <div className="md:order-2 md:ml-auto shrink-0">
            <div className="htabs" role="tablist" aria-label="Configurações ou horários" style={{ "--htabs-count": TABS.length } as CSSProperties}>
              <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${tabIndex} * 100%))` }} />
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`htabs-tab${t.id === tab ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={t.id === tab}
                  onClick={() => go(t.id)}
                >
                  <span className="htabs-tab-icon" aria-hidden="true">
                    {t.id === "config" ? <SettingsIcon /> : <ClockIcon />}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto md:order-1 flex items-center min-w-0">
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              {/* The original's period picker has nothing to filter here: the clone's log is one day. */}
              <span className="hinline-trigger hinline-trigger--bare">
                <span className="hinline-label">Últimos 12 meses</span>
              </span>
              <select className="hinline-trigger hinline-trigger--bare" aria-label="Usuário" value={user} onChange={(e) => setUser(e.target.value)}>
                <option value="">Usuário</option>
                {users.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <span className="hactionbar-sep" aria-hidden="true" />
              <a href={ROUTES.configurarAgendas} className="hbtn hbtn--ghost hbtn--sm">
                <UndoIcon />
                Voltar
              </a>
            </ScrollRail>
          </div>
        </div>
      </div>

      <div id="logs-section-head" className="mt-6">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">{agenda?.name ?? "Agenda"}</h2>
            <p className="hwidget-desc">{view.desc}</p>
          </div>
          <div className="hwidget-actions" />
        </div>
      </div>

      <div id="logs-container" className="mt-4 min-w-0 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {view.columns.map((c) => (
                    <th key={c} className="htable-col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="htable-cell whitespace-nowrap">
                      <span className="text-sm text-gray-700 inter-regular">{row.at}</span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className="text-sm text-gray-900 inter-regular">{row.user}</span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className={`hchip ${accentActions.includes(row.action) ? "hchip--accent" : "hchip--default"} hchip--primary hchip--sm`}>
                        {row.action}
                      </span>
                    </td>
                    <td className="htable-cell">
                      <span className="text-sm text-gray-900 inter-semibold font-semibold">{row.field}</span>
                    </td>
                    <td className="htable-cell">
                      <span className={`text-sm inter-regular ${row.before === "Nenhum" ? "text-gray-400" : "text-gray-500"}`}>{row.before}</span>
                    </td>
                    <td className="htable-cell">
                      {row.color ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-3.5 h-3.5 rounded border border-gray-200" style={{ backgroundColor: row.after }} />
                          <span className="text-sm text-gray-900 inter-semibold font-semibold">{row.after}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-gray-900 inter-semibold font-semibold">{row.after}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, PAGE - rows.length) }, (_, i) => (
                  <tr key={i} className="htable-row--empty" aria-hidden="true">
                    {view.columns.map((c) => (
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
                <h3 className="hempty-title nunito-bold">{filtered ? "Nenhuma Alteração Encontrada" : "Nenhuma alteração registrada"}</h3>
                <p className="hempty-desc inter-regular">
                  {filtered
                    ? "Nenhuma alteração corresponde ao período ou ao usuário selecionado. Ajuste ou limpe os filtros."
                    : "As alterações de configuração desta agenda aparecerão nesta lista."}
                </p>
              </div>
            </div>
          )}
          <div className="htable-footer">
            {all.length > 0 && (
              <div className="htable-pagination">
                <span className="htable-pg-info">
                  {(current - 1) * PAGE + 1}–{Math.min(current * PAGE, all.length)} <span className="htable-pg-info-sep">/</span> {all.length}
                </span>
                <nav className="htable-pg-nav" role="navigation" aria-label="Paginação">
                  <button
                    type="button"
                    className="htable-pg-btn htable-pg-arrow"
                    aria-disabled={current === 1}
                    aria-label="Anterior"
                    onClick={() => setPage(Math.max(1, current - 1))}
                  >
                    ‹
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
                    n === current ? (
                      <span key={n} className="htable-pg-btn is-active" aria-current="page">
                        {n}
                      </span>
                    ) : (
                      <button key={n} type="button" className="htable-pg-btn" onClick={() => setPage(n)}>
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="htable-pg-btn htable-pg-arrow"
                    aria-disabled={current === pages}
                    aria-label="Próxima"
                    onClick={() => setPage(Math.min(pages, current + 1))}
                  >
                    ›
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
