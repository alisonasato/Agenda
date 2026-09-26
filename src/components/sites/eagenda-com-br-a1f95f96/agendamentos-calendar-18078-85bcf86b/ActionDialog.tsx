"use client";

import { useState } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { CalendarIcon, CheckReadIcon, CloseCircleIcon, DangerCircleIcon, TrashIcon } from "../shared/icons";
import type { Status } from "@/lib/seiri/types";

export type CalendarAction = "accept" | "reject" | "attend" | "no_show" | "cancel" | "sync_ga";

/** The confirmations the original opens before it touches an appointment. */
const DIALOGS: Record<
  CalendarAction,
  { heading: string; confirm: string; tone: "success" | "danger"; icon: React.ReactNode; text: (name: string) => string; status?: Status; payment?: boolean }
> = {
  accept: {
    heading: "Aceitar Agendamento",
    confirm: "Aceitar",
    tone: "success",
    icon: <CheckReadIcon className="w-5 h-5" />,
    text: (name) => `Confirma aceitar o agendamento de ${name}?`,
    status: "CONFIRMED",
    payment: true,
  },
  reject: {
    heading: "Rejeitar Agendamento",
    confirm: "Rejeitar",
    tone: "danger",
    icon: <CloseCircleIcon className="w-5 h-5" />,
    text: (name) => `Confirma rejeitar o agendamento de ${name}?`,
    status: "CANCELED",
  },
  attend: {
    heading: "Registrar Chegada",
    confirm: "Confirmar Chegada",
    tone: "success",
    icon: <CheckReadIcon className="w-5 h-5" />,
    text: (name) => `Confirma registrar a chegada de ${name}?`,
    status: "ATTENDED",
  },
  no_show: {
    heading: "Registrar Não Comparecimento",
    confirm: "Confirmar",
    tone: "danger",
    icon: <DangerCircleIcon className="w-5 h-5" />,
    text: (name) => `Confirma o não comparecimento de ${name}?`,
    status: "NO_SHOW",
  },
  cancel: {
    heading: "Cancelar Agendamento",
    confirm: "Cancelar Agendamento",
    tone: "danger",
    icon: <TrashIcon className="w-5 h-5" />,
    text: (name) => `Confirma cancelar o agendamento de ${name}?`,
    status: "CANCELED",
  },
  sync_ga: {
    heading: "Sincronizar Google Agenda",
    confirm: "Sincronizar",
    tone: "success",
    icon: <CalendarIcon className="w-5 h-5" />,
    text: () => "O horário será sincronizado com o Google Agenda.",
  },
};

/** The status an action leaves the appointment in, or undefined when it changes nothing. */
export const statusOf = (action: CalendarAction) => DIALOGS[action].status;

export function ActionDialog({ action, name, onClose, onConfirm }: { action: CalendarAction; name: string; onClose: () => void; onConfirm: () => void }) {
  const dialog = DIALOGS[action];
  const [paid, setPaid] = useState(false);

  return (
    <AlertDialog
      id={`calendar-action-${action}`}
      heading={dialog.heading}
      icon={dialog.icon}
      tone={dialog.tone}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={`hbtn hbtn--${dialog.tone}`} onClick={onConfirm}>
            {dialog.confirm}
          </button>
        </>
      }
    >
      <p>{dialog.text(name)}</p>
      {dialog.payment && (
        <label className="hcheckbox mt-3">
          <input type="checkbox" className="hcheckbox-input" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          <span className="hcheckbox-box" aria-hidden="true">
            <svg className="hcheckbox-check" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline
                className="hcheckbox-check-line"
                points="1 9 7 14 15 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hcheckbox-dash" aria-hidden="true" />
          </span>
          <span className="hcheckbox-label">Pagamento realizado externamente</span>
        </label>
      )}
    </AlertDialog>
  );
}
