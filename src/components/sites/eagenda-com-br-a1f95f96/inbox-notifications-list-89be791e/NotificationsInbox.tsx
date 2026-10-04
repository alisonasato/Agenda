"use client";

import { useState, type CSSProperties } from "react";
import {
  BellSleepIcon,
  CheckCircleIcon,
  CheckReadIcon,
  CloseCircleIcon,
  InfoIcon,
  SoundOffIcon,
  SoundOnIcon,
  TrashIcon,
  WarningTriangleIcon,
} from "../shared/icons";
import { ScrollRail } from "../shared/ScrollRail";
import { update, useData } from "@/lib/seiri/store";
import { NOTIFICATION_LEVELS, NOTIFICATION_STATUSES, type NotificationLevel } from "@/lib/seiri/types";

const COLUMNS = ["Notificação", "Quando", "Status"];
const SLOTS = 10;

const LEVEL_ICONS: Record<NotificationLevel, typeof InfoIcon> = {
  info: InfoIcon,
  warning: WarningTriangleIcon,
  success: CheckCircleIcon,
  error: CloseCircleIcon,
};
const LEVEL_TONES: Record<NotificationLevel, string> = {
  info: "hchip--accent",
  warning: "hchip--warning",
  success: "hchip--success",
  error: "hchip--danger",
};

/** The notifications inbox the topbar's "Ver Todos" opens. */
export function NotificationsInbox() {
  const { notifications, profile } = useData();
  const [level, setLevel] = useState<"" | NotificationLevel>("");
  const [status, setStatus] = useState<"" | "unread" | "read">("");

  const rows = notifications.filter((n) => (!level || n.level === level) && (!status || (status === "read") === n.read));
  // The original tells the two empty states apart: nothing at all, or nothing matching the filters.
  const filtered = Boolean(level || status);

  const markRead = (id: string, read: boolean) => update((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read } : n)) }));
  const remove = (id: string) => update((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) }));
  const toggleSound = () => update((d) => ({ ...d, profile: { ...d.profile, notificationSound: !d.profile.notificationSound } }));

  const sound = profile.notificationSound;

  return (
    <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
      <div className="flex flex-wrap items-center gap-2 hui-reveal">
        <button
          type="button"
          id="notification-sound-toggle"
          className="hbtn hbtn--secondary hbtn--sm"
          title={sound ? "Desativar som de notificação" : "Ativar som de notificação"}
          aria-label={sound ? "Desativar som de notificação" : "Ativar som de notificação"}
          aria-pressed={sound}
          onClick={toggleSound}
        >
          {sound ? <SoundOnIcon /> : <SoundOffIcon />}
          {sound ? "Som ativado" : "Som desativado"}
        </button>
      </div>

      <div className="mt-6 md:mt-8 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="mb-3 min-w-0">
          <div id="inbox-quick-filters" className="flex flex-wrap items-center gap-3 min-w-0 w-full">
            <ScrollRail className="hrail min-w-0" trackClassName="hrail-track">
              <div className="htaggroup--nowrap htaggroup">
                {NOTIFICATION_LEVELS.map((l) => {
                  const Icon = l.value ? LEVEL_ICONS[l.value] : null;
                  return (
                    <button key={l.value} type="button" className={`htag${l.value === level ? " htag--active" : ""}`} onClick={() => setLevel(l.value)}>
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </ScrollRail>
            <ScrollRail className="hrail min-w-0 ml-auto" trackClassName="hrail-track">
              <div className="htaggroup--nowrap htaggroup">
                {NOTIFICATION_STATUSES.map((s) => (
                  <button key={s.value} type="button" className={`htag${s.value === status ? " htag--active" : ""}`} onClick={() => setStatus(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </ScrollRail>
          </div>
        </div>

        <div id="inbox-table">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "4rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                  {rows.map((row) => {
                    const Icon = LEVEL_ICONS[row.level];
                    return (
                      <tr key={row.id}>
                        <td className="htable-cell">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className={`hchip ${LEVEL_TONES[row.level]} hchip--soft hchip--sm flex-shrink-0`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className={`text-sm text-gray-900 truncate ${row.read ? "inter-regular" : "inter-semibold"}`}>{row.title}</p>
                              <p className="text-xs text-gray-500 inter-regular truncate">{row.text}</p>
                            </div>
                          </div>
                        </td>
                        <td className="htable-cell whitespace-nowrap">{row.at}</td>
                        <td className="htable-cell whitespace-nowrap">
                          <span className={`hchip ${row.read ? "hchip--default" : "hchip--accent"} hchip--primary hchip--sm`}>
                            {row.read ? "Lida" : "Não lida"}
                          </span>
                        </td>
                        <td className="htable-cell htable-cell--end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="btn-icon btn-icon-sm btn-icon-flat"
                              title={row.read ? "Marcar como não lida" : "Marcar como lida"}
                              onClick={() => markRead(row.id, !row.read)}
                            >
                              <CheckReadIcon className="w-4 h-4" />
                            </button>
                            <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Remover" onClick={() => remove(row.id)}>
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <BellSleepIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhuma notificação encontrada" : "Nenhuma notificação por aqui"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered ? "Nenhuma notificação corresponde aos filtros selecionados." : "Você será avisado quando houver novidades na sua conta."}
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
