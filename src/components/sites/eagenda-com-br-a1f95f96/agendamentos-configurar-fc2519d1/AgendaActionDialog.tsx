"use client";

import type { ReactNode } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { ClockSolidIcon, PauseCircleIcon, PlayCircleIcon, RefreshIcon, TrashIcon } from "../shared/icons";

/**
 * The agenda screen's alert dialogs. The cards' "Atualizar" queues the agenda for a refresh and the table's
 * recalculates its bookable times; the other three confirm what the footer buttons do.
 */
export type AgendaAction = "update" | "generate" | "activate" | "deactivate" | "delete";

type Copy = {
  heading: string;
  /** What follows the agenda's name in bold. */
  text: string;
  tone: "danger" | "accent" | "success";
  icon: ReactNode;
  confirm: string;
  confirmClass: string;
};

const ICON = "w-5 h-5";

const COPY: Record<AgendaAction, Copy> = {
  update: {
    heading: "Atualizar agenda?",
    text: "terá os horários disponíveis reprocessados.",
    tone: "accent",
    icon: <RefreshIcon className={ICON} />,
    confirm: "Atualizar",
    confirmClass: "hbtn--primary",
  },
  generate: {
    heading: "Recalcular horários?",
    text: "terá os horários disponíveis para agendamento recalculados.",
    tone: "accent",
    icon: <RefreshIcon className={ICON} />,
    confirm: "Atualizar",
    confirmClass: "hbtn--primary",
  },
  activate: {
    heading: "Ativar agenda?",
    text: "volta a aceitar novos agendamentos.",
    tone: "success",
    icon: <PlayCircleIcon className={ICON} />,
    confirm: "Ativar",
    confirmClass: "hbtn--success",
  },
  deactivate: {
    heading: "Desativar agenda?",
    text: "deixa de aceitar novos agendamentos e sai do ar para os clientes.",
    tone: "danger",
    icon: <PauseCircleIcon className={ICON} />,
    confirm: "Desativar",
    confirmClass: "hbtn--danger",
  },
  delete: {
    heading: "Excluir agenda?",
    text: "será excluída permanentemente — esta ação não pode ser desfeita.",
    tone: "danger",
    icon: <TrashIcon className={ICON} />,
    confirm: "Excluir",
    confirmClass: "hbtn--danger",
  },
};

/** `queued` is the "já está na fila" state of "update": the same dialog, with a clock and only "Fechar". */
export function AgendaActionDialog({
  action,
  name,
  queued,
  onConfirm,
  onClose,
}: {
  action: AgendaAction;
  name: string;
  queued: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const waiting = action === "update" && queued;
  const copy = waiting
    ? {
        ...COPY.update,
        heading: "Atualização já solicitada",
        text: "já está na fila para atualizar — aguarde a conclusão do processo.",
        icon: <ClockSolidIcon className={ICON} />,
      }
    : COPY[action];

  return (
    <AlertDialog
      id={`agenda-${action}-dialog`}
      heading={copy.heading}
      tone={copy.tone}
      icon={copy.icon}
      onClose={onClose}
      footer={
        waiting ? (
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Fechar
          </button>
        ) : (
          <>
            <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className={`hbtn ${copy.confirmClass}`} onClick={onConfirm}>
              {copy.confirm}
            </button>
          </>
        )
      }
    >
      <p>
        <strong className="font-semibold">{name}</strong> {copy.text}
      </p>
    </AlertDialog>
  );
}
