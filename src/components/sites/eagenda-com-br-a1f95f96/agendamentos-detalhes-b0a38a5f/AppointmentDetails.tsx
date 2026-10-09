"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ActionDialog, statusOf, type CalendarAction } from "../agendamentos-calendar-18078-85bcf86b/ActionDialog";
import { CommentModal, ReceiptModal, SlotVideoModal } from "../agendamentos-calendar-18078-85bcf86b/SlotModals";
import {
  CalendarBlankIcon,
  CheckReadIcon,
  DangerCircleIcon,
  LetterIcon,
  ReceiptIcon,
  TrashIcon,
  UserCircleIcon,
  VideoIcon,
  WhatsappIcon,
} from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { update, useData } from "@/lib/seiri/store";
import { expand, formatDate, formatTime, parse } from "@/lib/seiri/select";
import { slotsOf } from "@/lib/seiri/slots";
import { STATUS_LABELS, STATUS_TONES, type Status } from "@/lib/seiri/types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** The head actions the original offers, by the status the appointment is in. */
const HEAD_ACTIONS: Record<string, { label: string; action: CalendarAction; cls: string; icon: React.ReactNode }[]> = {
  PENDING: [
    { label: "Aceitar", action: "accept", cls: "hbtn--success", icon: <CheckReadIcon className="w-4 h-4" /> },
    { label: "Rejeitar", action: "reject", cls: "hbtn--danger", icon: <DangerCircleIcon className="w-4 h-4" /> },
  ],
  CONFIRMED: [
    { label: "Marcar atendido", action: "attend", cls: "hbtn--success", icon: <CheckReadIcon className="w-4 h-4" /> },
    { label: "Não compareceu", action: "no_show", cls: "hbtn--danger", icon: <DangerCircleIcon className="w-4 h-4" /> },
    { label: "Cancelar", action: "cancel", cls: "hbtn--danger-soft", icon: <TrashIcon className="w-4 h-4" /> },
  ],
  ATTENDED: [],
  NO_SHOW: [],
  CANCELED: [],
};

/** "26/09/2026 20:41" — the stamp the original writes on a change. */
function now() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SLOTS = 2;

function Fact({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? "min-w-0 col-span-2" : "min-w-0"}>
      <dt className="appt-fact-label">{label}</dt>
      <dd className="appt-fact-value truncate">{children}</dd>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="hsection appt-card hui-card hui-card--flush">
      <div className="hsection-head">
        <div className="hsection-titles">
          <h2 className="hsection-title">{title}</h2>
        </div>
        <div className="hsection-actions">{action}</div>
      </div>
      <div className="hsection-body">{children}</div>
    </div>
  );
}

function EmptyTable({ cols, title, desc }: { cols: string[]; title: string; desc: string }) {
  return (
    <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.25rem" } as React.CSSProperties}>
      <div className="htable-scroll">
        <table className="htable-table w-full htable-fixed">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} className="htable-col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SLOTS }, (_, k) => (
              <tr key={k} className="htable-row--empty" aria-hidden="true">
                {cols.map((c) => (
                  <td key={c} className="htable-cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="htable-empty" role="status" aria-live="polite">
        <div className="hempty hempty--inline hui-reveal">
          <h3 className="hempty-title nunito-bold">{title}</h3>
          <p className="hempty-desc inter-regular">{desc}</p>
        </div>
      </div>
      <div className="htable-footer" />
    </div>
  );
}

/** Clone of /agendamentos/detalhes/<id>/: everything one appointment holds, and what can be done to it. */
export function AppointmentDetails() {
  const data = useData();
  const id = useSearchParams().get("id");
  const appointment = data.appointments.find((a) => a.id === id);
  const [tab, setTab] = useState<"notifications" | "changes">("notifications");
  const [comment, setComment] = useState(false);
  const [receipt, setReceipt] = useState(false);
  const [video, setVideo] = useState(false);
  const [confirming, setConfirming] = useState<CalendarAction | null>(null);

  if (!appointment)
    return (
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8">
        <p className="appt-fact-sub">Agendamento não encontrado.</p>
      </div>
    );

  const { client, clientName, agendaName, serviceName } = expand(data, appointment);
  const start = parse(appointment.start);
  // The link belongs to the slot, as on the calendar, so this reads and writes the same place.
  const slot = slotsOf(data, appointment.agendaId, start).find((x) => x.appointments.some((a) => a.id === appointment.id));
  const videoUrl = slot?.info.videoUrl ?? "";
  const end = new Date(start.getTime() + appointment.duration * 60000);
  const time = `${formatTime(appointment.start)} – ${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

  const apply = (status: Status, paid: boolean, label: string) =>
    update((d) => ({
      ...d,
      appointments: d.appointments.map((a) =>
        a.id !== appointment.id
          ? a
          : {
              ...a,
              status,
              paidExternally: paid || a.paidExternally,
              updatedAt: now(),
              changes: [...(a.changes ?? []), { at: now(), user: a.owner, text: label }],
            },
      ),
    }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8">
      <div className="appt-head">
        <div className="appt-head-meta min-w-0">
          <CalendarBlankIcon className="w-4 h-4 text-gray-500" />
          <span>
            {WEEKDAYS[start.getDay()]}, {formatDate(appointment.start)}
          </span>
          <span className="appt-head-dot">·</span>
          <span className="appt-head-strong">{time}</span>
          <span className="appt-head-rule" aria-hidden="true" />
          <span className="hchip hchip--default hchip--soft hchip--sm">{agendaName}</span>
          <span className="hchip hchip--accent hchip--soft hchip--sm">{serviceName}</span>
        </div>
        <div className="appt-head-actions">
          <div className="appt-head-status">
            <div className="flex flex-wrap items-center gap-2">
              {HEAD_ACTIONS[appointment.status].map((a) => (
                <button key={a.label} type="button" className={`hbtn ${a.cls} hbtn--sm`} onClick={() => setConfirming(a.action)}>
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hactionbar" role="group">
            <div className="hrail-track hactionbar-track">
              {client?.phone && (
                <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}/`} target="_blank" rel="noreferrer" className="hbtn hbtn--ghost hbtn--sm">
                  <WhatsappIcon className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
              {client?.email && (
                <a href={`mailto:${client.email}`} className="hbtn hbtn--ghost hbtn--sm">
                  <LetterIcon className="w-4 h-4" />
                  E-mail
                </a>
              )}
              <button type="button" className="hbtn hbtn--ghost hbtn--sm" onClick={() => setReceipt(true)}>
                <ReceiptIcon className="w-4 h-4" />
                Recibo
              </button>
              <span className="hactionbar-sep" aria-hidden="true" />
              <a href={ROUTES.agendamentos} className="hbtn hbtn--ghost hbtn--sm">
                Agendamentos
              </a>
              <a href={ROUTES.calendario} className="hbtn hbtn--ghost hbtn--sm">
                Calendário
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="appt-grid">
        <Card title="Cliente">
          <div className="flex items-center gap-3 min-w-0">
            <span className="havatar havatar--lg">
              <span className="havatar-fallback">{clientName.slice(0, 1)}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="appt-person-name truncate">{clientName}</p>
              <p className="appt-fact-sub">{client?.birthday ?? "—"}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <Fact label="Telefone">
              {client?.phone ? (
                <a href={`tel:${client.phone}`} className="appt-link">
                  {client.phone}
                </a>
              ) : (
                "—"
              )}
            </Fact>
            <Fact label="Documento">{client?.cpf || "—"}</Fact>
            <Fact label="E-mail" span>
              {client?.email ? (
                <a href={`mailto:${client.email}`} className="appt-link">
                  {client.email}
                </a>
              ) : (
                "—"
              )}
            </Fact>
          </dl>
          <div className="appt-card-foot">
            <a href={`${ROUTES.clienteDetalhes}/?id=${appointment.clientId}`} className="hbtn hbtn--secondary hbtn--sm">
              <UserCircleIcon className="w-4 h-4" />
              Ver cadastro
            </a>
          </div>
        </Card>

        <Card title="Atendimento">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" disabled={!slot} onClick={() => setVideo(true)}>
              <VideoIcon className="w-4 h-4" />
              {videoUrl ? "Alterar link" : "Configurar link"}
            </button>
          </div>
          {videoUrl ? (
            <p className="appt-fact-sub mt-3">
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="appt-link">
                {videoUrl}
              </a>
            </p>
          ) : (
            <p className="appt-fact-sub mt-3">O cliente ainda não recebeu um link para entrar.</p>
          )}
        </Card>

        <Card title="Cobrança">
          <p className="appt-fact-sub">Nenhuma cobrança para este agendamento.</p>
        </Card>

        <Card title="Acompanhantes">
          <p className="appt-fact-sub">Nenhum acompanhante neste agendamento.</p>
        </Card>

        <Card
          title="Comentário"
          action={
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setComment(true)}>
              Editar
            </button>
          }
        >
          <p className="appt-fact-sub">{appointment.comment || "Nenhum comentário registrado para este agendamento."}</p>
        </Card>

        <Card title="Detalhes">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Fact label="Responsável">{appointment.owner}</Fact>
            <Fact label="Agenda">{agendaName}</Fact>
            <Fact label="Criado em">{appointment.createdAt ?? "—"}</Fact>
            <Fact label="Última alteração">{appointment.updatedAt ?? appointment.createdAt ?? "—"}</Fact>
          </dl>
        </Card>
      </div>

      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
          <div className="hwidget-head">
            <div className="hwidget-titles">
              <h2 className="hwidget-title">Histórico</h2>
            </div>
            <div className="hwidget-actions" />
          </div>
          <div className="sm:ml-auto">
            <div className="htabs" role="tablist" aria-label="Seção do histórico" style={{ "--htabs-count": 2 } as React.CSSProperties}>
              <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${tab === "notifications" ? 0 : 1} * 100%))` }} />
              <button
                type="button"
                className={`htabs-tab${tab === "notifications" ? " is-active" : ""}`}
                role="tab"
                aria-selected={tab === "notifications"}
                onClick={() => setTab("notifications")}
              >
                Notificações
              </button>
              <button
                type="button"
                className={`htabs-tab${tab === "changes" ? " is-active" : ""}`}
                role="tab"
                aria-selected={tab === "changes"}
                onClick={() => setTab("changes")}
              >
                Alterações
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {tab === "notifications" ? (
            <EmptyTable
              cols={["Canal", "Mensagem", "Destino", "Data", "Situação"]}
              title="Nada por aqui ainda"
              desc="Assim que houver registros, eles aparecerão nesta tabela."
            />
          ) : appointment.changes?.length ? (
            <div className="htable" style={{ "--htable-row-h": "3.25rem" } as React.CSSProperties}>
              <div className="htable-scroll">
                <table className="htable-table w-full htable-fixed">
                  <thead>
                    <tr>
                      <th className="htable-col">Data / Hora</th>
                      <th className="htable-col">Usuário</th>
                      <th className="htable-col">Alteração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointment.changes.map((c, k) => (
                      <tr key={k} className="htable-row">
                        <td className="htable-cell whitespace-nowrap">{c.at}</td>
                        <td className="htable-cell">{c.user}</td>
                        <td className="htable-cell">{c.text}</td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, SLOTS - appointment.changes.length) }, (_, k) => (
                      <tr key={`e-${k}`} className="htable-row--empty" aria-hidden="true">
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="htable-footer" />
            </div>
          ) : (
            <EmptyTable
              cols={["Data / Hora", "Usuário", "Alteração"]}
              title="Nenhuma alteração registrada"
              desc="As mudanças de status deste agendamento aparecerão aqui."
            />
          )}
        </div>
      </div>

      {comment && <CommentModal appointmentId={appointment.id} onClose={() => setComment(false)} />}
      {receipt && <ReceiptModal appointmentId={appointment.id} onClose={() => setReceipt(false)} />}
      {video && slot && <SlotVideoModal slot={slot} onClose={() => setVideo(false)} />}
      {confirming && (
        <ActionDialog
          action={confirming}
          name={clientName}
          onClose={() => setConfirming(null)}
          onConfirm={(paid) => {
            const status = statusOf(confirming);
            if (status) apply(status, paid, STATUS_LABELS[status]);
            setConfirming(null);
          }}
        />
      )}
    </div>
  );
}

/** The topbar the original shows for this page: client, status and the appointment's key. */
export function AppointmentDetailsHeader() {
  const data = useData();
  const id = useSearchParams().get("id");
  const appointment = data.appointments.find((a) => a.id === id);
  const name = appointment ? expand(data, appointment).clientName : "Agendamento";

  return (
    <div className="appt-topbar-id min-w-0">
      <h1 className="truncate text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-slate-900 nunito-bold">{name}</h1>
      {appointment && (
        <>
          <span className={`flex-shrink-0 hchip hchip--sm ${STATUS_TONES[appointment.status]}`}>{STATUS_LABELS[appointment.status].toUpperCase()}</span>
          <span title="Identificador do agendamento" className="appt-topbar-key hidden sm:inline-flex hchip hchip--default hchip--soft hchip--sm">
            {appointment.code}
          </span>
        </>
      )}
    </div>
  );
}
