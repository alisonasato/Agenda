"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarEmptyIcon, ChevronLeftIcon, PenIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { ClientForm } from "../clientes-listar-43c58313/ClientForm";
import { useData } from "@/lib/seiri/store";
import { expand, formatDate, formatDuration, formatTime } from "@/lib/seiri/select";
import { STATUS_LABELS, STATUS_TONES, type Client } from "@/lib/seiri/types";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/** "11 de Outubro de 1996", the way the detail card writes a birthday. */
function longDate(text?: string) {
  const [day, month, year] = (text ?? "").split("/").map(Number);
  return day && month && year ? `${day} de ${MONTHS[month - 1]} de ${year}` : "—";
}

const addressLine = (client: Client) => {
  const a = client.address;
  if (!a) return "—";
  const line = [a.street, a.number, a.complement, a.neighborhood].filter(Boolean).join(", ");
  return [line, a.cep].filter(Boolean).join(" · ") || "—";
};

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 inter-regular">{label}</p>
      <p className="text-sm text-gray-900 inter-regular break-words">{children}</p>
    </div>
  );
}

const SLOTS = 10;

/** Clone of /clientes/<id>/: the client's card and the appointments it has. */
export function ClientDetails() {
  const data = useData();
  const id = useSearchParams().get("id");
  const client = data.clients.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);

  const rows = data.appointments
    .filter((a) => a.clientId === client?.id)
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, SLOTS);

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-start gap-3">
        <a href={ROUTES.clientes} className="hbtn hbtn--secondary">
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </a>
        <button type="button" className="hbtn hbtn--primary" disabled={!client} onClick={() => setEditing(true)}>
          <PenIcon className="w-4 h-4" />
          Editar Cadastro
        </button>
      </div>

      <div className="mt-6">
        <div className="hsection hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">Cliente</h2>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              <Item label="Nome">{client?.name ?? "—"}</Item>
              <Item label="E-mail">{client?.email || "—"}</Item>
              <Item label="Fone">{client?.phone || "—"}</Item>
              <Item label="Data de Nascimento">{longDate(client?.birthday)}</Item>
              <Item label="CPF">{client?.cpf || "—"}</Item>
              <Item label="Endereço">{client ? addressLine(client) : "—"}</Item>
              <Item label="Local de Nascimento">—</Item>
              <Item label="Gênero">{client?.gender?.toLowerCase() ?? "—"}</Item>
              <Item label="Documento de Identidade">—</Item>
              <Item label="Nacionalidade">{client?.nationality || "—"}</Item>
              <Item label="Nome da Empresa">—</Item>
              <Item label="CNPJ da Empresa">—</Item>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="hwidget-title">Agendamentos Recentes</h2>
        <div className="mt-4">
          <div
            className={`htable${rows.length ? "" : " htable-is-empty"}`}
            style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as React.CSSProperties}
          >
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Identificador</th>
                    <th className="htable-col">Agenda</th>
                    <th className="htable-col">Serviço</th>
                    <th className="htable-col">Data/Hora</th>
                    <th className="htable-col">Duração</th>
                    <th className="htable-col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const named = expand(data, row);
                    return (
                      <tr key={row.id} className="htable-row">
                        <td className="htable-cell">{row.code}</td>
                        <td className="htable-cell">{named.agendaName}</td>
                        <td className="htable-cell">{named.serviceName}</td>
                        <td className="htable-cell">{`${formatDate(row.start)} ${formatTime(row.start)}`}</td>
                        <td className="htable-cell">{formatDuration(row.duration)}</td>
                        <td className="htable-cell">
                          <span className={`hchip hchip--soft hchip--sm ${STATUS_TONES[row.status]}`}>{STATUS_LABELS[row.status]}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, k) => (
                    <tr key={`empty-${k}`} className="htable-row--empty" aria-hidden="true">
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                      <td className="htable-cell" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <CalendarEmptyIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum agendamento recente</h3>
                  <p className="hempty-desc inter-regular">Os agendamentos deste cliente aparecerão nesta lista.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {editing && client && <ClientForm editing={client} onClose={() => setEditing(false)} />}
    </div>
  );
}
