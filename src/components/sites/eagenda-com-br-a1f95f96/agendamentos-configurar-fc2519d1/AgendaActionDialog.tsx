"use client";

import { AlertDialog } from "../shared/AlertDialog";
import { ClockSolidIcon, RefreshIcon } from "../shared/icons";

/** The cards' "Atualizar" queues the agenda for a refresh; the table's "Atualizar" recalculates its bookable times. */
export type AgendaAction = "update" | "generate";

/** The original's two accent dialogs, filled with the agenda's name. `queued` is the "já está na fila" state of the first. */
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
  const heading = action === "generate" ? "Recalcular horários?" : waiting ? "Atualização já solicitada" : "Atualizar agenda?";
  const what =
    action === "generate"
      ? "terá os horários disponíveis para agendamento recalculados."
      : waiting
        ? "já está na fila para atualizar — aguarde a conclusão do processo."
        : "terá os horários disponíveis reprocessados.";

  return (
    <AlertDialog
      id={action === "generate" ? "agenda-generate-dialog" : "agenda-update-dialog"}
      heading={heading}
      tone="accent"
      icon={waiting ? <ClockSolidIcon className="w-5 h-5" /> : <RefreshIcon className="w-5 h-5" />}
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
            <button type="button" className="hbtn hbtn--primary" onClick={onConfirm}>
              Atualizar
            </button>
          </>
        )
      }
    >
      <p>
        <strong className="font-semibold">{name}</strong> {what}
      </p>
    </AlertDialog>
  );
}
