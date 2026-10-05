"use client";

import { useSearchParams } from "next/navigation";
import { ChevronLeftIcon, InboxIcon, RefreshIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useData } from "@/lib/seiri/store";
import { TEAM_LOG_TONES } from "@/lib/seiri/types";

const COLUMNS = ["Criado em", "Agenda", "Horário", "Identificador", "Usuário", "Ação"];

/** "Histórico de Atividades de Usuários": what the team did to appointments. */
export function TeamLogs() {
  const data = useData();
  // The team page's row icon links here with ?member=<id>, so one member's trail can be read alone.
  const memberId = useSearchParams().get("member");
  const member = data.members.find((m) => m.id === memberId);
  const rows = data.teamLogs.filter((l) => !member || l.user === member.email);
  const filtered = Boolean(member);

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="mb-4 flex items-center gap-2 hui-reveal">
        <a href={ROUTES.adminEquipe} className="hbtn hbtn--secondary hbtn--sm">
          <ChevronLeftIcon className="w-4 h-4" />
          Equipe
        </a>
        {/* The original re-fetches the table; here the data is already local, so this just reloads. */}
        <a href={member ? `${ROUTES.logsEquipe}/?member=${member.id}` : ROUTES.logsEquipe} className="hbtn hbtn--secondary hbtn--sm">
          <RefreshIcon className="w-4 h-4" />
          Atualizar
        </a>
      </div>

      <div className="hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Registros</h2>
            <p className="hwidget-desc">
              Histórico de ações executadas pela equipe em agendamentos. Os registros do plano atual ficam disponíveis por 30 dias.
            </p>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div id="team-logs-table-container" className="mt-3">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`}>
            <div className="htable-scroll">
              <table className="htable-table">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className="htable-col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-900 inter-regular">{row.at}</span>
                      </td>
                      <td className="htable-cell">
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">
                          {data.agendas.find((a) => a.id === row.agendaId)?.name ?? "—"}
                        </span>
                      </td>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-900 inter-regular">{row.slotAt}</span>
                      </td>
                      <td className="htable-cell">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700 font-mono">{row.code}</code>
                      </td>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-700 inter-regular">{row.user}</span>
                      </td>
                      <td className="htable-cell">
                        <span className={`hchip ${TEAM_LOG_TONES[row.action] ?? "hchip--default"} hchip--primary hchip--sm`}>{row.action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <InboxIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum resultado encontrado" : "Nada por aqui ainda"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered
                      ? "Nenhum registro corresponde aos filtros aplicados. Ajuste ou limpe os filtros para ver mais resultados."
                      : "Assim que houver registros, eles aparecerão nesta tabela."}
                  </p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>
    </div>
  );
}
