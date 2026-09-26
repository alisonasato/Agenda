"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { update, useData } from "@/lib/seiri/store";

/** "Editar Responsável": who attends the appointment, picked from the team the services name. */
export function OwnerModal({ appointmentId, onClose }: { appointmentId: string; onClose: () => void }) {
  const data = useData();
  const appointment = data.appointments.find((a) => a.id === appointmentId);
  const [owner, setOwner] = useState(appointment?.owner ?? "");
  const members = [...new Set(data.services.flatMap((s) => s.members))].sort();

  const save = () => {
    update((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === appointmentId ? { ...a, owner } : a)) }));
    onClose();
  };

  return (
    <Modal
      id="appt-owner-modal"
      title="Editar Responsável"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            Salvar
          </button>
        </>
      }
    >
      <Combobox
        id="owner_user"
        label="Responsável"
        options={members.map((m) => ({ value: m, label: m }))}
        value={owner}
        onChange={setOwner}
        placeholder="Selecione o responsável"
      />
    </Modal>
  );
}
