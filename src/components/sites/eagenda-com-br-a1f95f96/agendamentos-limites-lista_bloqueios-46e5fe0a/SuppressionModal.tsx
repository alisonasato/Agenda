"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { TimePicker } from "../shared/TimePicker";
import { SaveIcon } from "../shared/icons";
import { nextId, update } from "@/lib/seiri/store";
import { BLOCK_TYPES, type BlockType, type Suppression } from "@/lib/seiri/types";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const stamp = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "aaaa-mm-ddThh:mm" as the table shows it. */
export const showStamp = (at: string) => (at ? `${at.slice(0, 10).split("-").reverse().join("/")} ${at.slice(11, 16)}` : "—");

/** Clone of "Incluir bloqueio" (`/agendamentos/limites/lista_bloqueios/incluir`). */
export function SuppressionModal({ entry, onClose }: { entry?: Suppression; onClose: () => void }) {
  const today = new Date();
  const [type, setType] = useState<string>(entry?.type ?? "email");
  const [contact, setContact] = useState(entry?.contact ?? "");
  const [day, setDay] = useState<Date | null>(entry?.expiresAt ? new Date(`${entry.expiresAt.slice(0, 10)}T00:00:00`) : null);
  const [time, setTime] = useState(entry?.expiresAt.slice(11, 16) ?? "");
  const [reason, setReason] = useState(entry?.reason ?? "");

  const ready = Boolean(type && contact.trim());

  const save = () => {
    if (!ready) return;
    update((d) => {
      const row: Suppression = {
        id: entry?.id ?? nextId("sp", d.suppressions),
        type: type as BlockType,
        contact: contact.trim(),
        reason: reason.trim(),
        // The original builds expires_at out of the two fields, defaulting the time to midnight.
        expiresAt: day ? `${iso(day)}T${time || "00:00"}` : "",
        createdAt: entry?.createdAt ?? stamp(new Date()),
        createdBy: entry?.createdBy ?? "Maria Souza",
        active: entry?.active ?? true,
      };
      return { ...d, suppressions: entry ? d.suppressions.map((s) => (s.id === entry.id ? row : s)) : [...d.suppressions, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="suppression-form-modal"
      title={entry ? "Editar bloqueio" : "Incluir bloqueio"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" disabled={!ready} onClick={save}>
            <SaveIcon className="w-4 h-4" />
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Combobox
          id="data_type"
          label="Tipo de Dado"
          required
          options={BLOCK_TYPES}
          value={type}
          onChange={setType}
          placeholder="Selecione"
          clearable={false}
        />

        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_contact">
            Contato <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input
              id="id_contact"
              name="contact"
              className="hinput"
              type="text"
              placeholder="E-mail ou telefone"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_expires_at">
                Remover Bloqueio em
              </label>
              <div className="mt-1.5">
                <DatePicker id="id_expires_at" name="expires_at_day" ariaLabel="Remover Bloqueio em" value={day} onChange={setDay} today={today} />
              </div>
              <p className="hinput-desc">Em branco = bloqueio por tempo indeterminado.</p>
            </div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_expires_time">
                Horário
              </label>
              <div className="mt-1.5">
                <TimePicker id="id_expires_time" name="expires_at_time" ariaLabel="Horário" value={time} onChange={setTime} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="id_reason" className="hinput-label">
            Motivo
          </label>
          <textarea
            name="reason"
            id="id_reason"
            rows={3}
            className="htextarea mt-1.5"
            placeholder="Motivo do bloqueio (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
